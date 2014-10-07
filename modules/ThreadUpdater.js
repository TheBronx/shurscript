(function ($, createModule, undefined) {
	'use strict';

	var mod = createModule({
		id: 'ThreadUpdater',
		name: 'Actualiza las nuevas respuestas de un hilo',
		author: 'Electrosa',
		version: '0.2',
		description: 'Dentro de un hilo, se añadirán nuevas respuestas automáticamente sin necesidad de recargar la página.',
		domain: ['/showthread.php'],
		initialPreferences: {
			enabled: true,
			activeTabPeriodicity: 10000,
			hiddenTabPeriodicity: 30000,
			loadAutomatically: false,
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
				type: 'checkbox', mapsTo: 'loadAutomatically', caption: 'Cargar nuevos posts automáticamente.'
			}),
			creOpt({
				type: 'checkbox', mapsTo: 'nextPageButton', caption: 'Mostrar siempre el botón para ir a la siguiente página, no solo cuando haya una nueva.'
			})
		];
	};

	var numPostsBefore;// cantidad de posts al cargar el hilo
	var isLastPage;// ¿estamos en la última página del hilo?
	var isOpen = true;// ¿está abierto el hilo? si está cerrado el módulo no se ejecuta
	var newPostsElem, newPostsShown = false;// botón que el usuario debe pulsar para cargar los nuevos posts
	var posts = [];// contiene todos los posts, incluyendo los nuevos y las ediciones
	var shownPosts;// contiene los posts que se están mostrando
	var differences;// contiene los posts que han cambiado (nuevos, editados y borrados)
	var pageTitle = document.title;
	var cancelar = false;
	var timeoutId, timeoutTime;// id (para clearTimeout), y fecha/hora en la que se debería ejecutar
	var thread, page;

	var Post = function (element) {
		this.element = element;
		var table = this.element.find('table').first();
		this.elementTable = table;
		this.id = parseInt(table.attr('id').replace('post',''));
		this.href = '/showthread.php?p=' + this.id;
		this.content = this.element.find('#post_message_' + this.id);
		this.postcount = parseInt(this.element.find('#postcount' + this.id + ' strong').html());
		var user = this.element.find('#postmenu_' + this.id + ' .bigusername');
		this.author = user.html();
		this.author_link = user.attr('href');
	};

	mod.normalStartCheck = function () {
		return ! SHURSCRIPT.environment.thread.isClosed;
	};

	mod.onNormalStart = function () {
		shownPosts = document.querySelectorAll("#posts > div[align]");
		numPostsBefore = shownPosts.length;
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
				cancelar = true;
				// quitar timeout actual
				stopTimeout();

				// ocultar el botón
				showButton(false);

				// restablecer el título
				document.title = pageTitle;
			});

			// reescribir la función que se encarga de recibir el post para añadir más funcionalidad
			var qr_do_ajax_post_original = unsafeWindow.qr_do_ajax_post;
			/**
			 * @param ajax XMLHttpRequest | integer
			 */
			var qr_do_ajax_post_new = function (ajax) {
				var numNewPosts;
				if (typeof ajax === 'number') {
					numNewPosts = ajax;
				} else if (typeof ajax === 'object') {
					qr_do_ajax_post_original(ajax);// función original
					
					// comprobar si en el XML de respuesta hay <postbits>
					// en caso contrario es que ha salido el mensaje "debes esperar 30 segundos"
					if (ajax.responseXML.children[0].nodeName !== 'postbits') {
						// si ha habido un error vuelve a mostrar el botón
						loadThread();
						return;
					} else {
						// mirar número de respuestas ahora
						numNewPosts = ajax.responseXML.children[0].children.length - 1;
						
						// lanzar evento
						SHURSCRIPT.eventbus.trigger('newposts', numNewPosts);
					}
				} else {
					return;
				}
				
				numPostsBefore += numNewPosts;

				// actualizar el listado de posts que están visibles (todos los posts cargados se meten en un <div>)
				shownPosts = document.querySelectorAll("#posts > div[align], #posts > div > div[align]");

				// comprobar si se ha llenado la página
				if (numPostsBefore <= 30) {
					// activar el timeout de nuevo
					createTimeout();
				} else {
					// mostrar enlace para ir a la siguiente página
					showButton("Hay una nueva página", "showthread.php?t=" + thread + "&page=" + (+page + 1));
				}
			};
			if (typeof exportFunction === 'function') {
				// exportar la función para recibir eventos al objeto window
				exportFunction(SHURSCRIPT.eventbus.trigger, unsafeWindow, {defineAs: 'SHURSCRIPT_triggerEvent'});
				
				// función especial para firefox
				var qr_do_ajax_post_firefox = function (ajax) {
					window.qr_do_ajax_post_original(ajax);
					if (ajax.responseXML.children[0].nodeName === 'postbits') {
						window.SHURSCRIPT_triggerEvent('newposts', ajax.responseXML.children[0].children.length - 1);
					}
				}
				
				// reescribir la función `qr_do_ajax_post` inyectando un script en la cabecera de la página
				var script = document.createElement('script'); 
				script.type = "text/javascript"; 
				script.innerHTML = '\
						window.qr_do_ajax_post_original = window.qr_do_ajax_post;\
						window.qr_do_ajax_post = ' + qr_do_ajax_post_firefox.toString() + ';';
				document.getElementsByTagName('head')[0].appendChild(script);
				
				// como no se permite redefinir funciones, obtengo los datos mediante un evento
				SHURSCRIPT.eventbus.on('newposts', function (event, numNewPosts) {
					qr_do_ajax_post_new(numNewPosts);
				});
			} else {
				unsafeWindow.qr_do_ajax_post = qr_do_ajax_post_new;
			}
		} else if (mod.preferences.nextPageButton) {
			createButton();
			showButton("Ir a la página siguiente", "showthread.php?t=" + thread + "&page=" + (+page + 1));
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
					interval = +mod.preferences.hiddenTabPeriodicity;
				}
			} else {
				interval = +mod.preferences.activeTabPeriodicity;
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

					var isLastPagePrevious = isLastPage;

					posts = doc.querySelectorAll("#posts > div[align]");
					isLastPage = doc.getElementsByClassName("pagenav").length
						? doc.getElementsByClassName("pagenav")[0].querySelector("a[rel='next']") === null
						: true;
					isOpen = doc.getElementById("qrform") !== null;

					differences = findDifferences(shownPosts, posts);
					var _newPosts = differences.new.length !== 0;
					var _newPage = isLastPage !== isLastPagePrevious;
					var _editedPosts = differences.edited.length !== 0;
					var _deletedPosts = differences.deleted.length !== 0;

					if (numPostsBefore === differences.deleted.length) {// si se han borrado todos los posts, posible "Tema especificado inválido" a la vista. lo comprobamos.
						var node = doc.querySelector(".panelsurround center");

						if (node && node.textContent === "Tema especificado inválido.") {// mostrar aviso (bootstrap) y terminar
							stopTimeout();

							bootbox.alert("ATENCIÓN: Este tema ha sido eliminado (tema especificado inválido).");

							showButton("Este tema ha sido eliminado. No recargues la página si quieres seguir viéndolo.", "#");
						}
					}
					// comprobar si hay nuevos posts y si no hay posts nuevos respecto a la última vez
					else if (_newPosts || _editedPosts || _deletedPosts || newPostsShown) {
						newPosts(differences.new, differences.edited, differences.deleted);
						createTimeout();
					} else if (_newPage) {
						showButton("Hay una nueva página", "showthread.php?t=" + thread + "&page=" + (+page + 1));
					} else {
						createTimeout();
					}
				}
			};
			xmlhttp.open("GET", "/foro/showthread.php?t=" + thread + "&page=" + page, true);
			xmlhttp.send();
		}
	}

	/**
	 * Busca las diferencias entre un array de posts y otro.
	 * @param arrayOldPosts Array con los posts antiguos.
	 * @param arrayNewPosts Array con los posts nuevos.
	 * @return Un objeto que contiene clasificados en tres arrays los posts que han cambiado.
	 */
	function findDifferences(arrayOldPosts, arrayNewPosts) {
		var oldPosts = {}, newPosts = {};

		for (var i = 0, n = arrayOldPosts.length; i < n; i++) {
			var post = arrayOldPosts[i].getElementsByClassName("alt1")[0];
			var postId = post.id.substr(8);
			oldPosts[postId] = {'post': post.children[0].children[0], 'mainNode' : arrayOldPosts[i]};
		}

		for (var i = 0, n = arrayNewPosts.length; i < n; i++) {
			var post = arrayNewPosts[i].getElementsByClassName("alt1")[0];
			var postId = post.id.substr(8);
			newPosts[postId] = {'post': post.children[0].children[0], 'mainNode' : arrayNewPosts[i]};
		}

		var _newPosts = [];
		var _editedPosts = [];
		var _deletedPosts = [];

		// recorrer los posts viejos
		for (var oldPostId in oldPosts) {
			var newPost = newPosts[oldPostId];

			if (newPost) {// ¿Sigue existiendo el post viejo en el nuevo listado?
				/*var oldPost = oldPosts[oldPostId];

				if (oldPost.post.innerHTML !== newPost.post.innerHTML) {// ¿Ha sido editado? (TODO)
					_editedPosts.push({'id': oldPostId, 'html': oldPost.post.innerHTML});
				}*/
			} else {
				_deletedPosts.push(oldPostId);
			}
		}

		// recorrer los posts nuevos
		for (var newPostId in newPosts) {
			if (! (newPostId in oldPosts)) {
				_newPosts.push({'id': newPostId, 'node': newPosts[newPostId].mainNode});
			}
		}

		return {
				'new': _newPosts,// {id, node}
				'deleted': _deletedPosts,// id
				'edited': _editedPosts// {id, html}
			};
	}

	/**
	 * @param msg {string} Si no está definido, ocultar el botón.
	 * @param href {string} Si es undefined, el onclick será 'populateNewPosts'.
	 */
	function showButton(msg, href) {
		if (msg) {// mostrar
			if (href) {
				newPostsElem.href = href;
				newPostsElem.onclick = undefined;
			} else {
				newPostsElem.href = "#";
				newPostsElem.onclick = populateNewPosts;
			}

			newPostsElem.textContent = msg;

			if (! newPostsShown) {
				$(newPostsElem).slideDown();
				newPostsShown = true;
			}
		} else if (newPostsShown) {// ocultar
			$(newPostsElem).slideUp();
			newPostsElem.textContent = "";
			newPostsShown = false;
		}
	}

	/**
	 * Muestra un botón para mostrar los nuevos posts o cargar la siguiente página.
	 * @param newPosts {array} Array con los posts nuevos. Si está vacío, se crea un enlace a la siguiente página.
	 * @param editedPosts {array} Array con los IDs de los posts editados.
	 * @param deletedPosts {array} Array con los IDs de los posts eliminados.
	 */
	function newPosts(newPosts, editedPosts, deletedPosts) {
		if (cancelar) {
			cancelar = false;
			return;// salir si el timeout ha sido cancelado
		}

		if (mod.preferences.loadAutomatically) {
			populateNewPosts();
		} else {
			var numNewPosts = newPosts ? newPosts.length : 0;
			var numDeletedPosts = deletedPosts ? deletedPosts.length : 0;

			var string = "";// el mensaje que se mostrará en el botón

			if (numDeletedPosts !== 0) {
				string += numDeletedPosts === 1 ? "Se ha eliminado un post. " : "Se han eliminado " + numDeletedPosts + " posts. ";
			}

			if (numNewPosts !== 0) {
				string += numNewPosts === 1 ? "Hay un post nuevo. " : "Hay " + numNewPosts + " posts nuevos. "
			}

			// cambiar el título
			// En Firefox, al actualizar el título de la página, la pestaña (si está fijada) se marca como actualizada - https://i.imgur.com/qWb3sF9.png
			// Si el usuario ha entrado a la pestaña el aviso se va, por eso cambio el título de nuevo (con timeout) para que vuelva a aparecer el aviso si hay más posts nuevos.
			document.title = pageTitle;

			if (string) {
				showButton(string, false);

				// cambiar el título
				if (typeof newPage !== 'string') {
					setTimeout(function () { document.title = "*" + pageTitle; }, 1);
				}
			} else {
				showButton(false);
			}
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

		// 1: añadir posts nuevos
		var divElem = document.createElement("div");
		divElem.className = "new-posts";
		divElem.style.display = "none";

		for (var i = 0, n = differences.new.length; i < n; i++) {
			var post = differences.new[i];
			var postId = post.id;

			// añadir el post al DOM
			var newNode = divElem.appendChild(post.node);
			SHURSCRIPT.eventbus.trigger('parsePost', new Post($(newNode)));
		}

		var postsElem = document.getElementById("posts");
		postsElem.insertBefore(divElem, document.getElementById("lastpost"));
		$(divElem).slideDown();

		// ejecutar los scripts recibidos (popup menú usuario, vídeos, multicita), una vez que se han añadido al DOM
		for (var i = 0, n = differences.new.length; i < n; i++) {
			var node = differences.new[i].node;

			unsafeWindow.PostBit_Init(node, postId);
			unsafeWindow.parseScript(node.innerHTML);
		}

		// 2: procesar posts eliminados
		for (var i = 0, n = differences.deleted.length; i < n; i++) {
			var postId = differences.deleted[i];
			var node = document.getElementById("edit" + postId).parentNode.parentNode.parentNode;
			$(node).fadeTo("slow", 0.35);
			node.removeAttribute("align");// al obtener el listado de posts solo se consideran los que tengan 'align=center' (debería buscar otro método mejor...)
		}

		// disparar evento para avisar de nuevos posts
		SHURSCRIPT.eventbus.trigger('newposts', differences.new.length);

		// actualizar variable para respuesta rápida, determinará el número de posts a cargar la próxima vez
		unsafeWindow.ajax_last_post = (+new Date()) / 1000;

		// actualizar el listado de posts que están visibles
		shownPosts = document.querySelectorAll("#posts > div[align], #posts > div > div[align]");
		numPostsBefore = shownPosts.length;

		// si hay nueva página, mostrar inmediatamente el botón
		if (! isLastPage) {
			showButton("Hay una nueva página", "showthread.php?t=" + thread + "&page=" + (+page + 1));
		}

		return false;
	}
})(jQuery, SHURSCRIPT.moduleManager.createModule);
