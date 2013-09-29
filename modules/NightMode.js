function NightMode() {

    this.id = arguments.callee.name; //ModuleTemplate
    this.name = 'Modo noche';
    this.author = 'ikaros45 / Juno';
    this.version = '0.1';
    this.description = 'Cambia la apariencia del foro a colores más oscuros. Perfecto para leer el foro por la noche sin cansar la vista. <b>BETA</b>';
    this.enabledByDefault = true; //Define si el modulo vendrá activado por defecto o no
    this.worksInFrontPage = true; // Modulo carga en portada

    var helper = new ScriptHelper(this.id);
    
    var css, icon;

    /* Define una condición a la carga del módulo. Si no se quiere condición, eliminar este metodo o devolver true. */
    this.shouldLoad = function() {
        return true;
    };

    /* Método obligatorio y punto de entrada a la lógica del módulo */
    this.load = function() {

        // Carga CSS
        css = GM_getResourceText('nightmodecss');

        // Incluyelo en head
        if (helper.getValue('SHOW_ICON')) {
			icon = $("<img width='24px' style='position: fixed; top: 2px; right: 0px; cursor: pointer;'>");	        
			
        	if (helper.getValue('ENABLED', false)) {
	        	enableNightMode();
        	} else {
	        	disableNightMode();
        	}
        	
			icon.click(function(){
				if (helper.getValue('ENABLED', false)) {
					disableNightMode();
	        	} else {
					enableNightMode();
	        	}
			});
			$(document.body).append(icon);
			
        } else {
        	enableNightMode();
        }

    };
    
    var enableNightMode = function() {
	    helper.setValue('ENABLED', true);
	    if (icon) {
			icon.attr('src', GM_getResourceURL('nightmode-off'));
			icon.attr('title', 'Desactivar modo noche');
		}
		$('<style id="nightmode-style">' + css + '</style>').appendTo('head');
    };
    
    var disableNightMode = function() {
	    helper.setValue('ENABLED', false);
	    if (icon) {
			icon.attr('src', GM_getResourceURL('nightmode-on'));
			icon.attr('title', 'Activar modo noche');
		}
    	$("#nightmode-style").remove();
    };
    
    this.getPreferences = function() {
	    var preferences = new Array();
		
		preferences.push(new BooleanPreference("SHOW_ICON", true, "<b>Mostrar un icono pequeño arriba a la derecha del foro para activar/desactivar el modo noche rápidamente.</b> Si desmarcas esta opción, tendrás que venir aquí cada vez para activar o desactivar el modo noche."));

		return preferences;
    };
}