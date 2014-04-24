(function ($, createModule, undefined) {
	'use strict';

	var mod = createModule({
		id: 'ThreadUpdater',
		name: 'Actualiza las nuevas respuestas de un hilo.',
		author: 'Electrosa',
		version: '0.1-alpha',
		description: 'Dentro de un hilo, se añadirán nuevas respuestas automáticamente sin necesidad de recargar la página.',
		domain: ['/showthread.php'],
		initialPreferences: {
			enabled: false// versión preliminar, la dejo desactivada por defecto
		},
		preferences: {}
	});

	mod.getPreferenceOptions = function () {
		var creOpt = mod.helper.createPreferenceOption;

		return [
		];
	};

	mod.normalStartCheck = function () {
		return true;
	};

	var numPostsBefore;// cantidad de posts al cargar el hilo
	var newPostsElem, newPostsShown = false;// botón que el usuario debe pulsar para cargar los nuevos posts
	var posts;
	var pageTitle = document.title;
	var interval;

	mod.onNormalStart = function () {

		numPostsBefore = document.getElementById("posts").children.length - 1;

		// si la página está completa, no comprobar si hay nuevos posts
		if (numPostsBefore < 30) {
			// unos pocos estilos (CSS no minificado abajo)
			GM_addStyle("#shurscript-newposts{width:100%; margin:12px 0}");

			// comprobar cada 10 segundos si hay nuevos posts
			interval = setInterval(function () {
				if (numPostsBefore < 30) { // TODO - detectar si hay disponible una nueva página
					loadThread(getCurrentThread(), getCurrentPage());
				} else {
					clearInterval(interval);
					console.log("Cancelado.");
				}
			}, 10000);

			// crear el elemento ya para poder reservar su hueco
			var shurscriptWrapper = document.createElement("div");
			shurscriptWrapper.className = "shurscript";
			newPostsElem = document.createElement("div");
			newPostsElem.id = "shurscript-newposts";
			newPostsElem.className = "invisible btn btn-success";
			newPostsElem.onclick = populateNewPosts;
			shurscriptWrapper.appendChild(newPostsElem);

			var postsElem = document.getElementById("posts");// añadirlo después de #posts
			postsElem.parentNode.insertBefore(shurscriptWrapper, postsElem.nextSibling);
		} else {
			console.log("Cancelado.");
		}
	};

	function loadThread(thread, page) {
		var xmlhttp = new XMLHttpRequest();

		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
				var html = xmlhttp.responseText;
				var parser = new DOMParser();
				var doc = parser.parseFromString(html, "text/html");

				var numPostsPrevious = posts ? posts.length : 0;

				//posts = doc.getElementById("posts").children;
				//var numPostsAfter = posts.length - 1;// en #posts, hay un div#lastpost que no nos interesa contar
				posts = doc.querySelectorAll("#posts > div[align]");
				var numPostsAfter = posts.length;

				// comprobar si hay nuevos posts y si no hay posts nuevos respecto a la última vez
				if (numPostsBefore !== numPostsAfter && numPostsAfter !== numPostsPrevious) {
					newPosts(numPostsAfter - numPostsBefore);
				}
			}
		};

		xmlhttp.open("GET", "/foro/showthread.php?t=" + thread + "&page=" + page, true);
		xmlhttp.send();
	}

	function newPosts(num) {
		// crear el elemento si no existe
		if (! newPostsShown) {
			newPostsElem.classList.remove("invisible");
			newPostsShown = true;
		}

		// cambiar el título
		// En Firefox, al actualizar el título de la página, la pestaña (si está fijada) se marca como actualizada - https://i.imgur.com/qWb3sF9.png
		// Si el usuario ha entrado a la pestaña el aviso se va, por eso cambio el título de nuevo (con timeout) para que vuelva a aparecer el aviso si hay más posts nuevos.
		document.title = pageTitle;
		setTimeout(function () { document.title = "*" + pageTitle; }, 1);

		// actualizar con el número de posts nuevos
		newPostsElem.textContent = num === 1 ? "Hay un post nuevo." : "Hay " + num + " posts nuevos.";
	}

	function populateNewPosts() {
		// ocultar el botón
		newPostsElem.classList.add("invisible");
		newPostsElem.textContent = "";
		newPostsShown = false;

		// añadir los posts
		var postsElem = document.getElementById("posts");
		var lastPostElem = document.getElementById("lastpost");
		var numPostsAfter = posts.length;

		for (var i = numPostsBefore, n = numPostsAfter; i < n; i++) {
			// añadir el post al DOM
			postsElem.insertBefore(posts[i], lastPostElem);

			// registrar el popup al hacer clic en el nombre de usuario
			var postId = posts[i].getElementsByTagName("table")[0].id.substr(4);
			unsafeWindow.vbmenu_register("postmenu_" + postId, true);
		}

		// ahora el hilo tiene varios posts más
		numPostsBefore = numPostsAfter;

		// restablecer el título
		document.title = pageTitle;
	}


	function getURLParameter(name) {
		return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20'))
			|| null;
	}

	function getCurrentPage() {
		var r;

		if (r = getURLParameter("page")) return r;
		if (r = document.getElementById("showthread_threadrate_form")) return r.page.value;
		if (r = document.querySelector(".pagenav:first-child span strong")) return r.textContent;

		return -1;
	}

	function getCurrentThread() {
		var r;

		if (r = unsafeWindow.threadid) return r;
		if (r = getURLParameter("t")) return r;
		if (r = document.getElementById("qr_threadid")) return r.t.value;

		return null;
	}
})(jQuery, SHURSCRIPT.moduleManager.createModule);