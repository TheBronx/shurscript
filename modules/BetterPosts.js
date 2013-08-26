

function BetterPosts() {

	this.id = arguments.callee.name;
	this.name = "Editor de posts mejorado";
	this.author = "xusoo";
	this.version = "0.1";
	this.description = "Activa varias opciones nuevas en la creación de posts e hilos, tanto el de respuesta rápida como el avanzado. <b>BETA</b>";
	this.enabledByDefault = true;
	
	
	var helper = new ScriptHelper(this.id);
	
	var vB_Editor;
	var genericHandler;
	var checkAutoGrow;
	var minHeightTextArea;
	var mirrorTextarea; //TextArea identico oculto para los casos no-WYSIWYG.
	
	this.shouldLoad = function() {
		 return page == "/showthread.php" || page == '/newthread.php' || page == "/newreply.php" || page == "/editpost.php";
	}
	

	this.load = function() {
		vB_Editor = unsafeWindow.vB_Editor;
		if (page == "/showthread.php") {
			genericHandler = function (A){A=unsafeWindow.do_an_e(A);if(A.type=="click"){vB_Editor[getEditor().editorid].format(A,this.cmd,false,true)}vB_Editor[getEditor().editorid].button_context(this,A.type)};
			
			if (helper.getValue('MULTI_QUICK_REPLY', true) && isWYSIWYG()) {
				enableQuickReplyWithQuote();
			}
			
			if (helper.getValue('ICONS_AND_BUTTONS', true)) {
				addAdvancedButtons();
				addIcons();
			}
			
/* 			quickPreview(); */
		}
		
		if (helper.getValue('AUTO_GROW', true)) {
			enableAutoGrow();
		}
		
		enablePostRecovery();
		
	}
	
	/* La caja de texto va creciendo a medida que crece el contenido */
	function enableAutoGrow() {
		checkAutoGrow = $('<input type="checkbox" checked/>')[0];
		checkAutoGrow.onclick = function() {
			if (checkAutoGrow.checked) {
				reflowTextArea();
			} else {
				getEditor().editbox.style.height = minHeightTextArea + "px";
			}
		}
		$(getEditor().controlbar).find('> table > tbody > tr').first().append('<td></td>').append(checkAutoGrow);
		checkAutoGrow.title = 'Crecer automáticamente con el contenido';
	
		minHeightTextArea = isQuickReply() ? getTextAreaHeight() : unsafeWindow.fetch_cookie('editor_height');
		var onInputHandler = function(){
				if (checkAutoGrow.checked) reflowTextArea();
			};
		if (isWYSIWYG()) { //Si soporta WYSIWYG
			$(getEditor().editdoc.body).on('input', onInputHandler);
		}
		$(getEditor().textobj).on('input', onInputHandler); //Todos tienen TextArea
	
		
		$("#vB_Editor_QR_cmd_resize_1_99").click(function() {
			checkAutoGrow.checked = false;
			reflowTextArea();
		});
		$("#vB_Editor_QR_cmd_resize_0_99").click(function() {
			checkAutoGrow.checked = false;
			reflowTextArea();
		});
		
		$("a[href^='editpost.php?do=editpost']").click(function(){ //El editor de posts tambien tiene auto-grow
			setTimeout(function(){
				
				if (isWYSIWYG()) {
					$(vB_Editor.vB_Editor_QE_1.editdoc.body).on('input', function() {
						vB_Editor.vB_Editor_QE_1.editbox.style.height = Math.max(vB_Editor.vB_Editor_QE_1.editdoc.body.offsetHeight + 30, 200) + "px";
					});
					$(vB_Editor.vB_Editor_QE_1.editdoc.body).trigger('input');
				}
				
				$(vB_Editor.vB_Editor_QE_1.textobj).on('input', function() {
					vB_Editor.vB_Editor_QE_1.textobj.style.height = "0px"; //Resetear tamaño
					vB_Editor.vB_Editor_QE_1.textobj.style.height = Math.max(vB_Editor.vB_Editor_QE_1.textobj.scrollHeight, 200) + "px";
				});
				$(vB_Editor.vB_Editor_QE_1.textobj).trigger('input');
				
				
			}, 1000);
			
		});
		
		//TextArea copia para calcular el tamaño de la original
		var originalTextarea = $(getEditor().textobj);
		mirrorTextarea = $("<textarea>");
		mirrorTextarea.css('height', 100);
		mirrorTextarea.css('width', originalTextarea.width());
		mirrorTextarea.css('position', 'absolute');
		mirrorTextarea.css('top', '-999px'); //Que este fuera de la pantalla. Si está oculta (display:none) no se calcula el tamaño
		$(document.body).append(mirrorTextarea);
		
		reflowTextArea();
	}
	
	/* Añade accesos directos a algunos iconos en al respuesta rápida */
	function addIcons() {
		
		var fieldset = $('<fieldset class="fieldset" style="margin:3px 0px 0px 0px"><legend>Iconos</legend></fieldset>');
		$("#" + getEditor().editorid).parent().append(fieldset);
				
		fieldset.append(createIcon(":roto2:", "http://st.forocoches.com/foro/images/smilies/goofy.gif", 164));
		fieldset.append(createIcon(":sisi3:", "http://st.forocoches.com/foro/images/smilies/sisi3.gif", 324));
		fieldset.append(createIcon(":mola:", "http://st.forocoches.com/foro/images/smilies/thumbsup.gif", 48));
		fieldset.append(createIcon(":cantarin:", "http://st.forocoches.com/foro/images/smilies/Sing.gif", 101));
		fieldset.append(createIcon(":qmeparto:", "http://st.forocoches.com/foro/images/smilies/meparto.gif", 142));
		fieldset.append(createIcon(":nusenuse:", "http://st.forocoches.com/foro/images/smilies/nusenuse.gif", 283));
		fieldset.append(createIcon(":zpalomita", "http://st.forocoches.com/foro/images/smilies/icon_popcorn.gif", 215));
		fieldset.append(createIcon(":zplatano2", "http://st.forocoches.com/foro/images/smilies/b2.gif", 236));
		fieldset.append(createIcon(":number1:", "http://st.forocoches.com/foro/images/smilies/number_one.gif", 268));
		fieldset.append(createIcon(":elrisas:", "http://st.forocoches.com/foro/images/smilies/qmeparto.gif", 76));
		fieldset.append(createIcon(":gaydude:", "http://st.forocoches.com/foro/images/smilies/gaydude.gif", 264));
		fieldset.append(createIcon(":sisi1:", "http://st.forocoches.com/foro/images/smilies/sisi1.gif", 299));
		fieldset.append(createIcon(":babeando:", "http://st.forocoches.com/foro/images/smilies/babeando.gif", 274));
		fieldset.append(createIcon(":elboinas:", "http://st.forocoches.com/foro/images/smilies/elboinas.gif", 314));
		fieldset.append(createIcon(":sherlock:", "http://st.forocoches.com/foro/images/smilies/sherlock.gif", 281));
		fieldset.append(createIcon(":qtedoy:", "http://st.forocoches.com/foro/images/smilies/smiley_1140.gif", 191));
		fieldset.append(createIcon(":abrazo:", "http://st.forocoches.com/foro/images/smilies/abrazo.gif", 161));
		var more = $("<a href='#qrform'>Más...</a>");
		more.click(function() {
			getEditor().open_smilie_window(785, 500);
		});
		fieldset.append(more);
	}
	
	function createIcon(name, src, id) {
		return '<img border="0" class="inlineimg" src="' + src + '" style="cursor: pointer; padding: 5px;" onclick="vB_Editor.' + getEditor().editorid + '.insert_smilie(undefined, \'' + name + '\', \'' + src + '\', ' + id + ')">';
	}
		
	/* Permite multi-citar con el botón de respuesta rápida. Además mete la cita en el cuadro de texto de forma explícita. */
	function enableQuickReplyWithQuote(){
		$("#" + getEditor().editorid).siblings().filter('fieldset').hide();
		    
	    $('a[id^="qr_"]').click(function(){
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
				} else {
					appendTextToEditor(quote);
					reflowTextArea();
				}
	
			    unsafeWindow.set_cookie("vbulletin_multiquote", "");
		    }

	    });
	}
	
	function getQuotedPost(id) {
		var username = $("#post" + id).find(".bigusername").text();
		var $post = $("#post_message_" + id).clone(); //Clonamos para no modificar el original
		
		//Quitar QUOTEs al post
		$post.find("div[style*='margin:20px; margin-top:5px;']").remove();
	    
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
		
	/* Añade nuevos botones que hasta ahora solo estaban disponibles en la versión Avanzada*/
	function addAdvancedButtons() {
		var toolbar = $(getEditor().controlbar).find('> table > tbody > tr > td:nth-child(8)');
		
		var buttons = [];
		buttons.push(createButton("justifyleft", "Alinear a la Izquierda"));
		buttons.push(createButton("justifycenter", "Alinear al Centro"));
		buttons.push(createButton("justifyright", "Alinear a la Derecha"));
		buttons.push('<td><img width="6" height="20" alt="" src="http://st.forocoches.com/foro/images/editor/separator.gif"></td>');
		buttons.push(createButton("insertorderedlist", "Lista Ordenada"));
		buttons.push(createButton("insertunorderedlist", "Lista sin Ordenar"));
		buttons.push('<td><img width="6" height="20" alt="" src="http://st.forocoches.com/foro/images/editor/separator.gif"></td>');
		buttons.push(createButton("undo", "Deshacer"));
		buttons.push(createButton("redo", "Rehacer"));
		buttons.push('<td><img width="6" height="20" alt="" src="http://st.forocoches.com/foro/images/editor/separator.gif"></td>');
		buttons.push(createButton("wrap0_code", "Envolver Etiquetas [CODE]", 'code'));
		buttons.push(createButton("wrap0_html", "Envolver Etiquetas [HTML]", 'html'));
		buttons.push(createButton("wrap0_php", "Envolver Etiquetas [PHP]", 'php'));
		buttons.push('<td><img width="6" height="20" alt="" src="http://st.forocoches.com/foro/images/editor/separator.gif"></td>');
	
		toolbar.after(buttons);
	}
	
	function createButton(action, text, icon) {
		var img = icon ? icon : action;
		var button = $('<div id="vB_Editor_001_cmd_' + action + '" class="imagebutton" style="background: none repeat scroll 0% 0% rgb(225, 225, 226); color: rgb(0, 0, 0); padding: 1px; border: medium none;"><img width="21" height="20" alt="' + text + '" src="http://st.forocoches.com/foro/images/editor/' + img + '.gif" title="' + text + '"></div>')[0];
		button.editorid = getEditor().editorid;
		button.cmd = action;
		button.onclick = button.onmousedown = button.onmouseover = button.onmouseout = genericHandler;
		return $('<td></td>').append(button);
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
				if (getEditorContents().trim().replace(/\<br\>/g,'') == '') {setEditorContents(currentPostBackup.postContents)};
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
		
		if (isWYSIWYG()) { //Si soporta WYSIWYG
			$(getEditor().editdoc.body).on('input', onInputHandler);
		}
		$(getEditor().textobj).on('input', onInputHandler); //TextArea tienen todos
		
		//Al enviar la respuesta, se elimina el backup
		$("form[name='vbform']").on("submit", function() {
			helper.deleteValue("POST_BACKUP");
		});
		
	}
	
	/* Utils */
	
	/* Fuerza la caja a adaptarse al contenido */
	function reflowTextArea() {
		if (checkAutoGrow.checked) {
			if (isWYSIWYG()) {
				getEditor().editbox.style.height = Math.max(getTextAreaHeight() + 30, minHeightTextArea) + "px";
			} else {
				mirrorTextarea.css('width', $(getEditor().textobj).width());
				mirrorTextarea.val(getEditorContents());
				getEditor().textobj.style.height = Math.max(mirrorTextarea[0].scrollHeight + 30, minHeightTextArea) + "px";				
			}
		}
	}
	
	function getTextAreaHeight() {
		var height;
		if (isWYSIWYG()) {
			height = getEditor().editdoc.body.offsetHeight;
		} else {
			height = getEditor().textobj.scrollHeight;
		}
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
		preferences.push(new BooleanPreference("MULTI_QUICK_REPLY", true, "Permitir multi-cita con el botón de Respuesta rápida (y mostrar la propia cita en la caja de texto) <br><b>Para usar esta funcionalidad, es necesario que el navegador soporte el editor WYSIWYG del foro. Si usas Chrome deberás instalar <a href='https://chrome.google.com/webstore/detail/djajencflkkjdejpmmielapebmcjogoc' target='_blank'>esta extensión</a>.</b>"));
		
		return preferences;
	};
	
		/*
var fontsHandler = function (A){A=unsafeWindow.do_an_e(A);if(A.type=="click"){this._onclick(A);unsafeWindow.vB_Editor[getEditor().editorid].menu_context(this,"mouseover")}else{unsafeWindow.vB_Editor[getEditor().editorid].menu_context(this,A.type)}};
		var fontnameMenu = $('<div id="' + getEditor().editorid + '_popup_fontname_menu" class="vbmenu_popup" style="cursor: default; padding: 3px; width: 200px; height: 250px; overflow: auto; position: absolute; z-index: 50; clip: rect(auto, auto, auto, auto); left: 703.317px; top: 720.433px;"></div>');
		var fontnameButton = $('<div title="Fuentes" id="' + getEditor().editorid + '_popup_fontname" class="imagebutton" style="background: none repeat scroll 0% 0% rgb(225, 225, 226); color: rgb(0, 0, 0); padding: 1px; border: medium none;"><table cellspacing="0" cellpadding="0" border="0"><tbody><tr><td class="popup_feedback" style="border-right: 1px solid rgb(255, 255, 255);"><div style="width:91px" id="vB_Editor_001_font_out">Fuentes</div><div id="vB_Editor_001_fontoption_Arial" style="width: 91px; display: none;">Arial</div><div id="vB_Editor_001_fontoption_Arial Black" style="width: 91px; display: none;">Arial Black</div><div id="vB_Editor_001_fontoption_Arial Narrow" style="width: 91px; display: none;">Arial Narrow</div><div id="vB_Editor_001_fontoption_Book Antiqua" style="width: 91px; display: none;">Book Antiqua</div><div id="vB_Editor_001_fontoption_Century Gothic" style="width: 91px; display: none;">Century Gothic</div><div id="vB_Editor_001_fontoption_Comic Sans MS" style="width: 91px; display: none;">Comic Sans MS</div><div id="vB_Editor_001_fontoption_Courier New" style="width: 91px; display: none;">Courier New</div><div id="vB_Editor_001_fontoption_Fixedsys" style="width: 91px; display: none;">Fixedsys</div><div id="vB_Editor_001_fontoption_Franklin Gothic Medium" style="width: 91px; display: none;">Franklin Gothic Medium</div><div id="vB_Editor_001_fontoption_Garamond" style="width: 91px; display: none;">Garamond</div><div id="vB_Editor_001_fontoption_Georgia" style="width: 91px; display: none;">Georgia</div><div id="vB_Editor_001_fontoption_Impact" style="width: 91px; display: none;">Impact</div><div id="vB_Editor_001_fontoption_Lucida Console" style="width: 91px; display: none;">Lucida Console</div><div id="vB_Editor_001_fontoption_Lucida Sans Unicode" style="width: 91px; display: none;">Lucida Sans Unicode</div><div id="vB_Editor_001_fontoption_Microsoft Sans Serif" style="width: 91px; display: none;">Microsoft Sans Serif</div><div id="vB_Editor_001_fontoption_Palatino Linotype" style="width: 91px; display: none;">Palatino Linotype</div><div id="vB_Editor_001_fontoption_System" style="width: 91px; display: none;">System</div><div id="vB_Editor_001_fontoption_Tahoma" style="width: 91px; display: none;">Tahoma</div><div id="vB_Editor_001_fontoption_Times New Roman" style="width: 91px; display: none;">Times New Roman</div><div id="vB_Editor_001_fontoption_Trebuchet MS" style="width: 91px; display: none;">Trebuchet MS</div><div id="vB_Editor_001_fontoption_Verdana" style="width: 91px; display: none;">Verdana</div></td><td class="popup_pickbutton" style="border-color: rgb(255, 255, 255);"><img width="11" height="16" alt="" src="http://st.forocoches.com/foro/images/editor/menupop.gif"></td></tr></tbody></table></div>');
		fontnameButton[0].cmd = 'fontname';
		fontnameButton[0].editorid = getEditor().editorid;
		
fontnameButton[0]._onclick = function (A) {
		    if (typeof unsafeWindow.do_an_e == "function") {
		        unsafeWindow.do_an_e(A);
		        if (unsafeWindow.vBmenu.activemenu == null || unsafeWindow.vBmenu.menus[vBmenu.activemenu].controlkey != this.id) {
		            unsafeWindow.vBmenu.menus[this.id].show(this)
		        } else {
		            unsafeWindow.vBmenu.menus[this.id].hide()
		        }
		    }
		};
		fontnameButton[0].onclick =	
fontnameButton[0].onmousedown = fontnameButton[0].onmouseover = fontnameButton[0].onmouseout = fontsHandler;
		fontnameButton.click(function() {
			fontnameMenu.css('top', fontnameButton.offset().top);
			fontnameMenu.css('left', fontnameButton.offset().left);
			fontnameMenu.show();
		});

		buttons.push(fontnameButton);
		toolbar.append(fontnameMenu);
		toolbar.after(buttons);
		
		getEditor().fontoptions = ["Arial", "Arial Black", "Arial Narrow", "Book Antiqua", "Century Gothic", "Comic Sans MS", "Courier New", "Fixedsys", "Franklin Gothic Medium", "Garamond", "Georgia", "Impact", "Lucida Console", "Lucida Sans Unicode", "Microsoft Sans Serif", "Palatino Linotype", "System", "Tahoma", "Times New Roman", "Trebuchet MS", "Verdana"];
		build_fontname_popup(fontnameButton[0], fontnameMenu[0]);

		
		fontnameMenu.hide();
	}
	
	// Sacado del foro y modificado para que funcione dentro de nuestro sandbox
	function build_fontname_popup(obj, menu) {
	    for (var n in getEditor().fontoptions) {
            var option = document.createElement("div");
            option.innerHTML = '<font face="' + getEditor().fontoptions[n] + '">' + getEditor().fontoptions[n] + "</font>";
            option.className = "ofont";
            option.style.textAlign = "left";
            option.title = getEditor().fontoptions[n];
            option.cmd = obj.cmd;
            option.controlkey = obj.id;
            option.editorid = getEditor().editorid;
            option.onmouseover = option.onmouseout = option.onmouseup = option.onmousedown = function (A){A=unsafeWindow.do_an_e(A);unsafeWindow.vB_Editor[getEditor().editorid].button_context(this,A.type,"menu")};
            option.onclick = function (A){unsafeWindow.vB_Editor[getEditor().editorid].format(A,this.cmd,this.firstChild.innerHTML);menu.hide()};
            menu.appendChild(option)
	    }
	}
*/
	
	
	
	/*
function quickPreview() {
		var quickPreviewButton = $('<input type="button" onclick="clickedelm = this.value" id="qr_qpreview" tabindex="3" name="qpreview" value="Vista previa" class="button">');
		quickPreviewButton.click(function(){
			$('#post_message_143936299').html(createFakePost(getEditor().get_editor_contents()));
		});
		$("#qr_submit").parent().append(quickPreviewButton);
	}
	
	function createFakePost(text) {
		return parseQuotes(text);
	}
	
	function parseQuotes(text) {
		text = text.replace(/\[QUOTE.*\](.*)\[\/QUOTE\]/, createFakePost('$1'));
		return text;
	}
	
	function createFakeQuote(text, username, post) {
		var quote = '<div style="margin:20px; margin-top:5px; "><div style="margin-bottom:2px" class="smallfont">Cita:</div><table cellspacing="0" cellpadding="5" border="0" width="100%"><tbody><tr><td style="border:1px inset" class="alt2">';
		if (username) {
			quote += '<div>Originalmente Escrito por <b>' + username + '</b>';
			if (post) {
				quote += '<a rel="nofollow" href="showthread.php?p=' + post + '#post' + post + '"><img border="0" alt="Ver Mensaje" src="http://st.forocoches.com/foro/images/buttons/viewpost.gif" class="inlineimg" title="Ver Mensaje"></a>';
			}
			
			quote += '</div><div style="font-style:italic">' + text + '</div>';
			
		} else {
			quote += text;
		}
		
		quote += '</td></tr></tbody></table></div>';
	}
*/
	

}
