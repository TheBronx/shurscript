(function ($, createModule, undefined) {
	'use strict';

	var mod = createModule({
		id: 'ThreadUpdater',
		name: 'Actualiza las nuevas respuestas de un hilo',
		author: 'Electrosa',
		version: '0.1',
		description: 'Dentro de un hilo, se añadirán nuevas respuestas automáticamente sin necesidad de recargar la página.',
		domain: ['/showthread.php'],
		initialPreferences: {
			enabled: true,
			activeTabPeriodicity: 10000,
			hiddenTabPeriodicity: 30000,
			nextPageButton: false
		},
		preferences: {}
	});

	mod.getPreferenceOptions = function () {
		var creOpt = mod.helper.createPreferenceOption;

		return [
			creOpt({
				type: 'radio',
				elements: [
					{value: 5000, caption: 'Cada 5 segundos.'},
					{value: 10000, caption: 'Cada 10 segundos.'},
					{value: 30000, caption: 'Cada 30 segundos.'}
				],
				caption: 'Si la pestaña está en primer plano, buscar nuevas respuestas:',
				mapsTo: 'activeTabPeriodicity'
			}),
			creOpt({
				type: 'radio',
				elements: [
					{value: 10000, caption: 'Cada 10 segundos.'},
					{value: 30000, caption: 'Cada 30 segundos.'},
					{value: 60000, caption: 'Cada minuto.'},
					{value: 'off', caption: 'No buscar nuevas respuestas.', subCaption: 'Al entrar en la pestaña se buscarán nuevas respuestas.'}
				],
				caption: 'Si la pestaña no está en primer plano, buscar nuevas respuestas:',
				mapsTo: 'hiddenTabPeriodicity'
			}),
			creOpt({
				type: 'checkbox', mapsTo: 'nextPageButton', caption: 'Mostrar siempre el botón para ir a la siguiente página, no solo cuando haya una nueva.'
			})
		];
	};

	mod.normalStartCheck = function () {
		return true;
	};

	var numPostsBefore;// cantidad de posts al cargar el hilo
	var isLastPage;// ¿estamos en la última página del hilo?
	var isOpen = true;// ¿está abierto el hilo? si está cerrado el módulo no se ejecuta
	var newPostsElem, newPostsShown = false;// botón que el usuario debe pulsar para cargar los nuevos posts
	var posts = [];
	var pageTitle = document.title;
	var timeoutId, timeoutTime;// id (para clearTimeout), y fecha/hora en la que se debería ejecutar
	var thread, page;

	mod.normalStartCheck = function () {
		return ! SHURSCRIPT.environment.thread.isClosed;
	};

	mod.onNormalStart = function () {
		numPostsBefore = document.getElementById("posts").children.length - 1;
		isLastPage = document.getElementsByClassName("pagenav").length
			? document.getElementsByClassName("pagenav")[0].querySelector("a[rel='next']") === null
			: true;// solo hay una página

		thread = SHURSCRIPT.environment.thread.id;
		page = SHURSCRIPT.environment.thread.page;

		// comprobar si hay nuevos posts si la página no está completa o es la última
		if (numPostsBefore < 30 || isLastPage) {
			// comprobar más tarde de nuevo si hay nuevos posts
			createTimeout();

			// crear el elemento ya para poder reservar su hueco
			createButton();

			/* Añadir evento para saber cuándo la pestaña adquiere el foco */
			document.addEventListener("visibilitychange", function () {
				var timeNow = +new Date();
				var remaining = timeoutTime - (+new Date());// tiempo restante para el timeout

				var timeoutActive = stopTimeout();

				if (document.hidden) {
					// si no está desactivado, crear el timeout con el nuevo tiempo, teniendo en cuenta que ahora la pestaña está oculta
					if (mod.preferences.hiddenTabPeriodicity !== 'off') {
						// comprobar si hay un timeout activo, en caso contrario no crear otro
						if (timeoutActive) {
							createTimeout(mod.preferences.hiddenTabPeriodicity - mod.preferences.activeTabPeriodicity + remaining);
						}
					}
				} else {
					if (mod.preferences.hiddenTabPeriodicity !== 'off' && remaining > mod.preferences.activeTabPeriodicity) {
						// comprobar si hay un timeout activo, en caso contrario no crear otro
						if (timeoutActive) {
							createTimeout(mod.preferences.activeTabPeriodicity - mod.preferences.hiddenTabPeriodicity + remaining);
						}
					} else {
						// cargar el hilo ya
						loadThread();
					}
				}
			});

			/* Respuesta rápida */
			// controlar cuándo se envía el formulario
			document.getElementById("qrform").addEventListener("submit", function () {
				// quitar timeout actual
				stopTimeout();

				// ocultar el botón
				newPostsElem.style.display = "none";
				newPostsElem.textContent = "";
				newPostsShown = false;

				// restablecer el título
				document.title = pageTitle;
			});

			// reescribir la función que se encarga de recibir el post para añadir más funcionalidad
			var qr_do_ajax_post_original = unsafeWindow.qr_do_ajax_post;
			unsafeWindow.qr_do_ajax_post = function (ajax) {
				qr_do_ajax_post_original(ajax);// función original

				// comprobar si en el XML de respuesta hay <postbits>
				// en caso contrario es que ha salido el mensaje "debes esperar 30 segundos"
				if (ajax.responseXML.children[0].nodeName === "postbits") {
					// mirar número de respuestas ahora
					numPostsBefore += ajax.responseXML.children[0].children.length - 1;

					// comprobar si se ha llenado la página
					if (numPostsBefore <= 30) {
						// activar el timeout de nuevo
						createTimeout();
					} else {
						// mostrar enlace para ir a la siguiente página
						newPosts(0, true);
					}
				} else {
					// si ha habido un error vuelve a mostrar el aviso
					loadThread();
				}
			};
		} else if (mod.preferences.nextPageButton) {
			createButton();
			newPosts(0, 'Ir a la página siguiente');
		}
	};

	function createButton() {
		GM_addStyle("#shurscript-newposts {width:100%; margin:0; height: 32px; padding: 0; line-height: 200%;}");

		var shurscriptWrapper = document.createElement("div");
		shurscriptWrapper.className = "shurscript";
		newPostsElem = document.createElement("a");
		newPostsElem.id = "shurscript-newposts";
		newPostsElem.className = "btn btn-success";
		newPostsElem.style.display = "none";
		newPostsElem.href = "#";
		newPostsElem.onclick = populateNewPosts;
		shurscriptWrapper.appendChild(newPostsElem);

		var postsElem = document.getElementById("posts");// añadirlo después de #posts
		postsElem.parentNode.insertBefore(shurscriptWrapper, postsElem.nextSibling);
	}

	/**
	 * Crea un timeout para que ejecute la comprobación de nuevas respuestas tras el tiempo que se especifique.
	 * @param {int} interval (opcional) Tiempo en milisegundos que se esperará hasta ejecutar la función.
	 *                                  Si no se especifica, se calculará el tiempo en función de las preferencias del usuario.
	 * @return {int} El id del timeout o <code>null</code> si no se ha creado.
	 */
	function createTimeout(interval) {
		if (! interval) {
			if (document.hidden) {
				if (mod.preferences.hiddenTabPeriodicity === 'off') {
					return null;
				} else {
					interval = parseInt(mod.preferences.hiddenTabPeriodicity);
				}
			} else {
				interval = parseInt(mod.preferences.activeTabPeriodicity);
			}
		}

		timeoutId = setTimeout(loadThread, interval);
		timeoutTime = +new Date() + interval;

		return timeoutId;
	}

	/**
	 * @return {bool} Si había un timeout activo o no.
	 */
	function stopTimeout() {
		var timeoutActive = false;

		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutActive = true;
		}

		timeoutId = null;
		timeoutTime = null;

		return timeoutActive;
	}

	function loadThread() {
		stopTimeout();

		if ((numPostsBefore < 30 || isLastPage) && isOpen) {
			var xmlhttp = new XMLHttpRequest();

			xmlhttp.onreadystatechange = function () {
				if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
					var html = xmlhttp.responseText;
					var parser = new DOMParser();
					var doc = parser.parseFromString(html, "text/html");

					var numPostsPrevious = posts.length;
					var isLastPagePrevious = isLastPage;

					posts = doc.querySelectorAll("#posts > div[align]");
					var numPostsAfter = posts.length;
					isLastPage = doc.getElementsByClassName("pagenav").length
						? doc.getElementsByClassName("pagenav")[0].querySelector("a[rel='next']") === null
						: true;
					isOpen = doc.getElementById("qrform") !== null;

					const _newPosts = numPostsBefore !== numPostsAfter && numPostsAfter !== numPostsPrevious;
					const _newPage = isLastPage !== isLastPagePrevious;

					// comprobar si hay nuevos posts y si no hay posts nuevos respecto a la última vez
					if (_newPosts || _newPage) {
						newPosts(numPostsAfter - numPostsBefore, _newPage);
					}

					// volver a comprobar
					createTimeout();
				}
			};

			xmlhttp.open("GET", "/foro/showthread.php?t=" + thread + "&page=" + page, true);
			xmlhttp.send();
		}
	}

	/**
	 * Muestra un botón para mostrar los nuevos posts o cargar la siguiente página.
	 * @param {int} numPosts Número de posts nuevos. Si es int(0), se crea un enlace a la siguiente página.
	 * @param {bool} newPage Existe una nueva página.
	 */
	function newPosts(numPosts, newPage) {
		// mostrar el elemento si está oculto
		if (! newPostsShown) {
			$(newPostsElem).slideDown("slow");
			newPostsShown = true;
		}

		// cambiar el título
		// En Firefox, al actualizar el título de la página, la pestaña (si está fijada) se marca como actualizada - https://i.imgur.com/qWb3sF9.png
		// Si el usuario ha entrado a la pestaña el aviso se va, por eso cambio el título de nuevo (con timeout) para que vuelva a aparecer el aviso si hay más posts nuevos.
		if (typeof newPage !== 'string') {
			document.title = pageTitle;
			setTimeout(function () { document.title = "*" + pageTitle; }, 1);
		}

		// mostrar el enlace a nueva página si ya se han cargado todos los posts de la página que estemos
		if (newPage && numPosts === 0) {
			if (newPage === true) {
				newPage = "Hay una nueva página";
			}

			// enlace a la nueva página
			newPostsElem.textContent = newPage;
			newPostsElem.href = "showthread.php?t=" + thread + "&page=" + (+page + 1);
			newPostsElem.onclick = undefined;
		} else {
			// actualizar con el número de posts nuevos
			newPostsElem.textContent = numPosts === 1 ? "Hay un post nuevo." : "Hay " + numPosts + " posts nuevos.";
		}
	}

	/**
	 * Muestra los posts nuevos.
	 * @return false Para detener el evento.
	 */
	function populateNewPosts() {
		// ocultar el botón
		newPostsElem.style.display = "none";
		newPostsElem.textContent = "";
		newPostsShown = false;

		// restablecer el título
		document.title = pageTitle;

		// añadir los posts
		var postsElem = document.getElementById("posts");
		var lastPostElem = document.getElementById("lastpost");
		var numPostsAfter = posts.length;

		for (var i = numPostsBefore, n = numPostsAfter; i < n; i++) {
			var postId = posts[i].getElementsByTagName("table")[0].id.substr(4);

			// añadir el post al DOM
			var newNode = postsElem.insertBefore(posts[i], lastPostElem);

			// ejecutar los scripts recibidos (popup menú usuario, vídeos, multicita)
			unsafeWindow.PostBit_Init(newNode, postId);
			unsafeWindow.parseScript(posts[i].innerHTML);
		}

		// disparar evento para avisar de nuevos posts
		SHURSCRIPT.eventbus.trigger('newposts', numPostsBefore);

		// actualizar variable para respuesta rápida, determinará el número de posts a cargar la próxima vez
		unsafeWindow.ajax_last_post = (+new Date()) / 1000;

		// ahora el hilo tiene varios posts más
		numPostsBefore = numPostsAfter;

		// si hay nueva página, mostrar inmediatamente el botón
		if (! isLastPage) {
			newPosts(0, true);
		}

		return false;
	}
})(jQuery, SHURSCRIPT.moduleManager.createModule);
