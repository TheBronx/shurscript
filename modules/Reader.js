
(function ($, createModule, undefined) {
	'use strict';

	var mod = createModule({
		id: 'Reader',
		name: 'Modo lectura',
		author: 'xus0',
		version: '0.1',
		description: 'Perfecto para leer historias y relatos <i>tochos</i> de forma más cómoda.',
		domain: ['/showthread.php'],
		initialPreferences: {
			enabled: true,
			fontSize: 18,
			theme: 'light'
		}
	});
	
	mod.onNormalStart = function () {

		mod.helper.addStyle('readercss');
		
		/*
		* Compilamos la plantilla HTML del Reader
		*/
		var tempName = 'reader',
			templateText = mod.helper.getResourceText('readerhtml');
		SHURSCRIPT.templater.storeTemplate(tempName, templateText);
		SHURSCRIPT.templater.compile(tempName);

		var linkClickHandler = function (e) {
			var post = $(e.target).data('post');
			mod.openReader(post.id, post.content.html().trim(), post.author);
		};

		/**
		* Parseamos cada uno de los posts
		*/
		SHURSCRIPT.eventbus.on('parsePost', function(event, post) {
			try {
				
				/* Si el contenido del post es mayor que 1000 caracteres, mostramos el botón para leer. */
				if (post.content.text().trim().length > 1000) {
					var link = $('<a href="#read' + post.id + '" class="reader-link" title="Abrir este post en modo lectura">Leer</span>');
					link.data('post', post);
					link.on('click', linkClickHandler);

					$(post.elementTable).find('a[id^=postcount]').parent().prepend(link);
				}

				/* Si viene en el hash de la URL, #read y un numero de post, lo abrimos como lectura */
				if (location.hash === '#read' + post.id) { 
					mod.openReader(post.id, post.content.html().trim(), post.author);
				}
				
				
			} catch (e) {
				/* Just in case */
				console.log(e); 
			}
		});

	};
	
	/**
	* Si el primer post de todos ya es un tocho, mostramos botón en la Shurbar para mejor visibilidad
	*/
	mod.shurbarIcon = function () {
		var firstPost = $('a[id^=postcount]').first();
		if (firstPost && firstPost.attr('name') === '1') {
			var postId = firstPost.attr('id').match(/postcount(\d*)/)[1];
			var content = $('#post_message_' + postId);
			var author = $('#postmenu_' + postId + ' .bigusername').text();
			if (content.text().trim().length > 1000) {
				return {
					name: 'Modo lectura',
					description: 'Leer el primer post de forma más cómoda',
					image: 'http://i.imgur.com/wLtDpAp.png',
					handler: function () {
						$('.tooltip').hide();
						mod.openReader(postId, content.html().trim(), author);
					},
					href: '#read' + postId
				};
			}
		}
		
		return {};
		
	};
	
	var $modal, $body, $header;
	
	mod.openReader = function (postId, postContent, postAuthor) {
		
		$modal = $(SHURSCRIPT.templater.fillOut('reader', {postContent: postContent, threadTitle: $('.cmega').text(), author: postAuthor, postNumber: $('#postcount' + postId + ' strong').text()}));
		$modal.find("div[style*='margin:20px; margin-top:5px;']").each(function (i, quote) {
			$(quote).addClass('quote').html($(quote).find('.alt2').html()); //Quitamos las tablas de las citas y nos quedamos con el contenido
		});

		try {
			$('body').append($modal);
		} catch (e) {
			// Elementos como los videos de Youtube tienen un script dentro que hace petar el .append()
			console.log(e);
		}

		/* Botones para aumentar y disminuir el tamaño de la fuente */
		createFontSizeControls();
		
		/* Al hacer scroll, la barra superior permanecera fijada arriba */
		fixTopbarOnScroll();
		
		/* Manejadores para el tema de los marcadores */
		prepareBookmarking();
		
		/* Control de temas */
		$modal.find('.theme').click(function () {
			var newTheme = $(this).attr('data-theme');
			var oldTheme = $modal.data('theme');
			oldTheme && $modal.removeClass(oldTheme);
			$modal.addClass(newTheme);
			$modal.data('theme', newTheme);
			
			mod.preferences.theme = newTheme;
			mod.storePreferences();
		});
		
		$modal.addClass(mod.preferences.theme);
		$modal.data('theme', mod.preferences.theme);
		
		/* Scroll arriba */
		$('.arrow-top').click(function () {
			$modal.animate({scrollTop: 0});
		});
		
		/* Boton de añadir marcador */
		$('.add-bookmark').click(startBookmarkAdding);

		/* Link al final del tocho para volver al hilo */
		$modal.find('.back-to-thread').click(function () {
			$modal.modal('hide');
		});

		/* Al cerrar el modal, lo eliminamos del DOM y cambiamos de nuevo el hash (a uno no existente para que no haga scroll a ningún ancla del foro) */
		$modal.on('hidden.bs.modal', function () {
			$modal.remove();
			location.hash = '#thread';
		});

		/* Abrimos la ventana */
		$modal.modal();
		
		/* Si el usuario tiene algun marcador en este hilo, se le llevará a él directamente */
		gotoCurrentBookmark();

	};
	
	function createFontSizeControls() {
		var fontSizeChanger = function (newFontSize) {
			$modal.find('.modal-body > div').attr('class', 'font-size-' + newFontSize);
			$modal.find('.smaller-font').attr('data-font-size', newFontSize);
			$modal.find('.larger-font').attr('data-font-size', newFontSize);
			mod.preferences.fontSize = newFontSize;
			mod.storePreferences();
		}

		fontSizeChanger(mod.preferences.fontSize);

		$modal.find('.smaller-font').click(function () {
			if (mod.preferences.fontSize > 14) {
				fontSizeChanger(mod.preferences.fontSize - 2);
			}
		});

		$modal.find('.larger-font').click(function () {
			if (mod.preferences.fontSize < 26) {
				fontSizeChanger(mod.preferences.fontSize + 2);
			}
		});
	}
	
	function fixTopbarOnScroll() {
		var $headerWrapper = $modal.find('.modal-header-wrapper');
		
		$header = $headerWrapper.find('.modal-header');
		$body = $modal.find('.modal-body');
		
		var fixedScrollTop, fixed;
		
		$modal.scroll(function () {
			
			if (!fixedScrollTop) {
				fixedScrollTop = $('.font-size-changer').get(0).offsetTop + 15;
			}
			
			//Punto a partir del cual, fijamos la barra arriba
			if (this.scrollTop > fixedScrollTop) {
				if (!fixed) {
					$header.addClass('fixed').parents('.modal-dialog').before($headerWrapper);
					$headerWrapper.css('margin-left', -$body.innerWidth() / 2 + 'px');
				}
				//Animacion del cambio entre el autor y el botón de añadir marcador
				$('.thread-info').css('margin-top', (fixedScrollTop - this.scrollTop) / 3 + 'px');
				$('.add-bookmark').css('margin-top', Math.max(50 - (this.scrollTop - fixedScrollTop) / 3, 13) + 'px');
				$('.arrow-top').css('margin-top', Math.max(50 - (this.scrollTop - fixedScrollTop) / 3, 10) + 'px');
				fixed = true;
			} else {
				if (fixed) {
					$header.removeClass('fixed');
					$body.before($headerWrapper);
					$headerWrapper.css('margin-left', 0);
				}
				$('.thread-info').css('margin-top', 0)
				$header.css('position', 'absolute');
				$body.css('margin-top', $header.innerHeight() + 'px');
				fixed = false;
			}
		});
	}

	var $bookmarkSelector;

	function prepareBookmarking() {
		var lastFiltered = $();
		$body.find('div').contents().each(function() {
			if ((lastFiltered.is('br') || lastFiltered.text().trim() === '\n' || lastFiltered.text().trim() === '') 
				&& !$(this).is('br') && $(this).text().trim() !== '\n' && $(this).text().trim() !== '') {
				lastFiltered.wrap('<span class="suitable-bookmark-position">');		
			}
			lastFiltered = $(this);
		});

		$bookmarkSelector = $('.bookmark-position-selector');

		$body.on('mouseenter', '.suitable-bookmark-position.active', function(e) {
			$bookmarkSelector.show().insertBefore($(e.currentTarget));
		});

		$bookmarkSelector.click(function() {
			if($(this).is('.adding')) {
					//Añadimos nuevo marcador
					stopBookmarkAdding();
					var suitablePosition = $bookmarkSelector.next('.suitable-bookmark-position');
					var position = $('.suitable-bookmark-position').index(suitablePosition);
					saveBookmark(position);
				} else {
					//Eliminamos marcador
					$(this).hide();
					deleteBookmark();
				}
			});

		$('.add-bookmark-help span').click(function () {
			stopBookmarkAdding();
			$bookmarkSelector.hide();
		});

	}

	function startBookmarkAdding() {
		$bookmarkSelector.addClass('adding');
		$body.find('.suitable-bookmark-position').addClass('active');
		$('.add-bookmark-help').show();
	}

	function stopBookmarkAdding() {
		$bookmarkSelector.removeClass('adding');
		$body.find('.suitable-bookmark-position').removeClass('active');
		$('.add-bookmark-help').hide();
	}

	function saveBookmark(position) {
		var bookmarks = getBookmarks();
		bookmarks[SHURSCRIPT.environment.thread.id] = position;
		mod.helper.setValue('BOOKMARKS', JSON.stringify(bookmarks));
	}

	function deleteBookmark() {
		var bookmarks = getBookmarks();
		delete bookmarks[SHURSCRIPT.environment.thread.id];
		storeBookmarks(bookmarks);
	}

	function storeBookmarks(bookmarks) {
		mod.helper.setValue('BOOKMARKS', JSON.stringify(bookmarks));
	}

	function getBookmarks() {
		var bookmarks = mod.helper.getValue('BOOKMARKS') || "{}";
		return JSON.parse(bookmarks);
	}

	function gotoCurrentBookmark() {
		var currentBookmarkPosition = getCurrentBookmarkPosition();
		if (currentBookmarkPosition) {
			$bookmarkSelector.show().insertBefore($('.suitable-bookmark-position').get(currentBookmarkPosition));
			setTimeout(function () {
				$modal.animate({scrollTop: $bookmarkSelector.offset().top + $modal.scrollTop() - 300}, 500);	
			}, 1500);
		}
	}

	function getCurrentBookmarkPosition() {
		var bookmarks = mod.helper.getValue('BOOKMARKS');
		if (bookmarks) {
			bookmarks = JSON.parse(bookmarks);
			return bookmarks[SHURSCRIPT.environment.thread.id];
		}
	}

})(jQuery, SHURSCRIPT.moduleManager.createModule);
