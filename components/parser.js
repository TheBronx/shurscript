/**
 * Componente que recorre elementos del foro que interesan a distintos modulos
 * como puedan ser hilos, posts o usuarios
 * OJO: necesita que el componente eventbus haya cargado
 * OJO: el parse empieza cuando se llama a parser.parse() y entonces los eventos se van disparando
 */
(function ($, SHURSCRIPT, undefined) {
	'use strict';

	var parser = SHURSCRIPT.core.createComponent('parser');

	var Thread = function(element) {
		var _this = this;
		this.element = element;

		this.title_td = $(this).find('td[id^="td_threadtitle_"]');

		if (this.title_td.length != 0) {
			this.title_link = this.title_td.find('div > a[id^="thread_title_"]').first();
			this.href = this.title_link.attr('href');
			this.id = parseInt(/.*showthread\.php\?.*t=([0-9]+).*/.exec(this.href)[1]);
			this.title = this.title_link.html();
			this.creator_span = this.title_td.find("div.smallfont > span:last-child");
			this.author = this.creator_span.text();
		} else {
			console.log("This is not a thread, how is that possible??? "+this.element);
		}
	};

	parser.parse = function () {
		if (parser.helper.environment.page == "/") {
			//si estamos en la portada, parse de hilos
			//TODO parsePortalThreads()

		} else if (parser.helper.environment.page == "/showthread.php") {
			//si estamos en un hilo, parse de posts y usuarios
			//TODO parsePostsAndUsers()

		} else if (parser.helper.environment.page == "/forumdisplay.php" || parser.helper.environment.page == "/search.php") {
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
			console.log("triggering parseThread for thread id: "+thread.id);
			SHURSCRIPT.eventbus.trigger('parseThread', thread);
		});
	}

})(jQuery, SHURSCRIPT);
