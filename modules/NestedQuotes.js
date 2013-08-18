
function NestedQuotes() {
		
	this.id = arguments.callee.name; //ModuleID
	this.name = "Citas anidadas";
	this.author = "Fritanga";
	this.version = "0.1";
	this.description = "Permite, al citar, anidar también las citas del post original, incluidas imágenes.";
	
	
	var helper = new ScriptHelper(this.id);
	
	var xmlhttp=null;
	// Constantes para las Citas Anidadas
	var buttonText = 'Anidar cita';
	var errText = "No se pudo anidar la cita: ";
	var urlprefix = document.URL.substr(0,document.URL.indexOf('newreply.php'));
	// Busca la zona de texto.
	var textarea_insertpoint = -1;
	var requote = /\[QUOTE=[^;\]]+;/;
	var preNewline = '\n';
	var postID = null;

	this.shouldLoad = function() {
		return page == "/newreply.php";
	}
	
	this.load = function() {
		nestedQuotes();
	}
	
	function nestedQuotes() {
		var textarea = $('#vB_Editor_001_textarea');
		if(textarea == undefined) return; //no tiene sentido continuar si no encontramos el textarea
		
		/**
		 * FIELDSET DE OPCIONES EN EL EDITOR
		 */
		// Busca donde colocar el fieldset.
		var pageDiv = document.evaluate("//*[@id='vB_Editor_001_smiliebox']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		
		// Crea el fieldset
		var fieldsetb = document.createElement("fieldset");
		fieldsetb.title = 'ShurScript';
		fieldsetb.style.marginBottom = '10px';
		var legendb = document.createElement("legend");
		legendb.innerHTML = 'ShurScript';
	
		// Inserta el fieldset y su leyenda
		pageDiv.parentNode.insertBefore(fieldsetb, pageDiv);
		fieldsetb.appendChild(legendb);
	
		// Crea y añade el botón al fieldset
		var qmbutton = document.createElement("input");
		qmbutton.className = 'button';
		qmbutton.type = 'BUTTON';
		qmbutton.style.cursor = "pointer";
		qmbutton.addEventListener("click", doQuote, false);
		qmbutton.setAttribute('id','butNestQuote');
		qmbutton.value = buttonText;
	
		fieldsetb.appendChild(qmbutton); // Añade el botón al fieldset
		console.log("fieldset agregado textarea");
	}
	
	/**
	 * habilita o deshabilita el textarea y el boton de citas anidadas
	 */
	function setTextareaEnabled( flag, buttonText ) {
		var qmbutton = jQuery('#butNestQuote');
		var textarea = jQuery('#vB_Editor_001_textarea');
		qmbutton.attr('disabled', !flag);
		textarea.attr('disabled', !flag);
		qmbutton.val( buttonText );
	}
	
	// Primera función tras pulsar el botón!
	function doQuote(e) {
		var textarea = jQuery('#vB_Editor_001_textarea');
		// Anula el botón mientras trabaja.
		setTextareaEnabled( false, 'Trabajando...' );
		// Busca la cita que ha de anidar en el textarea,
		// empezando por arriba.
		var tatext = textarea.val().toUpperCase();
		textarea_insertpoint = tatext.search(requote);
		if(textarea_insertpoint >= 0) {
			var postidpos = textarea_insertpoint+7;
			preNewline = '\n';
			textarea_insertpoint = tatext.indexOf(']',textarea_insertpoint)+1;
			while(tatext.substr(textarea_insertpoint,1) == ' ' || tatext.substr(textarea_insertpoint,1) == '	' || tatext.substr(textarea_insertpoint,1) == '\n') {
				if(tatext.substr(textarea_insertpoint,1) == '\n') preNewline = '';
				textarea_insertpoint++;
			}
			// Continúa buscando más citas.
			while(tatext.substr(textarea_insertpoint,7) == '[QUOTE=' && tatext.indexOf(';',textarea_insertpoint) > 0 && tatext.indexOf(';',textarea_insertpoint) < tatext.indexOf(']',textarea_insertpoint)) {
				preNewline = '\n';
				postidpos = textarea_insertpoint+7;
				textarea_insertpoint = tatext.indexOf(']',textarea_insertpoint)+1;
				while(tatext.substr(textarea_insertpoint,1) == ' ' || tatext.substr(textarea_insertpoint,1) == '	' || tatext.substr(textarea_insertpoint,1) == '\n') {
					if(tatext.substr(textarea_insertpoint,1) == '\n') preNewline = '';
					textarea_insertpoint++;
				}
			}
			postidpos = tatext.indexOf(';',postidpos)+1;
			postID = tatext.substring(postidpos, tatext.indexOf(']',postidpos))
			var geturl = urlprefix + 'showpost.php?p=' + postID;
	        
			// Hace una llamada AJAX para obtener el post.
			xmlhttp = new XMLHttpRequest();
			xmlhttp.onreadystatechange=findFirstQuote;
			xmlhttp.open("GET",geturl,true);
			xmlhttp.send(null);
		} else {
			setTextareaEnabled( true, 'Anidar cita' );
			alert(errText+"no se han encontrado citas para anidar.");
		}
	}
	function findFirstQuote() {
		console.log(xmlhttp);
		if (xmlhttp.readyState==4)
		{// 4 = "loaded"
			// Comprueba el retorno, si no es un post, salta un aviso.
			var gotPostOK = true;
			var quoteid = '';
			if (xmlhttp.status!=200 && xmlhttp.responseText.indexOf('id="post_message_'+postID+'"') < 0) gotPostOK = false;
			if(gotPostOK) 
			{// 200 = "OK"
				var xmlDoc=document.createElement('div');
				xmlDoc.innerHTML = xmlhttp.responseText;
				// Busca en el retorno la cita, si no la encuentra, almacena variable para altertar al usuario.
				quoteid = document.evaluate("//div[@id='post_message_"+postID+"']//img[@alt='Ver Mensaje']/..", xmlDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
				if(quoteid == null) gotPostOK = false;
				else quoteid = quoteid.href;
				xmlDoc.innerHTML = '';
			}
			// Obtiene la ID de la cita.
			if(gotPostOK) {
				var postidx = quoteid.match(/[?&]p=\d+/);
				if(postidx == null) gotPostOK = false;
				else quoteid = postidx[0].substr(3);
			}
			if(gotPostOK) {
				var qmbutton = jQuery('#butNestQuote');
				qmbutton.value = 'Citando...';
				// Crea una llamda AJAX para obtener el mensaje citado.
				var geturl = urlprefix + 'newreply.php?do=newreply&p=' + quoteid;
				xmlhttp = new XMLHttpRequest();
				xmlhttp.onreadystatechange=addQuotedMessage;
				xmlhttp.open("GET",geturl,true);
				xmlhttp.send(null);
			}
			if(!gotPostOK) {
				// Habilita de nuevo el botón.
				setTextareaEnabled( true, 'Anidar cita' );
				if(quoteid == null) alert(errText+"El mensaje no posee ninguna cita o ya ha sido citado.");
				else alert("No se ha podido obtener el post original (status="+xmlhttp.status+").\nForoCoches podría estar caído. ¡Guarda una copia del mensaje!");
			}
		}
	}
	function unescape_ent(str) {
	    var temp = document.createElement("div");
	    temp.innerHTML = str;
	    var result = temp.childNodes[0].nodeValue;
	    temp.removeChild(temp.firstChild)
	    return result;
	}
	function addQuotedMessage() {
		if (xmlhttp.readyState==4)
		{// 4 = "loaded"
			var gotPostOK = true;
			var quote = '';
			if (xmlhttp.status!=200 && xmlhttp.responseText.indexOf('id="vB_Editor_001_textarea"') < 0) gotPostOK = false;
			if(gotPostOK) {
				// Comprueba el valor de retorno, si no es un mensaje citado, alerta al usuario.
				var quoteStart = xmlhttp.responseText.indexOf('id="vB_Editor_001_textarea"');
				var quoteEnd = -1;
				if(quoteStart >= 0) quoteStart = xmlhttp.responseText.indexOf('[QUOTE', quoteStart);
				if(quoteStart >= 0) quoteEnd = xmlhttp.responseText.indexOf('[/QUOTE]', quoteStart);
				if(quoteStart < 0) gotPostOK = false;
				// Obtiene el mensaje citado (todo el contenido del textarea).
				else quote = xmlhttp.responseText.substring(quoteStart, quoteEnd)+'\n[/QUOTE]';
			}
			if(gotPostOK) {
				var textarea = jQuery('#vB_Editor_001_textarea');
				
				// Inserta el mensaje en el lugar correspondiente del TextArea.
				textarea.val( textarea.val().substr(0,textarea_insertpoint) + preNewline + unescape_ent(quote) + '\n' + textarea.val().substr(textarea_insertpoint) );

				// Inserta el mensaje en el Iframe WYSIWG Firefox
				try {
					var iframearea = jQuery('#vB_Editor_001_iframe')[0].contentWindow.document.getElementsByClassName('wysiwyg')[0];
					iframearea.innerHTML = iframearea.innerHTML.replace(/\n/g, "")
					iframearea.innerHTML = iframearea.innerHTML.replace(/\[QUOTE.*\].*\[\/QUOTE\]/, textarea.val().substr(0,textarea_insertpoint) + preNewline + '\n' + textarea.val().substr(textarea_insertpoint));
				} catch (e) {;}

			}
			// Rehabilita el botón y la caja de texto.
			setTextareaEnabled( true, 'Anidar cita' );
			if(!gotPostOK) {
				if(quoteid == null) alert("No se ha podido obtener el post original (status="+xmlhttp.status+").\nForoCoches podría estar caído. ¡Guarda una copia del mensaje!");
			}
		}
	}
	
}
