
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
			enabled: true
		}
	});

	mod.onNormalStart = function () {
		
		var tempName = 'reader',
			templateText = mod.helper.getResourceText('readerhtml');
		SHURSCRIPT.templater.storeTemplate(tempName, templateText);
		SHURSCRIPT.templater.compile(tempName);

		var fontSize = 18;
		
		var handler = function (e) {
			var post = e.target ? $(e.target).data('post') : e;
			var postContent = post.content.html().trim();
			var $modal = $(SHURSCRIPT.templater.fillOut('quote', {postContent: postContent, threadTitle: $('.cmega').text(), author: post.author}));
			$modal.find("div[style*='margin:20px; margin-top:5px;']").each(function (i, quote) {
				$(quote).addClass('quote').html($(quote).find('.alt2').html()); //Quitamos las tablas de las citas y nos quedamos con el contenido
			});
			
			try {
				$('body').append($modal);
			} catch (e) {
				console.log(e);
			}

			var fontSizeChanger = function (newFontSize) {
				$modal.find('.modal-body > div').attr('class', 'font-size-' + newFontSize);
				$modal.find('.smaller-font').attr('data-font-size', newFontSize);
				$modal.find('.larger-font').attr('data-font-size', newFontSize);
			}

			fontSizeChanger(fontSize);

			$modal.find('.smaller-font').click(function () {
				if (fontSize > 14) {
					fontSizeChanger(fontSize -= 2);
				}
			});

			$modal.find('.larger-font').click(function () {
				if (fontSize < 26) {
					fontSizeChanger(fontSize += 2);
				}
			});

			$modal.find('.back-to-thread').click(function () {
				$modal.modal('hide');
			});

			$modal.on('hidden.bs.modal', function () {
				$modal.remove();
				location.hash = '#post' + post.id;
			});

			$modal.modal();
			$(".modal-backdrop").attr('id', 'shurscript-reader-backdrop');

		};
		
		SHURSCRIPT.eventbus.on('parsePost', function(event, post) {
			var link = $('<a href="#read' + post.id + '" class="reader-link">Leer...</span>');
			link.data('post', post);
			link.on('click', handler);
			$(post.elementTable).find('a[id^=postcount]').parent().prepend(link);

			if (location.hash === '#read' + post.id) {
				handler(post);
			}
		});

	};

})(jQuery, SHURSCRIPT.moduleManager.createModule);
