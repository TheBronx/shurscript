(function ($, createModule, undefined) {
	'use strict';

	var mod = createModule({
		id: 'ImageUploader',
		name: 'Subir im&aacute;genes a Imgur',
		author: 'xus0',
		version: '1.0',
		description: 'Sube o arrastra im&aacute;genes desde tu equipo, y autom&aacute;ticamente se subir&aacute;n a Imgur y se postear&aacute;n en el hilo.',
		domain: ['/showthread.php', '/newthread.php', '/newreply.php'],
		preferences: {}
	});

	mod.onNormalStart = function () {

		/* ESTILOS Y EVENTOS PARA EL DRAG AND DROP */

		GM_addStyle("body.dragover:before {color: white; font-size: 40px; text-align: center; padding-top: 150px;"
			+ "position: fixed; left: 0; top: 0; height: 100%; width: 100%; opacity: 0.7;"
			+ "background: url('http://s.imgur.com/images/imgur.gif') no-repeat scroll center 220px #121211;"
			+ "content: 'Suelta aquí las imágenes para subirlas a'};");
		GM_addStyle("body.draguploading:before {"
			+ "content: 'Subiendo imágenes...'};");

		resetDropZone();

		$('body').on('dragover', function (evt) {
			//Solo activar evento DND si se arrastran ficheros desde fuera
			var dragTypes = evt.originalEvent.dataTransfer.types;
			if ($.inArray("Files", dragTypes) != -1 && $.inArray("text/html", dragTypes) == -1) {
				// console.log(JSON.stringify(evt.originalEvent.dataTransfer.types));
				console.log(evt.originalEvent.dataTransfer);
				evt.stopPropagation();
				evt.preventDefault();
				$('body').addClass('dragover');
				evt.originalEvent.dataTransfer.dropEffect = 'copy';
			}
		});

		$('body').on('dragleave dragend', function (evt) {
			resetDropZone();
		});

		$('body').on('drop', handleFileSelect);
	};

	var totalFiles,
		fileCount;

	function upload(data) {
		$.ajax({
			url: 'https://api.imgur.com/3/image',
			method: 'POST',
			headers: {
				Authorization: 'Client-ID e115ac41fea372d',
				Accept: 'application/json'
			},
			data: {
				image: data.replace(/^data:image\/.*;base64,/, ''),
				type: 'base64'
			}
		}).done(function (result) {
			fileCount++;
			if (fileCount == totalFiles) {
				resetDropZone();
			}
			appendTextToEditor('<br>[IMG]' + result.data.link + "[/IMG]");
		}).fail(function (error) {
			mod.helper.throw("Error al subir imagen a Imgur: " + data, error);
			if (fileCount == totalFiles) {
				resetDropZone();
			}
		});
	}

	function handleFileSelect(evt) {
		evt.stopPropagation();
		evt.preventDefault();

		//Lista de ficheros seleccionado
		var files = evt.originalEvent.dataTransfer.files;
		console.log(files)

		totalFiles = files.length;
		fileCount = 0;

		// Recorremos los ficheros
		var reader;
		$.each(files, function(i, f) {
			// Solo imagenes
			if (f.type.match('image.*')) {
				reader = new FileReader();

				reader.onload = (function (theFile) {
					return function (e) {
						upload(e.target.result);
					};
				})(f);

				reader.readAsDataURL(f);
			}
		});

		if (reader) {
			$('body').addClass('draguploading');
			$('html').animate({scrollTop: $("#qrform").offset().top + 'px'}, 800);
		} else {
			resetDropZone();
		}
	}

	function resetDropZone() {
		$('body').removeClass('dragover draguploading');
	}

	function getEditor() {
		return mod.helper.environment.page == "/showthread.php" ? unsafeWindow.vB_Editor.vB_Editor_QR : unsafeWindow.vB_Editor.vB_Editor_001;
	}

	function appendTextToEditor(text) {
		getEditor().insert_text(text);
	}

})(jQuery, SHURSCRIPT.moduleManager.createModule);