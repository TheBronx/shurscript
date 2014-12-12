/**
 * Componente que recorre elementos del foro que interesan a distintos modulos
 * como puedan ser hilos, posts o usuarios
 * OJO: necesita que el componente eventbus haya cargado
 * OJO: el parse empieza cuando se llama a parser.parse() y entonces los eventos se van disparando
 *
 * Eventos lanzados:
 *      + parseThread( Thread )
 *      + parsePost( Post )
 *
 */
(function ($, SHURSCRIPT, undefined) {
	'use strict';

	var parser = SHURSCRIPT.core.createComponent('parser');

	var Thread = function(element) {
		this.element = element;
		var title_td = element.find('td[id^="td_threadtitle_"]');
		//comprobamos que el <tr> es un hilo y no una fila vacia (gracias ilitri :manco:)
		if (title_td.length !== 0) {
			this.title_td = title_td;
			this.title_link = this.title_td.find('div > a[id^="thread_title_"]').first();
			this.href = this.title_link.attr('href');
			this.id = parseInt(/.*showthread\.php\?.*t=([0-9]+).*/.exec(this.href)[1]);
			this.title = this.title_link.text();
			this.author_span = this.title_td.find("div.smallfont > span:last-child");
			this.author = this.author_span.text();
			this.icon_td = this.element.find('#td_threadstatusicon_' + this.id);
		}
	};

	var Post = function (element) {
		this.element = element;
		var table = this.element.find('table').first();
		this.elementTable = table;

		this.id = parseInt(table.attr('id').replace('post',''));
		this.href = '/showthread.php?p=' + this.id;
		this.content = this.element.find('#post_message_' + this.id);
		this.postcount = parseInt(this.element.find('#postcount' + this.id + ' strong').text());

		var user = this.element.find('#postmenu_' + this.id + ' .bigusername');
		this.ignored = false;
		if (user.length === 0) {
			user = this.element.find('.alt2:first-child > a');
			this.ignored = true;
		}
		this.author = user.text();
		this.author_link = user.attr('href');
	};

	parser.parse = function () {
		var page = location.pathname.indexOf("/foro") !== -1 ? location.pathname.replace("/foro", "") : "frontpage";
		if (page === "frontpage") {
			//si estamos en la portada, parse de hilos
			//TODO parsePortalThreads()

		} else if (page === "/showthread.php") {
			//si estamos en un hilo, parse de posts y usuarios
			parsePostsAndUsers();

		} else if (page === "/forumdisplay.php" || page === "/search.php") {
			//si estamos en una seccion o una búsqueda, parse de hilos
			parseThreads();
		}
	};

	parser.load = function () {
		SHURSCRIPT.eventbus.on('allModulesLoaded', parser.parse);
	};

	function parseThreads() {
		//Recorremos todos los hilos de la lista
		$('#threadslist tr').each(function () {
			var thread = new Thread($(this));
			if (thread.id !== undefined) {
				SHURSCRIPT.eventbus.trigger('parseThread', thread);
			}
		});
	}

	function parsePostsAndUsers() {
		//Recorremos los posts
		$("#posts > div[align='center']").each(function () {
			var post = new Post($(this));
			if (post.id !== undefined) {
				SHURSCRIPT.eventbus.trigger('parsePost', post);
			}
		});

		//TODO recorremos los usuarios

		//Respuesta rápida
		$('#qrform').on('submit', function () {
			SHURSCRIPT.eventbus.trigger('quickReply', 'submit');// submit, done, error
		});
		var qr_do_ajax_post_original = unsafeWindow.qr_do_ajax_post;
		var qr_do_ajax_post_new = function (ajax) {
			eval("qr_do_ajax_post_original(ajax);\
				if (typeof ajax === 'object') {\
					if (ajax.responseXML.children[0].nodeName === 'postbits') {\
						var numNewPosts = ajax.responseXML.children[0].children.length - 1;\
						SHURSCRIPT_triggerEvent('quickReply', ['done', numNewPosts]);\
					} else SHURSCRIPT_triggerEvent('quickReply', 'error');\
				} else SHURSCRIPT_triggerEvent('quickReply', 'error');\
			");
		};
		if (typeof exportFunction === 'function') {
			// exportar la función para recibir eventos al objeto window
			exportFunction(SHURSCRIPT.eventbus.trigger, unsafeWindow, {defineAs: 'SHURSCRIPT_triggerEvent'});

			// reescribir la función `qr_do_ajax_post` inyectando un script en la cabecera de la página
			var script = document.createElement('script'); 
			script.type = "text/javascript"; 
			script.innerHTML = '\
					window.qr_do_ajax_post_original = window.qr_do_ajax_post;\
					window.qr_do_ajax_post = ' + qr_do_ajax_post_new.toString() + ';';
			document.getElementsByTagName('head')[0].appendChild(script);
		} else {
			unsafeWindow.qr_do_ajax_post = qr_do_ajax_post_new;
			unsafeWindow.SHURSCRIPT_triggerEvent = SHURSCRIPT.eventbus.trigger;
		}

		SHURSCRIPT.eventbus.on('quickReply', function (event, status, numNewPosts) {
			if (status === 'done' && numNewPosts !== undefined) {
				var posts = document.querySelectorAll("#posts > div[align], #posts > div > div[align]");
				for (var n = posts.length, i = n - numNewPosts; i < n; i++) {
					var post = new Post($(posts[i]));
					if (post.id !== undefined) {
						SHURSCRIPT.eventbus.trigger('parsePost', post);
					}
				}
			}
		});
	}
})(jQuery, SHURSCRIPT);
