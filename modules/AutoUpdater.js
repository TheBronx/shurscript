
function AutoUpdater() {
		
	this.id = arguments.callee.name; //ModuleID
	this.name = "Comprobar actualizaciones automáticamente";
	this.author = "";
	this.version = "0.2";
	this.description = "Mostrará una alerta cuando haya una nueva versión disponible del Shurscript";
	this.enabledByDefault = true;	
	
	var helper = new ScriptHelper(this.id);

	var id = 175463,
      hours = 1,
      name,
      version,
      time = new Date().getTime();
	
	this.load = function() {
		if (typeof GM_info != 'undefined' ) {
			name = GM_info.script.name;
			version = GM_info.script.version
		} else if (typeof GM_getMetadata != 'undefined') { //Scriptish
			name = GM_getMetadata('name');
			version = GM_getMetadata('version');
		} else {
			alert('El addon de scripts de tu navegador no está soportado.');
		}
		
		if (+time > (+GM_getValue('updated_175463', 0) + 1000*60*60*hours)) {
            GM_setValue('updated_175463', time+'');
            call(false);
        }
	}
	
	
    function call(response) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: 'https://github.com/TheBronx/shurscript/raw/master/shurscript.user.js',
            onload: function(xpr) {compare(xpr, response);}
        });
    }

    function compare(xpr,response) {
        var xversion=/\/\/\s*@version\s+(.+)\s*\n/i.exec(xpr.responseText);
        var xname=/\/\/\s*@name\s+(.+)\s*\n/i.exec(xpr.responseText);
        
        if ( (xversion) && (xname[1] == name) ) {
            xversion = xversion[1];
            xname = xname[1];
        } else {
            if ( (xpr.responseText.match('the page you requested doesn\'t exist')) || (xname[1] != name) )
            GM_setValue('updated_175463', 'off');
            return false;
        }

       
        if (version.indexOf("-dev") != -1) { //Si estamos en una version de desarrollo, actualizamos si es igual (0.09-dev -> 0.09) o superior.
        	updated = xversion >= version.replace("-dev", "");
        } else {
        	updated = xversion > version;
        }
        
        if ( updated && confirm('Hay disponible una nueva versión del Shurscript.\n¿Quieres instalarla?') ) {
            try {
                location.href = 'https://github.com/TheBronx/shurscript/raw/master/shurscript.user.js';
            } catch(e) {}
        } else if (!updated && response) {
            alert('No hay actualizaciones disponibles del Shurscript');
        }
        
    }
    
    function check() {
        call(true);
    }
    
    this.getPreferences = function() {
		return new ButtonPreference("Comprobar ahora", function(){
			check();
		});
	}
    
}
