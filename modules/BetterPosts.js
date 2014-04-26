(function ($, createModule, undefined) {
	'use strict';

	var mod = createModule({
		id: 'BetterPosts',
		name: 'Editor de posts mejorado',
		author: 'xuso0',
		version: '0.2',
		description: 'Activa varias opciones nuevas en la creación de posts e hilos, tanto el de respuesta rápida como el avanzado. <b>BETA</b>',
		domain: ['/showthread.php', '/newthread.php', '/newreply.php', '/editpost.php'],
		initialPreferences: {
			enabled: true, // Esta es opcional - por defecto true
			iconsAndButtons: true,
			autoGrow: true,
			multiQuickReply: true,
			autoSendReply: true,
			savePosts: true,
			postOverwrite: 'ASK'
		}
	});

	var vB_Editor;
	var genericHandler; //Handler para los botones
	var checkAutoGrow; //Checkbox para activar o desactivar el autogrow
	var minHeightTextArea;

	/**
	 * Activamos modo de carga normal (aunque viene activo por defecto)
	 * aqui se podrian hacer comprobaciones adicionales. No es nuestro caso
	 */
	mod.normalStartCheck = function () {
		return true;
	};

	/**
	 * Sobreescribimos la funcion de ejecucion
	 */
	mod.onNormalStart = function () {
		vB_Editor = unsafeWindow.vB_Editor;

		enableCommonFeatures();

		if (!isWYSIWYG()) { //Chrome, Safari, etc.
			enableWYSIWYG();
			var checkWYSIWYG = setInterval(function () {
				if (getEditor().editdoc.body) { //WYSIWYG activado
					clearInterval(checkWYSIWYG);
					enableWYSIWYGDependantFeatures();
				}
			}, 500);
		} else { //Firefox
			enableWYSIWYGDependantFeatures();
		}
	};

	mod.getPreferenceOptions = function () {
		// Para no repetir la ristra 15 veces, hacemos una referencia
		var createPref = mod.helper.createPreferenceOption;

		// Esto configurara el modal con 2 secciones, la primera con un group radio button,
		// la segunda con un checkbox y un input text
		return [
			// Hacemos un header
			createPref({type: 'checkbox', mapsTo: 'iconsAndButtons', caption: 'Mostrar nuevos botones e iconos en el formulario de respuesta rápida'}),
			createPref({type: 'checkbox', mapsTo: 'autoGrow', caption: 'La caja de texto crece a medida que se va escribiendo el post'}),
			createPref({type: 'checkbox', mapsTo: 'multiQuickReply', caption: 'Permitir multi-cita con el botón de Respuesta rápida (y mostrar la propia cita en la caja de texto)'}),
			createPref({type: 'checkbox', mapsTo: 'autoSendReply', caption: 'Auto-enviar el mensaje pasados los 30 segundos de espera entre post y post'}),
			createPref({type: 'checkbox', mapsTo: 'savePosts', caption: 'Guardar copia de los mensajes sin enviar para evitar perder el contenido de un post accidentalmente'}),

			// Metemos un par de radios
			createPref({
				type: 'radio',
				elements: [
					{value: 'ASK', caption: 'Preguntar'},
					{value: 'APPEND', caption: 'Añadir'},
					{value: 'OVERWRITE', caption: 'Sobreescribir'}
				],
				caption: 'Cuando cites con respuesta rápida y haya texto escrito en el editor ¿Quieres añadir la cita al texto actual o sobreescribirlo?:',
				mapsTo: 'postOverwrite'
			})
		];
	};

	function enableWYSIWYG() {

		var editor = getEditor();

		if (!isQuickReply()) {
			$('#' + editor.editorid + '_textarea').css('width', 600);
		}

		unsafeWindow.switch_editor_mode(editor.editorid);
		unsafeWindow.is_saf = false;
		unsafeWindow.is_moz = true;
		editor.wysiwyg_mode = 1;

		if ($('#' + editor.editorid + '_cmd_switchmode').length == 0) //Añadimos el boton de cambiar de Editor
			$('<td><div id="' + editor.editorid + '_cmd_switchmode" class="imagebutton" style="background: none repeat scroll 0% 0% rgb(225, 225, 226); color: rgb(0, 0, 0); padding: 1px; border: medium none;"><img height="20" width="21" alt="Cambiar Modo de Editor" src="http://cdn.forocoches.com/foro/images/editor/switchmode.gif" title="Cambiar Modo de Editor"></div></td>').insertAfter($('#vB_Editor_QR_cmd_resize_0_99').parent());
	}

	/* Funcionalidades que funcionan solo bajo el editor WYSIWYG */
	function enableWYSIWYGDependantFeatures() {

		//Lanzamos evento para que cualquier otro módulo sepa que se ha activado el WYSIWYG
		SHURSCRIPT.eventbus.triggerDelayed('editorReady', 0);

		if (isQuickReply() && mod.preferences.multiQuickReply) {
			enableQuickReplyWithQuote();
		}

		if (mod.preferences.autoGrow) {
			enableAutoGrow();
		}

		if (mod.preferences.savePosts) {
			enablePostRecovery();
		}

		if (mod.preferences.autoSendReply) {
			enableAutoSendReply();
		}

		if (isQuickReply()) {
			$("a[href^='editpost.php?do=editpost']").click(function () { //El editor de posts tambien tiene WYSIWYG
				var checkWYSIWYG = setInterval(function () { //Esperamos a que aparezca
					var currentEditorID = "vB_Editor_QE_" + unsafeWindow.vB_QuickEditor.editorcounter;
					if ($('#' + currentEditorID + "_editor").length > 0 && vB_Editor[currentEditorID]) {
						clearInterval(checkWYSIWYG);

						var currentEditor = vB_Editor[currentEditorID];

						if (currentEditor.wysiwyg_mode == 0) {
							unsafeWindow.switch_editor_mode(currentEditorID); //Una vez cargado el editor, lo cambiamos a WYSIWYG .
							currentEditor.wysiwyg_mode = 1;
							checkWYSIWYG = setInterval(function () { // Y volvemos a esperar a que cambie de modo
								if (vB_Editor[currentEditorID].editdoc.body) {
									clearInterval(checkWYSIWYG);
									enableQuickEditorFeatures(currentEditorID); //Una vez todo preparado, le añadimos las funciones.
								}
							}, 500);
						} else {
							enableQuickEditorFeatures(currentEditorID);
						}
					}
				}, 500);
			});
		}
	}

	/* Funcionalidades que funcionan en cualquier tipo de editor, WYSIWYG o no */
	function enableCommonFeatures() {
		if (isQuickReply() && mod.preferences.iconsAndButtons) {
			addAdvancedButtons();
			addIcons();
		}

		//Algunos navegadores insertan saltos de línea dobles sin motivo y es porque se meten <div>'s entre el código que devuelve el vB_Editor.
		//Parece ser un bug del vB en los navegadores que no soportan por defecto el WYSIWYG (Chrome, Opera...) [Tal vez por eso Ilitri no lo tiene activado]
		//Workaround: buscar y sustituir esos divs antes de enviar la respuesta
		$("input[name='sbutton'], input[name='preview']").on("click", function () {
			var contents = getEditorContents();
			contents = contents.replace(/<div>((?!<\/div>)(?!<div>).)*<\/div>/gi, function replacer(match) {
				var contenidoDivInutil = match.substring(5, match.length - 6); //quitamos los 5 primeros chars y los 6 ultimos de cada match, es decir <div> y </div>
				if (contenidoDivInutil == '<br>') return contenidoDivInutil;
				else return "<br>" + contenidoDivInutil;
			});
			setEditorContents(contents);
			reflowTextArea();
		});
	}

	/* Cuando se pulsa el botón Editar de un post, se crea un nuevo editor WYSIWYG */
	function enableQuickEditorFeatures(currentEditorID) {
		var currentEditor = vB_Editor[currentEditorID];
		if (mod.preferences.autoGrow) {
			/* Sin DOCTYPE, Chrome no calcula bien la altura del iframe */
			try {
				if (navigator.userAgent.indexOf("AppleWebKit") != -1) //Solo si estamos en Chrome, o en otro navegador WebKit. Si esta linea se ejecuta en Firefox se queda la página "Cargando..." indefinidamente :/
					currentEditor.editdoc.write('<!doctype HTML>\n' + currentEditor.editdoc.head.outerHTML + currentEditor.editdoc.body.outerHTML);
			} catch (e) {
				;
			}
			$(currentEditor.editdoc.body).on('input', function () {
				currentEditor.editbox.style.height = Math.max(currentEditor.editdoc.body.offsetHeight + 30, 200) + "px";
			});
			$(currentEditor.editdoc.body).trigger('input');
		}
	}

	/* La caja de texto va creciendo a medida que crece el contenido */
	function enableAutoGrow() {

		var editor = getEditor();

		/* Sin DOCTYPE, Chrome no calcula bien la altura del iframe */
		try {
			if (navigator.userAgent.indexOf("AppleWebKit") != -1) //Solo si estamos en Chrome, o en otro navegador WebKit. Si esta linea se ejecuta en Firefox se queda la pána "Cargando..." indefinidamente :/
				editor.editdoc.write('<!doctype HTML>\n' + editor.editdoc.head.outerHTML + editor.editdoc.body.outerHTML);
		} catch (e) {
			;
		}

		checkAutoGrow = $('<input type="checkbox" checked/>')[0];
		checkAutoGrow.onclick = function () {
			if (checkAutoGrow.checked) {
				reflowTextArea();
			} else {
				editor.editbox.style.height = minHeightTextArea + "px";
			}
		}
		$(editor.controlbar).find('> table > tbody > tr').first().append('<td></td>').append(checkAutoGrow);
		checkAutoGrow.title = 'Crecer automáticamente con el contenido';

		minHeightTextArea = isQuickReply() ? getTextAreaHeight() : unsafeWindow.fetch_cookie('editor_height') || 430;

		$(editor.editdoc.body).on('input', function () {
			if (checkAutoGrow.checked)
				reflowTextArea();
		});

		$("#vB_Editor_QR_cmd_resize_1_99").click(function () {
			checkAutoGrow.checked = false;
			reflowTextArea();
		});
		$("#vB_Editor_QR_cmd_resize_0_99").click(function () {
			checkAutoGrow.checked = false;
			reflowTextArea();
		});

		reflowTextArea();
	}

	/* Permite multi-citar con el botón de respuesta rápida. Además mete la cita en el cuadro de texto de forma visible. */
	function enableQuickReplyWithQuote() {

		var handler = function () {
			if (isWYSIWYG()) {
				var id = this.id.replace('qr_', '');
				var quote = '';

				var repeatedQuote = false;
				var multiQuotes = unsafeWindow.fetch_cookie("vbulletin_multiquote");
				if (multiQuotes && multiQuotes != "") {
					multiQuotes = multiQuotes.split(',');
					multiQuotes.forEach(function (quoteId) {
						if (id == quoteId) {
							repeatedQuote = true;
						}
						if ($("#post" + quoteId).length == 0) { //Ese post no existe, tal vez no es de este hilo
							return;
						}
						quote += getQuotedPost(quoteId);
						var img = $('img[id^="mq_' + quoteId + '"]');
						img.attr('src', img.attr('src').replace('_on.gif', '_off.gif')); //Quitamos la marca de multi-cita activa
					});
				}

				if (!repeatedQuote) {
					quote += getQuotedPost(id);
				}

				quote += "<br>"; //Dejar espacio entre las citas y el cursor de texto para que escriba el usuario

				if (trim(getEditorContents())) {
					var postOverwrite = mod.preferences.postOverwrite;
					switch (postOverwrite) {
						case 'ASK':
							bootbox.dialog({message: 'Actualmente hay texto escrito en el editor <b>¿Quieres añadir la cita al texto actual o sobreescribirlo?</b>',
								buttons: [
									{
										"label": "Cancelar",
										"className": "btn-default"
									},
									{
										"label": "Añadir",
										"className": "btn-primary",
										"callback": function () {
											appendTextToEditor(quote);
											reflowTextArea();
										}
									},
									{
										"label": "Sobreescribir",
										"className": "btn-danger",
										"callback": function () {
											setEditorContents(''); //Vaciamos el contenido actual
											appendTextToEditor(quote);
											reflowTextArea();
										}
									}
								]
							});
							break;
						case 'OVERWRITE':
							setEditorContents('');
						case 'APPEND':
							appendTextToEditor(quote);
							reflowTextArea();
							break;
					}
				} else {
					appendTextToEditor(quote);
					reflowTextArea();
				}

				unsafeWindow.set_cookie("vbulletin_multiquote", "");
			}
		};

		$('body').on('click', 'a[id^="qr_"]', handler);

		//Ocultamos el check de 'Citar mensaje en respuesta'. No lo eliminamos, si no lo encuentra se va a la respuesta Avanzada.
		$("#" + getEditor().editorid).siblings().filter('fieldset').first().hide();

	}

	function getQuotedPost(id) {
		var username = $("#post" + id).find(".bigusername").text();
		var $post = $("#post_message_" + id).clone(); //Clonamos para no modificar el original

		//Quitar QUOTEs al post
		$post.find("div[style*='margin:20px; margin-top:5px;']").remove();

		//Quitar código y reemplazarlos por su BBCode
		$post.find("div[style='margin:20px; margin-top:5px'] > .smallfont:contains('Código')").parent().each(function () {
				var code = $(this).find('.alt2');

				var title = $(this).find('.smallfont').text();

				if (title == "Código HTML:") {

					code.find('span').each(function () {
						var br = (this.nextSibling && this.nextSibling.textContent.indexOf("\n") == 0 ? "</br>" : "");
						this.outerHTML = $(this).text().replace(/</g, '&lt;') + br; //Escapar HTML y mantener saltos de linea
					});

					code = code.html().replace(/ /g, "&nbsp;");
					$(this).replaceWith("[HTML]</br>" + code.trim() + "</br>[/HTML]");
					return;
				}

				if (title == "Código PHP:") {
					code = code.find('code span');
					code.find('span').each(function () {
						this.outerHTML = this.innerHTML; //Cambiar los SPAN por su contenido
					});

					code = code.html().replace(/ /g, "&nbsp;");

					$(this).replaceWith("[PHP]</br>" + code.trim() + "</br>[/PHP]");
					return;
				}

				code = code.text();
				code = code.replace(/\n/g, "</br>").replace(/\ /g, "&nbsp;"); //Mantener espacios y saltos de linea
				if (title == "Código:") {
					$(this).replaceWith("[CODE]</br>" + code.trim() + "</br>[/CODE]");
				}

			}
		);

		//Quitar videos de Youtube y reemplazarlos por su BBCode
		$post.find("iframe.youtube-player").each(function () {
				var youtubeID = $(this).attr('src').match(/^.*\/(.*)/)[1];
				$(this).replaceWith("[YOUTUBE]" + youtubeID + "[/YOUTUBE]");
			}
		);

		//Cambiar <img> por [IMG] para no descuadrar el editor con imagenes grandes
		$post.find('img[class!="inlineimg"]').each(function () {
				$(this).replaceWith("[IMG]" + $(this).attr('src') + "[/IMG]")
			}
		);

		return "[QUOTE=" + username + ";" + id + "]" + $post.html().trim() + "[/QUOTE]" + "<br><br>";
	}

	/* Sistema de auto-guardado de posts para evitar perder posts no enviados */
	function enablePostRecovery() {
		var threadId = $('input[name="t"]').val();
		if (!threadId && mod.helper.environment.page == '/newthread.php')
			threadId = 'new_thread';

		var currentPostBackup = mod.helper.getValue("POST_BACKUP");

		if (currentPostBackup && isQuickReply()) {
			currentPostBackup = JSON.parse(currentPostBackup);
			if (currentPostBackup.threadId == threadId) {
				if (!trim(getEditorContents()) && trim(currentPostBackup.postContents)) {
					setEditorContents(currentPostBackup.postContents)
				}
				;
				reflowTextArea();
			}
		}

		//Temporizador de auto-guardado
		var backupScheduler;
		var onInputHandler = function () {
			clearTimeout(backupScheduler);
			backupScheduler = setTimeout(function () { //
				mod.helper.setValue("POST_BACKUP", JSON.stringify({threadId: threadId, postContents: getEditorContents()}));
			}, 1000);
		};

		$(getEditor().editdoc.body).on('input', onInputHandler);

		// Eliminar el backup guardado al enviar la Respuesta
		// Toda esta parafernalia es por la issue #16, el formulario se envia antes de siquiera hacer la llamada a nuestro servidor
		// Solo es necesario en el formulario avanzado, el de respuesta rapida se envia por AJAX y no cambia de página
		if (isQuickReply()) {
			$("input[name='sbutton']").on("click", function () {
				mod.helper.deleteValue("POST_BACKUP");
			});
		} else {
			var $sendButton = $("input[name='sbutton']");
			$sendButton.attr("type", "button"); //Le quitamos el type 'submit' para que no envie el formulario
			var sendForm = $sendButton.parents('form')[0];

			$sendButton.on("click", function (e) {
				if (sendForm.onsubmit()) { //Comprobaciones del formulario original: minimo 2 caracteres, etc.
					mod.helper.deleteValue("POST_BACKUP", function () { //Eliminamos backup
						sendForm.submit(); //Submit manual
					});
				}
			});
		}
	}

	/* Al enviar la respuesta, se comprueba si nos han hecho esperar */
	function enableAutoSendReply() {
		var checkWaiting = function () {
			var timeToWait;
			if (unsafeWindow.autoReplyInterval) { //Si hay alguno activo lo desactivamos
				clearInterval(unsafeWindow.autoReplyInterval);
			}
			var interval = setInterval(function () {
				var errors = $("td.alt1 ol");
				if (errors.length > 0 && errors.text().indexOf("Debes esperar") != -1) {
					errors = errors.find("li").first();
					timeToWait = timeToWait || parseInt(errors.text().match(/en ([\d]+)/)[1]);

					if ((timeToWait--) <= 0) {
						clearInterval(interval);
						mod.helper.deleteValue("POST_BACKUP");
						$("form[name='vbform']").submit();
					} else {
						errors.html("Debes esperar al menos 30 segundos entre cada envio de nuevos mensajes. El mensaje se enviará automáticamente en " + (timeToWait) + " segundos. <a style='color: #CC3300;cursor:pointer;' onclick='clearInterval(autoReplyInterval); this.remove();'>Cancelar</a>");
					}

				} else {
					clearInterval(interval);
				}
			}, 1000);
			unsafeWindow.autoReplyInterval = interval;
		};

		if (!isQuickReply()) { //En la respuesta avanzada se envia la página y vuelve con el temporizador, entonces no tiene sentido aplicarle el evento al botón, si no cuando carga la página comprobarlo.
			checkWaiting();
		} else {
			$("input[name='sbutton']").on("click", checkWaiting);
		}
	}

	/* Añade accesos directos a algunos iconos en al respuesta rápida */
	function addIcons() {

		var fieldset = $('<fieldset class="fieldset" style="margin:3px 0px 0px 0px"><legend>Iconos</legend></fieldset>');
		$("#" + getEditor().editorid).parent().append(fieldset);

		fieldset.append(createIcon(":roto2:", "http://cdn.forocoches.com/foro/images/smilies/goofy.gif", 164));
		fieldset.append(createIcon(":sisi3:", "http://cdn.forocoches.com/foro/images/smilies/sisi3.gif", 324));
		fieldset.append(createIcon(":mola:", "http://cdn.forocoches.com/foro/images/smilies/thumbsup.gif", 48));
		fieldset.append(createIcon(":cantarin:", "http://cdn.forocoches.com/foro/images/smilies/Sing.gif", 101));
		fieldset.append(createIcon(":qmeparto:", "http://cdn.forocoches.com/foro/images/smilies/meparto.gif", 142));
		fieldset.append(createIcon(":nusenuse:", "http://cdn.forocoches.com/foro/images/smilies/nusenuse.gif", 283));
		fieldset.append(createIcon(":facepalm:", "http://cdn.forocoches.com/foro/images/smilies/facepalm.gif", 318));
		fieldset.append(createIcon(":zpalomita", "http://cdn.forocoches.com/foro/images/smilies/icon_popcorn.gif", 215));
		fieldset.append(createIcon(":zplatano2", "http://cdn.forocoches.com/foro/images/smilies/b2.gif", 236));
		fieldset.append(createIcon(":number1:", "http://cdn.forocoches.com/foro/images/smilies/number_one.gif", 268));
		fieldset.append(createIcon(":elrisas:", "http://cdn.forocoches.com/foro/images/smilies/qmeparto.gif", 76));
		fieldset.append(createIcon(":gaydude:", "http://cdn.forocoches.com/foro/images/smilies/gaydude.gif", 264));
		fieldset.append(createIcon(":sisi1:", "http://cdn.forocoches.com/foro/images/smilies/sisi1.gif", 299));
		fieldset.append(createIcon(":babeando:", "http://cdn.forocoches.com/foro/images/smilies/babeando.gif", 274));
		fieldset.append(createIcon(":elboinas:", "http://cdn.forocoches.com/foro/images/smilies/elboinas.gif", 314));
		/* 		fieldset.append(createIcon(":sherlock:", "http://cdn.forocoches.com/foro/images/smilies/sherlock.gif", 281)); */
		fieldset.append(createIcon(":qtedoy:", "http://cdn.forocoches.com/foro/images/smilies/smiley_1140.gif", 191));
		fieldset.append(createIcon(":abrazo:", "http://cdn.forocoches.com/foro/images/smilies/abrazo.gif", 161));
		var more = $("<a href='#qrform'>Más...</a>");
		more.click(function () {
			getEditor().open_smilie_window(785, 500);
		});
		fieldset.append(more);
	}

	function createIcon(name, src, id) {
		return '<img border="0" class="inlineimg" src="' + src + '" style="cursor: pointer; padding: 5px;" onclick="vB_Editor.' + getEditor().editorid + '.insert_smilie(undefined, \'' + name + '\', \'' + src + '\', ' + id + ')">';
	}

	/* Añade nuevos botones que hasta ahora solo estaban disponibles en la versión Avanzada*/
	function addAdvancedButtons() {

		genericHandler = function (A) {
			A = unsafeWindow.do_an_e(A);
			if (A.type == "click") {
				vB_Editor[getEditor().editorid].format(A, this.cmd, false, true)
			}
			vB_Editor[getEditor().editorid].button_context(this, A.type)
		};

		var toolbar = $(getEditor().controlbar).find('> table > tbody > tr > td:nth-child(8)');

		var buttons = [];
		buttons.push(createButton("justifyleft", "Alinear a la Izquierda"));
		buttons.push(createButton("justifycenter", "Alinear al Centro"));
		buttons.push(createButton("justifyright", "Alinear a la Derecha"));
		buttons.push('<td><img width="6" height="20" alt="" src="http://cdn.forocoches.com/foro/images/editor/separator.gif"></td>');
		buttons.push(createButton("insertorderedlist", "Lista Ordenada"));
		buttons.push(createButton("insertunorderedlist", "Lista sin Ordenar"));
		buttons.push('<td><img width="6" height="20" alt="" src="http://cdn.forocoches.com/foro/images/editor/separator.gif"></td>');
		buttons.push(createButton("undo", "Deshacer"));
		buttons.push(createButton("redo", "Rehacer"));
		buttons.push('<td><img width="6" height="20" alt="" src="http://cdn.forocoches.com/foro/images/editor/separator.gif"></td>');
		buttons.push(createButton("wrap0_code", "Envolver Etiquetas [CODE]", 'code'));
		buttons.push(createButton("wrap0_html", "Envolver Etiquetas [HTML]", 'html'));
		buttons.push(createButton("wrap0_php", "Envolver Etiquetas [PHP]", 'php'));
		buttons.push('<td><img width="6" height="20" alt="" src="http://cdn.forocoches.com/foro/images/editor/separator.gif"></td>');

		toolbar.after(buttons);
	}

	function createButton(action, text, icon) {
		var img = icon ? icon : action;
		var button = $('<div id="vB_Editor_001_cmd_' + action + '" class="imagebutton" style="background: none repeat scroll 0% 0% rgb(225, 225, 226); color: rgb(0, 0, 0); padding: 1px; border: medium none;"><img width="21" height="20" alt="' + text + '" src="http://cdn.forocoches.com/foro/images/editor/' + img + '.gif" title="' + text + '"></div>')[0];
		button.editorid = getEditor().editorid;
		button.cmd = action;
		button.onclick = button.onmousedown = button.onmouseover = button.onmouseout = genericHandler;
		return $('<td></td>').append(button);
	}

	/* Utils */

	/* Fuerza la caja a adaptarse al contenido */
	function reflowTextArea() {
		if (checkAutoGrow && checkAutoGrow.checked) {
			getEditor().editbox.style.height = Math.min(600, Math.max(getTextAreaHeight() + 30, minHeightTextArea)) + "px";
		}
	}

	function getTextAreaHeight() {
		var height = getEditor().editdoc.body.offsetHeight;
		return Math.max(height, 100);
	}

	function getEditor() {
		return mod.helper.environment.page == "/showthread.php" ? vB_Editor.vB_Editor_QR : vB_Editor.vB_Editor_001;
	}

	function isQuickReply() {
		return getEditor().editorid == 'vB_Editor_QR';
	}

	function isWYSIWYG() {
		return getEditor().wysiwyg_mode == 1;
	}

	function getEditorContents() {
		return getEditor().get_editor_contents();
	}

	function setEditorContents(text) {
		focusEditor();
		getEditor().set_editor_contents(text)
	}

	function appendTextToEditor(text) {
		focusEditor();
		getEditor().insert_text(text);
	}

	function focusEditor() {
		getEditor().editdoc.body.focus();
	}

	function trim(text) {
		return text.trim().replace(/\<br\>/g, '');
	}

})(jQuery, SHURSCRIPT.moduleManager.createModule);
