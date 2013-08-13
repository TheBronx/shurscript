/*
Modulo Shurscript
@id: AutoUpdater
@name: Actualizador de versiones automático
@author:
@version: 0.2
@description: Notifica cuando hay disponible una nueva versión del Shurscript
*/

function AutoUpdater() {
		
	var helper = new ScriptHelper("AutoUpdater");
	
	var id = 175463,
      hours = 1,
      name = GM_info.script.name,
      version = GM_info.script.version,
      time = new Date().getTime();

	this.shouldLoad = function() {
		 return true;
	}
	
	this.load = function() {
		check();
	}
	
	
    function call(response, secure) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: 'http'+(secure ? 's' : '')+'://userscripts.org/scripts/source/'+id+'.meta.js',
            onload: function(xpr) {compare(xpr, response);},
            onerror: function(xpr) {if (secure) call(response, false);}
        });
    }
    function enable() {
        GM_registerMenuCommand('Activar actualizaciones automáticas del '+name, function() {
            GM_setValue('updated_175463', new Date().getTime()+'');
            call(true, true)
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
        } else if ( xversion && updated ) {
            if(confirm('¿Quieres desactivar las actualizaciones automáticas de este script?')) {
                GM_setValue('updated_175463', 'off');
                enable();
                alert('Puedes volver a activarlas desde el submenú User Script Commands.');
            }
        } else if (response)
            alert('No hay actualizaciones disponibles del '+name);
    }
    
    function check() {
        if (GM_getValue('updated_175463', 0) == 'off')
            enable();
        else {
            if (+time > (+GM_getValue('updated_175463', 0) + 1000*60*60*hours)) {
                GM_setValue('updated_175463', time+'');
                call(false, true);
            }
            GM_registerMenuCommand('Comprobar actualizaciones del '+name, function() {
                GM_setValue('updated_175463', new Date().getTime()+'');
                call(true, true);
            });
        }
    }
    
	
}
