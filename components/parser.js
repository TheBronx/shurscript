/**
 * Componente que recorre elementos del foro que interesan a distintos modulos
 * como puedan ser hilos, posts o usuarios
 * OJO: necesita que el componente eventbus haya cargado
 * OJO: el parse empieza cuando se llama a parser.parse() y entonces los eventos se van disparando
 *
 * Eventos lanzados:
 *      + parseThread( Thread )
 *
 */
(function ($, SHURSCRIPT, undefined) {
	'use strict';

	var parser = SHURSCRIPT.core.createComponent('parser');

	var Thread = function(element) {
		this.element = element;
		var title_td = element.find('td[id^="td_threadtitle_"]');
		//comprobamos que el <tr> es un hilo y no una fila vacia (gracias ilitri :manco:)
		if (title_td.length != 0) {
			this.title_td = title_td;
			this.title_link = this.title_td.find('div > a[id^="thread_title_"]').first();
			this.href = this.title_link.attr('href');
			this.id = parseInt(/.*showthread\.php\?.*t=([0-9]+).*/.exec(this.href)[1]);
			this.title = this.title_link.html();
			this.author_span = this.title_td.find("div.smallfont > span:last-child");
			this.author = this.author_span.text();
			this.icon_td = this.element.find('#td_threadstatusicon_' + this.id);
		}
	};

	parser.parse = function () {
		var page = location.pathname.indexOf("/foro") != -1 ? location.pathname.replace("/foro", "") : "frontpage";
		if (page == "frontpage") {
			//si estamos en la portada, parse de hilos
			//TODO parsePortalThreads()

		} else if (page == "/showthread.php") {
			//si estamos en un hilo, parse de posts y usuarios
			//TODO parsePostsAndUsers()

		} else if (page == "/forumdisplay.php" || page == "/search.php") {
			//si estamos en una seccion o una búsqueda, parse de hilos
			parseThreads();
		}
	};

	parser.load = function () {
		SHURSCRIPT.eventbus.on('allModulesLoaded', parser.parse);
	};

	function parseThreads() {
		//Recorremos todos los hilos de la lista
		$('#threadslist tr').each(function (index) {
			var thread = new Thread($(this));
			if (thread.id!=undefined) {
				console.log("triggering parseThread for thread id: "+thread.id);
				SHURSCRIPT.eventbus.trigger('parseThread', thread);
			}
		});
	}

})(jQuery, SHURSCRIPT);
