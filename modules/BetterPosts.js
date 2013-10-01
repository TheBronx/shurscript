
function BetterPosts() {

	this.id = arguments.callee.name;
	this.name = "Editor de posts mejorado";
	this.author = "xusoo";
	this.version = "0.1";
	this.description = "Activa varias opciones nuevas en la creación de posts e hilos, tanto el de respuesta rápida como el avanzado. <b>BETA</b>";
	this.enabledByDefault = true;
	
	
	var helper = new ScriptHelper(this.id);
	
	var vB_Editor;
	var genericHandler; //Handler para los botones
	var checkAutoGrow; //Checkbox para activar o desactivar el autogrow
	var minHeightTextArea;

	this.shouldLoad = function() {
		 return page == "/showthread.php" || page == '/newthread.php' || page == "/newreply.php" || page == "/editpost.php";
	}
	

	this.load = function() {
		vB_Editor = unsafeWindow.vB_Editor;
		
		enableCommonFeatures();
		
		if (!isWYSIWYG()) { //Chrome, Safari, etc.
			enableWYSIWYG();
			var checkWYSIWYG = setInterval(function(){
				if (getEditor().editdoc.body) { //WYSIWYG activado
					clearInterval(checkWYSIWYG);
					enableWYSIWYGDependantFeatures();
				}
			}, 500);
		} else { //Firefox
			enableWYSIWYGDependantFeatures();
		}
		

	}
	
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
		
		if (isQuickReply() && helper.getValue('MULTI_QUICK_REPLY', true)) {			
			enableQuickReplyWithQuote();
		}
		
		if (helper.getValue('AUTO_GROW', true)) {
			enableAutoGrow();
		}
		
		if (helper.getValue('SAVE_POSTS', true)) {
			enablePostRecovery();
		}
		
		if (helper.getValue("AUTO_SEND_REPLY", true)) {
			enableAutoSendReply();
		}
		
		if (isQuickReply()) {
			$("a[href^='editpost.php?do=editpost']").click(function(){ //El editor de posts tambien tiene WYSIWYG
				var checkWYSIWYG = setInterval(function(){ //Esperamos a que aparezca
					var currentEditorID = "vB_Editor_QE_" + unsafeWindow.vB_QuickEditor.editorcounter;
					if ($('#' + currentEditorID + "_editor").length > 0 && vB_Editor[currentEditorID]) {
						clearInterval(checkWYSIWYG);
	
						var currentEditor = vB_Editor[currentEditorID];
						
						if (currentEditor.wysiwyg_mode == 0) {
							unsafeWindow.switch_editor_mode(currentEditorID); //Una vez cargado el editor, lo cambiamos a WYSIWYG .
							currentEditor.wysiwyg_mode = 1;
							checkWYSIWYG = setInterval(function(){ // Y volvemos a esperar a que cambie de modo
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
		if (isQuickReply() && helper.getValue('ICONS_AND_BUTTONS', true)) {
			addAdvancedButtons();
			addIcons();
		}
		
	}
	
	
	/* Cuando se pulsa el botón Editar de un post, se crea un nuevo editor WYSIWYG */
	function enableQuickEditorFeatures(currentEditorID) {
		var currentEditor = vB_Editor[currentEditorID];
		if (helper.getValue('AUTO_GROW', true)) {
			/* Sin DOCTYPE, Chrome no calcula bien la altura del iframe */
			try {
				if (navigator.userAgent.indexOf("AppleWebKit") != -1) //Solo si estamos en Chrome, o en otro navegador WebKit. Si esta linea se ejecuta en Firefox se queda la página "Cargando..." indefinidamente :/
					currentEditor.editdoc.write('<!doctype HTML>\n' + currentEditor.editdoc.head.outerHTML + currentEditor.editdoc.body.outerHTML);
			} catch (e) {
				;
			}
			$(currentEditor.editdoc.body).on('input', function() {
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
			if (navigator.userAgent.indexOf("AppleWebKit") != -1) //Solo si estamos en Chrome, o en otro navegador WebKit. Si esta linea se ejecuta en Firefox se queda la página "Cargando..." indefinidamente :/
				editor.editdoc.write('<!doctype HTML>\n' + editor.editdoc.head.outerHTML + editor.editdoc.body.outerHTML);
		} catch (e) {
			;
		}
	
		checkAutoGrow = $('<input type="checkbox" checked/>')[0];
		checkAutoGrow.onclick = function() {
			if (checkAutoGrow.checked) {
				reflowTextArea();
			} else {
				editor.editbox.style.height = minHeightTextArea + "px";
			}
		}
		$(editor.controlbar).find('> table > tbody > tr').first().append('<td></td>').append(checkAutoGrow);
		checkAutoGrow.title = 'Crecer automáticamente con el contenido';
	
		minHeightTextArea = isQuickReply() ? getTextAreaHeight() : unsafeWindow.fetch_cookie('editor_height') || 430;
			
		$(editor.editdoc.body).on('input', function(){
			if (checkAutoGrow.checked)
				reflowTextArea();
		});	
		
		$("#vB_Editor_QR_cmd_resize_1_99").click(function() {
			checkAutoGrow.checked = false;
			reflowTextArea();
		});
		$("#vB_Editor_QR_cmd_resize_0_99").click(function() {
			checkAutoGrow.checked = false;
			reflowTextArea();
		});
		
		reflowTextArea();
	}
	
		
	/* Permite multi-citar con el botón de respuesta rápida. Además mete la cita en el cuadro de texto de forma visible. */
	function enableQuickReplyWithQuote(){
    	
    	var handler = function(){
	    	if (isWYSIWYG()) {
			    var id = this.id.replace('qr_','');
			    var quote = '';
			    
			    var repeatedQuote = false;
				var multiQuotes = unsafeWindow.fetch_cookie("vbulletin_multiquote");
			    if (multiQuotes && multiQuotes != "") {
			    	multiQuotes = multiQuotes.split(',');
			    	multiQuotes.forEach(function(quoteId){
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
			    
			    if (getEditorContents().trim().replace(/\<br\>/g,'') != '') {
			    	var postOverwrite = helper.getValue('POST_OVERWRITE', 'ASK');
			    	switch (postOverwrite) {
				    	case 'ASK':
					    	bootbox.dialog({message:'Actualmente hay texto escrito en el editor <b>¿Quieres añadir la cita al texto actual o sobreescribirlo?</b>', 
					        	buttons:[{
									"label" : "Cancelar",
									"className" : "btn-default"
									}, {
									"label" : "Añadir",
									"className" : "btn-primary",
									"callback": function() {
										appendTextToEditor(quote);	
										reflowTextArea();
										}
									}, {
										"label" : "Sobreescribir",
										"className" : "btn-danger",
										"callback": function() {
												setEditorContents(''); //Vaciamos el contenido actual
												appendTextToEditor(quote);	
												reflowTextArea();
											}
									}]
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
	    
	    //Ocultamos el check de 'Citar mensaje en respuesta'. No lo eliminamos, si no lo encuentra se va a la respuesta Avanzada.
	    $("#" + getEditor().editorid).siblings().filter('fieldset').first().hide();
	    

	    //Lanzamos un timer que va comprobando si se han añadido nuevas respuestas para añadirles el manejador de respuesta rápida
	    setInterval(function() {
		    var buttonsList = $('a[id^="qr_"]').not(".shurscripted");
		    buttonsList.addClass("shurscripted");
		    buttonsList.click(handler);
	    }, 1000);
	    
	}
	
	function getQuotedPost(id) {
		var username = $("#post" + id).find(".bigusername").text();
		var $post = $("#post_message_" + id).clone(); //Clonamos para no modificar el original
		
		//Quitar QUOTEs al post
		$post.find("div[style*='margin:20px; margin-top:5px;']").remove();
		
		//Quitar código y reemplazarlos por su BBCode
		/*
$post.find("div[style='margin:20px; margin-top:5px'] > .smallfont:contains('Código')").parent().each(function() {
		    	var code = $(this).find('pre').text();
		    	$(this).replaceWith("[CODE]<pre>" + code + "</pre>[/CODE]");
		    }
	    );
*/
	    
	    //Quitar código y reemplazarlos por su BBCode
		$post.find("div[style='margin:20px; margin-top:5px'] > .smallfont:contains('Código')").parent().each(function() {
				var code = $(this).find('.alt2');
		
		    	var title = $(this).find('.smallfont').text();

		    	if (title == "Código HTML:") {
			    	
		    		code.find('span').each(function() {
		    			var br = (this.nextSibling && this.nextSibling.textContent.indexOf("\n") == 0 ? "</br>" : "");
				    	this.outerHTML = $(this).text().replace(/</g, '&lt;') + br; //Escapar HTML y mantener saltos de linea
			    	});
			    	
			    	code = code.html().replace(/ /g, "&nbsp;");
			    	$(this).replaceWith("[HTML]</br>" + code.trim() + "</br>[/HTML]");
			    	return;
		    	} 
		    	
		    	
		    	if (title == "Código PHP:") {
		    		code = code.find('code span');
		    		code.find('span').each(function() {
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
	    $post.find("iframe.youtube-player").each(function() {
		    	var youtubeID = $(this).attr('src').match(/^.*\/(.*)/)[1];
		    	$(this).replaceWith("[YOUTUBE]" + youtubeID + "[/YOUTUBE]");
		    }
	    );
	    
	    //Cambiar <img> por [IMG] para no descuadrar el editor con imagenes grandes
	    $post.find('img[class!="inlineimg"]').each(function() {
	    		$(this).replaceWith("[IMG]" + $(this).attr('src') + "[/IMG]")
	    	}
	    );
	    
	    return "[QUOTE=" + username + ";" + id + "]" + $post.html().trim() + "[/QUOTE]" + "<br><br>";
	}
		

	/* Sistema de auto-guardado de posts para evitar perder posts no enviados */
	function enablePostRecovery() {
		var threadId = $('input[name="t"]').val();
		if (!threadId && page == '/newthread.php')
			threadId = 'new_thread';
			
		var currentPostBackup = helper.getValue("POST_BACKUP");
		if (currentPostBackup) {
			currentPostBackup = JSON.parse(currentPostBackup);
			if (currentPostBackup.threadId == threadId) {
				if (getEditorContents().trim().replace(/\<br\>/g,'') == '') {
					setEditorContents(currentPostBackup.postContents)
				};
		    	reflowTextArea();
			}
		}
		
		
		//Temporizador de auto-guardado cada vez que se escribe
		var backupScheduler;
		var onInputHandler = function(){
			clearTimeout(backupScheduler);
			backupScheduler = setTimeout(function() { //
				helper.setValue("POST_BACKUP", JSON.stringify({threadId: threadId, postContents: getEditorContents()}));				
			}, 500);
		};
		
		$(getEditor().editdoc.body).on('input', onInputHandler);
				
				
		//Al enviar la respuesta, se elimina el backup
		$("input[name='sbutton']").on("click", function() {
			helper.deleteValue("POST_BACKUP");
		});
		
		
	}
	
    /* Al enviar la respuesta, se comprueba si nos han hecho esperar */
	function enableAutoSendReply() {
		var checkWaiting = function() {
			var timeToWait;
			if (unsafeWindow.autoReplyInterval) { //Si hay alguno activo lo desactivamos
				clearInterval(unsafeWindow.autoReplyInterval);
			}
			var interval = setInterval(function() {
				var errors = $("td.alt1 ol");
				if (errors.length > 0 && errors.text().indexOf("Debes esperar") != -1) {
					errors = errors.find("li").first();
					timeToWait = timeToWait || parseInt(errors.text().match(/en ([\d]+)/)[1]);
					
					if ((timeToWait--) <= 0) {
						clearInterval(interval);
						helper.deleteValue("POST_BACKUP");
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
		more.click(function() {
			getEditor().open_smilie_window(785, 500);
		});
		fieldset.append(more);
	}
	
	function createIcon(name, src, id) {
		return '<img border="0" class="inlineimg" src="' + src + '" style="cursor: pointer; padding: 5px;" onclick="vB_Editor.' + getEditor().editorid + '.insert_smilie(undefined, \'' + name + '\', \'' + src + '\', ' + id + ')">';
	}
	
	/* Añade nuevos botones que hasta ahora solo estaban disponibles en la versión Avanzada*/
	function addAdvancedButtons() {
		
		genericHandler = function (A){A=unsafeWindow.do_an_e(A);if(A.type=="click"){vB_Editor[getEditor().editorid].format(A,this.cmd,false,true)}vB_Editor[getEditor().editorid].button_context(this,A.type)};
	
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
			getEditor().editbox.style.height = Math.max(getTextAreaHeight() + 30, minHeightTextArea) + "px";
		}
	}
	
	function getTextAreaHeight() {
		var height = getEditor().editdoc.body.offsetHeight;
		return Math.max(height, 100);
	}
	
	function getEditor() {
		return page == "/showthread.php" ? vB_Editor.vB_Editor_QR : vB_Editor.vB_Editor_001;
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
		getEditor().set_editor_contents(text)
	}
	
	function appendTextToEditor(text) {
		getEditor().insert_text(text);
	}
	
	this.getPreferences = function() {
		var preferences = new Array();
		
		preferences.push(new BooleanPreference("ICONS_AND_BUTTONS", true, "Mostrar nuevos botones e iconos en el formulario de respuesta rápida"));
		preferences.push(new BooleanPreference("AUTO_GROW", true, "La caja de texto crece a medida que se va escribiendo el post"));
		preferences.push(new BooleanPreference("MULTI_QUICK_REPLY", true, "Permitir multi-cita con el botón de Respuesta rápida (y mostrar la propia cita en la caja de texto)"));
		preferences.push(new BooleanPreference("AUTO_SEND_REPLY", true, "Auto-enviar el mensaje pasados los 30 segundos de espera entre post y post"));
		preferences.push(new BooleanPreference("SAVE_POSTS", true, "Guardar copia de los mensajes sin enviar para evitar perder el contenido de un post accidentalmente"));
		
		var options = [new RadioOption("ASK", "Preguntar"), new RadioOption("APPEND", "Añadir"), new RadioOption("OVERWRITE", "Sobreescribir")];
		preferences.push(new RadioPreference("POST_OVERWRITE", "ASK", options, "Cuando cites con respuesta rápida y haya texto escrito en el editor <b>¿Quieres añadir la cita al texto actual o sobreescribirlo?:"));
		
		return preferences;
	};
	
	
}
