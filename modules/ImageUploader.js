(function ($, createModule, undefined) {
	'use strict';

	var mod = createModule({
		id: 'ImageUploader',
		name: 'Subir im&aacute;genes a Imgur',
		author: 'xus0',
		version: '1.0',
		description: 'Sube o arrastra im&aacute;genes desde tu equipo, y autom&aacute;ticamente se subir&aacute;n a Imgur y se postear&aacute;n en el hilo.',
		domain: ['/showthread.php', '/newthread.php', '/newreply.php'],
		initialPreferences: {
			embedding: 'preview'
		}
	});

	// Precarga asincronamente la plantilla y compila
	setTimeout(function () {
		var tempName = 'imageuploader',
			templateText = mod.helper.getResourceText('imageuploaderhtml');

		SHURSCRIPT.templater.storeTemplate(tempName, templateText);
		SHURSCRIPT.templater.compile(tempName);
	}, 0);

	var $uploadWindow;

	var totalFiles = 0, 
		fileCount = 0,
		alreadyUploading; //Para llevar la cuenta de los ficheros que se van subiendo

	mod.onNormalStart = function () {

		mod.helper.addStyle('imageuploadercss');

		/* SUBIDA MANUAL, VIA BOTON 'Insertar Imagen' */

		//Clonamos el botón y le añadimos nuestro manejador. Cosas raras de vBulletin
		var $oldButton = $(".imagebutton[id$='_cmd_insertimage']");
		var newButton = $oldButton.clone().get(0);
		newButton.editorid = getEditor().editorid;
		newButton.cmd = 'insertimage';
		newButton.onmousedown = newButton.onmouseover = newButton.onmouseout = function (A) {
			A = unsafeWindow.do_an_e(A);
			unsafeWindow.vB_Editor[getEditor().editorid].button_context(this, A.type);
		};
		newButton.onclick = function () {
			showImageUploader();
		};
		$oldButton.replaceWith(newButton);


		/* ESTILOS Y EVENTOS PARA EL DRAG AND DROP */

		$('body').on('dragover', function (evt) {
			//Solo activar evento DND si se arrastran ficheros desde fuera
			var dragTypes = evt.originalEvent.dataTransfer.types;
			if ($.inArray("Files", dragTypes) != -1 && $.inArray("text/html", dragTypes) == -1) {
				evt.stopPropagation();
				evt.preventDefault();
				$('body').addClass('dragover');
				evt.originalEvent.dataTransfer.dropEffect = 'copy';
			}
		});

		$('body').on('dragleave dragend drop', function (evt) {
			$('body').removeClass('dragover');
		});

		$('body').on('drop', function(evt) {
			if (handleFileSelect(evt.originalEvent.dataTransfer.files, evt)) {
				$uploadWindow && $uploadWindow.modal('hide');
				$('html').animate({scrollTop: $("#qrform").offset().top + 'px'}, 800);
			}
		});

	};

	function showImageUploader () {

		if (!$uploadWindow) {
			$uploadWindow = $(SHURSCRIPT.templater.fillOut('imageuploader'));
			$('body').append($uploadWindow);
			
			var $urlInput = $('#imageurl', $uploadWindow);
			var $imgurButton = $('#imgur_button', $uploadWindow);
			var $imgurFileInput = $('#imgur_file', $uploadWindow);
			var $imgurUrlInput = $('#imgur_url', $uploadWindow);

			//Resetar campos al abrir la ventana
			$uploadWindow.on('show.bs.modal', function () {
				$('input, textarea', this).val('');
				$imgurButton.html('Seleccionar una o m&aacute;s im&aacute;genes...');
			});

			//Enfocar el input de insertar imagen por URL (Por defecto de FC)
			$uploadWindow.on('shown.bs.modal', function () {
				$urlInput.focus();
			});
			//E postear directamente al pulsar 'Enter', así mantenemos el mismo comportamiento que había antes 
			$urlInput.keypress(function (e) {
				if (e.which == 13 && $urlInput.val()) {
					//Link directo
					postImage($urlInput.val());
					$uploadWindow.modal('hide');
				}
			});

			//Al hacer clic en el botón, en realidad se hace clic sobre un input oculto
			$imgurButton.on('click', function () {
				$imgurFileInput.click();
			});

			//Mostrar numero de elementos seleccionados en el texto del botón
			$imgurFileInput.on('change', function (e) {
				var numFiles = e.originalEvent.target.files.length;
				$imgurButton.html(numFiles + " " + (numFiles > 1 ? "im&aacute;genes seleccionadas" : "imagen seleccionada"));
			});


			//Posteamos según lo que haya rellenado
			$uploadWindow.on('click', '#insert-images', function () {
				var value;
				if (value = $urlInput.val()) {
					//Link directo
					postImage(value);
				} else {
					//Imgur
					if (value = $imgurFileInput.val()) {
						//Subir fichero desde equipo
						value = handleFileSelect($imgurFileInput.get(0).files);
					} else if (value = $imgurUrlInput.val()) {
						//Subir desde URL
						value = uploadFromURL(value);
					}
				}

				//Cerramos la ventanta y si es Imgur, esperaremos a que desaparezca el 'Subiendo imágenes...'
				if (value) {
					$uploadWindow.modal('hide');
				}
			});

		}

		$uploadWindow.modal();
	}

	/**
	* Separa por saltos de línea las distintas URLs y las sube una a una.
	* @return Numero total de URLs que se subirán (las que no sean realmente URLs se descartan)
	*/
	function uploadFromURL(url) {

		var urls = url.split('\n');

		totalFiles += urls.length;

		$.each (urls, function (i, url) {
			if (url.indexOf('http') == 0) {
				upload(url, 'url');
			} else {
				totalFiles--;
			}
		});

		if (totalFiles) {
			showUploadingMessage();
		}

		return totalFiles;
	}

	/**
	* Recorrer los ficheros seleccionados, comprueba que sean imágenes y llama a la función de subida para cada uno.
	* @return Numero total de ficheros que se subiran (los que no sean imagenes se descartan)
	*/
	function handleFileSelect(files, evt) {
		if (evt) {
			evt.stopPropagation();
			evt.preventDefault();
		}

		totalFiles += files.length;

		// Recorremos los ficheros
		var reader;
		$.each(files, function (i, f) {
			// Solo imagenes
			if (f.type.match('image.*')) {
				reader = new FileReader();

				reader.onload = function (e) {
					upload(e.target.result);
				};

				reader.readAsDataURL(f);
			} else {
				totalFiles--;
			}
		});

		if (totalFiles) {
			showUploadingMessage();
		}

		return totalFiles;
	}

	/**
	* Sube el fichero codificado que le llega por parámetro a Imgur usando el Client ID configurado en el servidor
	* @param data Fichero a subir, ya sea en Base64 o una URL, depende del segundo parametro
	* @param type Tipo de subida: ['base64', 'url']
	*/
	function upload(data, type) {
		$.ajax({
			url: 'https://api.imgur.com/3/image',
			method: 'POST',
			headers: {
				Authorization: 'Client-ID ' + SHURSCRIPT.config.imgurClientID,
				Accept: 'application/json'
			},
			data: {
				image: data.replace(/^data:image\/.*;base64,/, ''),
				type: type || 'base64'
			}
		}).done(function (result) {
			postImage(result.data.link);
		}).fail(function (error) {
			var imgurError = JSON.parse(error.responseText).data.error;
			var errorString = "Ha ocurrido un error al subir la imagen a Imgur. Detalles: " + (imgurError.message || imgurError);
			mod.helper.showMessageBar({message: errorString, type: 'danger', timeout: 5000});
			mod.helper.throw("Error Imgur: " + error.responseText + "\nBase64 Image: " + data, error);
		}).always(function () {
			fileCount++;
			updateCounter();
		});
	}

	function showUploadingMessage() {
		if (!alreadyUploading) {
			alreadyUploading = true;
			bootbox.dialog({message: '<center>Subiendo im&aacute;genes...'
				+ '<div id="uploadprogress" style="margin-top: 10px;" class="hidden progress progress-striped active">'
	  			+ '<div class="progress-bar" style="width: 0%"></div></div></center>'});
		}
		updateCounter();
	}
	/**
	* Lleva la cuenta de las imagenes que se han subido y las que faltan por subir. Cuando finaliza, cierra la ventana.
	*/
	function updateCounter() {

		if (totalFiles > 1) {
			$('#uploadprogress').removeClass('hidden');
			$('#uploadprogress .progress-bar').css('width', (100 * fileCount / totalFiles) + '%');
			fileCount && $('#uploadprogress .progress-bar').text(fileCount + ' de ' + totalFiles);
		}

		if (fileCount == totalFiles) {
			alreadyUploading = false;
			totalFiles = fileCount = 0; //Reiniciamos contador
			bootbox.hideAll();
		}
	}

	function getEditor() {
		return mod.helper.environment.page == "/showthread.php" ? unsafeWindow.vB_Editor.vB_Editor_QR : unsafeWindow.vB_Editor.vB_Editor_001;
	}

	function postImage(link) {
		var text = '<br/>';
		if (mod.preferences.embedding == 'preview') {
			text += '<img src="' + link + '"/>';
		} else {
			text += '[IMG]' + link + "[/IMG]";
		}
		getEditor().insert_text(text);
	}

	mod.getPreferenceOptions = function () {
		var createPref = mod.helper.createPreferenceOption;

		return [
			createPref({
				type: 'radio',
				elements: [
					{value: 'preview', caption: 'Previsualizarla dentro de la caja de texto'},
					{value: 'bbcode', caption: 'Mostrarla solo entre etiquetas [IMG][/IMG]'}
				],
				caption: 'Al insertar la imagen:',
				mapsTo: 'embedding'
			})
		];
	};

})(jQuery, SHURSCRIPT.moduleManager.createModule);