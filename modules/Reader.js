
(function ($, createModule, undefined) {
	'use strict';

	var mod = createModule({
		id: 'Reader',
		name: 'Modo lectura',
		author: 'xus0',
		version: '0.1',
		description: 'Perfecto para leer historias y relatos <i>tochos</i> de forma más cómoda.',
		domain: 'ALL',
		initialPreferences: {
			enabled: true,
			fontSize: 18
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
			var author = $('postmenu_' + postId + ' .bigusername').text();
			console.log(postId)
			if (content.text().trim().length > 1000) {
				return {
					name: 'Modo lectura',
					description: 'Leer el primer post de forma más cómoda',
					image: 'http://i.imgur.com/wLtDpAp.png',
					handler: function () {
						$('.tooltip').hide();
						mod.openReader(postId, content.html().trim(), author);
					}
				};
			}
		}
		
		return {};
		
	};
	

	mod.openReader = function (postId, postContent, postAuthor) {
		
		var $modal = $(SHURSCRIPT.templater.fillOut('reader', {postContent: postContent, threadTitle: $('.cmega').text(), author: postAuthor}));
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


		/* Link al final del tocho para volver al hilo */
		$modal.find('.back-to-thread').click(function () {
			$modal.modal('hide');
		});

		/* Al cerrar el modal, lo eliminamos del DOM y cambiamos de nuevo el hash */
		$modal.on('hidden.bs.modal', function () {
			$modal.remove();
			location.hash = '#post' + postId;
		});

		/* Abrimos la ventana */
		$modal.modal();
		$(".modal-backdrop").attr('id', 'shurscript-reader-backdrop');
		
		setTimeout(function(){location.hash = '#read' + postId;}, 500);

	};

})(jQuery, SHURSCRIPT.moduleManager.createModule);
