
(function ($, createModule, undefined) {
	'use strict';

	var mod = createModule({
		id: 'History',
		name: 'Historial',
		author: 'xus0',
		version: '0.1',
		description: 'Lista de los hilos a los que has entrado anteriormente y en los que has participado.',
		domain: 'ALL',
		initialPreferences: {
			enabled: true
		}
	});
	
	var $activeTab = 'read-threads';
	var lastTemplate;
	var MAX_ENTRIES = 10;

	mod.onNormalStart = function () {
		
		mod.helper.addStyle('historycss');
		
		/*
		* Plantilla HTML que generara el popup con la lista de hilos
		*/
		var tempName = 'history',
			templateText = mod.helper.getResourceText('historyhtml');
		SHURSCRIPT.templater.storeTemplate(tempName, templateText);
		SHURSCRIPT.templater.compile(tempName);
		
		var buildTemplate = function(threads, fallbackHTML) {
			var $template = $(SHURSCRIPT.templater.fillOut('history', {threads: threads || []}));
			$template.find('.selector button[data-id=' + $activeTab + ']').addClass('active btn-primary');
			if (threads && threads.length === 0 && fallbackHTML) {
				$template.find('.thread-list').html(buildInfoMessage(fallbackHTML));
			}
			lastTemplate = $template;
			return $template;
		};

		var populateCallback = function (threads, fallbackHTML) {
			$('.popover-content').html(buildTemplate(threads, fallbackHTML));
		};
		
		setTimeout(function() {
			
			$('#Historial.shurbar-item')
			.popover({
				html: true, 
				placement: 'bottom', 
				content: function () {
					return lastTemplate ? lastTemplate : buildTemplate();
				}
			})
			.one('shown.bs.popover', function () {
				var $content = $('.popover-content');

				/* Selector de Abiertos | Leídos | Escritos */
				$content.on('click', '.selector button', function (e) {
					
					if ($(this).is('.active')) { //No hacemos nada si ya es la pestaña activa
						e.cancel();
						return false;
					}
					
					$activeTab = $(this).data('id');
					$content.find('.selector button.active').removeClass('active btn-primary');
					$content.find('.selector button[data-id=' + $activeTab + ']').addClass('active btn-primary');
					$content.find('.thread-list').html(buildInfoMessage('Cargando...'));
				});
				
				$content.on('click', '.selector button[data-id=opened-threads]', function (e) {
					getOpenedThreads(populateCallback);
				});
				
				$content.on('click', '.selector button[data-id=read-threads]', function (e) {
					getReadThreads(populateCallback);
				});
				
				$content.on('click', '.selector button[data-id=sent-posts]', function (e) {
					getPosts(populateCallback);
				});
				
				/* Cargamos por defecto los hilos leídos */
				getReadThreads(populateCallback);
			});
		
		}, 0);
		
		/* Añadimos el hilo actual al historial */
		if (SHURSCRIPT.environment.page === '/showthread.php') {
			addCurrentThreadToHistory();
		}
		
		/* Dismiss on outside click */
		$('body').on('click', function (e) {
			if (!$(e.target).is('.popover') && $(e.target).parents('.history-popover').length === 0 && $(e.target).parents('#Historial.shurbar-item').length === 0) { 
				$('#Historial.shurbar-item').popover('hide');
			}
		});

	};
	
	/*
	* Listado de hilos abiertos por el usuario
	*/
	function getOpenedThreads(callback) {
		var request = new XMLHttpRequest();
		request.onreadystatechange = function () {
			if (request.readyState === 4 && request.statusText === 'OK') {
				var $html = $(request.responseText);
				var threads = [];
				if ($html.find('td.panelsurround div.panel div').length > 0) {
					//Debes esperar al menos 10 segundos entre cada busqueda...
					threads = mod.helper.getValue('OPENED_THREADS', '[]');
					threads = JSON.parse(threads);
				} else {
					$html.find('#threadslist a[id^=thread_title]').each(function (i, thread) {
						if (i >= MAX_ENTRIES) {
							return false;
						}

						threads.push({
							id: thread.id.match(/thread_title_(\d*)/)[1],
							title: thread.textContent
						});
					});
					mod.helper.setValue('OPENED_THREADS', JSON.stringify(threads));
				}
				
				if ($activeTab === 'opened-threads') {
					callback(threads, 'Parece que todavía no has abierto ningún hilo...');
				}
			}
		};
		request.open('GET', 'http://www.forocoches.com/foro/search.php?do=finduser&starteronly=1&u=' + SHURSCRIPT.environment.user.id);
		request.send();
	}
	
	/*
	* Listado de hilos visitados por el usuario
	*/
	function getReadThreads(callback) {
		var threads = mod.helper.getValue('READ_THREADS', '[]');
		threads = JSON.parse(threads);
		callback(threads, 'Date una vuelta por el foro y te empezarán a aparecer aquí los hilos que visites.');
	}
	
	/*
	* Listado de posts escritos por el usuario
	*/
	function getPosts(callback) {
		var request = new XMLHttpRequest();
		request.onreadystatechange = function () {
			if (request.readyState === 4 && request.statusText === 'OK') {
				var $html = $(request.responseText);
				var threads = [];
				if ($html.find('td.panelsurround div.panel div').length > 0) {
					//Debes esperar al menos 10 segundos entre cada busqueda...
					threads = mod.helper.getValue('SENT_POSTS', '[]');
					threads = JSON.parse(threads);
				} else {
					$html.find('table[id^=post]').each(function (i, post) {
						if (i >= MAX_ENTRIES) {
							return false;
						}
						
						var $thread = $(post).find('.alt1 div > a > strong');
						threads.push({
							id: $thread.parent().attr('href').match(/showthread\.php\?t=(\d*)/)[1],
							title: $thread.text(),
							post: {
								id: post.id.match(/post(\d*)/)[1],
								content: $(post).find('.alt2 em').contents().filter(function () {return this.nodeType === 3}).text().trim().replace(/</g, '&lt;')
							}
						});
					});
					mod.helper.setValue('SENT_POSTS', JSON.stringify(threads));
				}
				
				if ($activeTab === 'sent-posts') {
					callback(threads, 'Todavía no tenemos suficiente información. Vuelve a intentarlo en un rato.');
				}
			}
		};
		request.open('GET', 'http://www.forocoches.com/foro/search.php?do=finduser&u=' + SHURSCRIPT.environment.user.id + '-' + new Date().getMinutes());
		request.send();
	}
	
	/*
	* Añade -o mueve a la primera posición si ya existía- el hilo actual al historial, limitando a 10 entradas como máximo
	*/
	function addCurrentThreadToHistory() {
		
		var threads = mod.helper.getValue('READ_THREADS', '[]');
		threads = JSON.parse(threads);
		
		var currentThread = {
			id: $('input[name=searchthreadid]').attr('value'),
			title: $('.cmega').text()
		};
		
		//Lo quitamos si ya existia
		threads = $.grep(threads, function (th) {
			return th.id !== currentThread.id;
		});
		
		//Lo añadimos en la primera posición
		threads.unshift(currentThread);
		
		threads = threads.slice(0, MAX_ENTRIES);
		
		mod.helper.setValue('READ_THREADS', JSON.stringify(threads));
	}
	
	function buildInfoMessage(message) {
		return '<div class="info-wrapper"><div class="info">' + message + '</div></div>';
	}
	
	mod.shurbarIcon = function () {
		return {
			name: 'Historial',
			image: 'https://cdn1.iconfinder.com/data/icons/Keyamoon-IcoMoon--limited/16/history.png'
		};
	};

})(jQuery, SHURSCRIPT.moduleManager.createModule);
