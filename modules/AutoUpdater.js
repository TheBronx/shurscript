
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
      name = GM_info.script.name,
      version = GM_info.script.version,
      time = new Date().getTime();

	this.shouldLoad = function() {
		 return false;
	}
	
	this.load = function() {
		if (+time > (+GM_getValue('updated_175463', 0) + 1000*60*60*hours)) {
            GM_setValue('updated_175463', time+'');
            call(false, true);
        }
	}
	
	
    function call(response, secure) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: 'http'+(secure ? 's' : '')+'://userscripts.org/scripts/source/'+id+'.meta.js',
            onload: function(xpr) {compare(xpr, response);},
            onerror: function(xpr) {if (secure) call(response, false);}
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
        var updated = xversion > version;
        if ( updated && confirm('Hay disponible una nueva versión del '+xname+'.\n¿Quieres instalarla?') ) {
            try {
                location.href = 'http://userscripts.org/scripts/source/'+id+'.user.js';
            } catch(e) {}
        } else if (!updated && response)
            alert('No hay actualizaciones disponibles del '+name);
    }
    
    function check() {
        call(true, true);
    }
    
    this.getPreferences = function() {
		return new ButtonPreference("Comprobar ahora", function(){
			check();
		});
	}
    
}
