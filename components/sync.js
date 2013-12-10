/**
 * Módulo de sincronización de preferencias en la nube
 * Sobreescribe los métodos getValue, setValue y deleteValue del objeto core.GreaseMonkey
 * IMPORTANTE: debe cargarse antes que cualquier otro componente/módulo que no sea el propio core
 */
(function ($, SHURSCRIPT, undefined) {
    'use strict';
    
    //por si queremos usar los get/set/delete que trabajan en local y no en la nube
    var noCloud = {
        setValue : SHURSCRIPT.GreaseMonkey.setValue,
        getValue : SHURSCRIPT.GreaseMonkey.getValue,
        deleteValue : SHURSCRIPT.GreaseMonkey.deleteValue
    };
	
	var Cloud = {
		server: "http://cloud.shurscript.org:8080/",
		apiKey: "", //que pasa si llegan peticiones get/set mientras estamos consiguiendo/generando la apiKey???
		
		setValue: function (key, value) {
			console.log("Cloud.setValue("+key+", "+value+")");
			$.ajax({
				type: 'PUT', 
				url: this.server + 'preferences/'+key+'/?key=' + this.apiKey,
				data: {key:value},
				dataType: 'json' 
			}); 
		},
		
		getValue: function (key, defaultValue) {
			console.log("Cloud.getValue("+key+", "+defaultValue+")");
			$.ajax({
				type: 'get', 
				url: this.server + 'preferences/'+key+'/?key=' + this.apiKey,
				data: "",
				dataType: 'json' 
			}); 
		},
		
		deleteValue: function (key) {
			//set empty
			this.setValue(key,'');
		},
		
		generateApiKey: function() {
			console.log("Cloud.generateApiKey()");
			$.ajax({
				type: 'POST', 
				url: this.server + 'preferences/',
				data: "",
				dataType: 'json' 
			});
		}
	};
    
	//sobreescribimos las funciones de manejo de preferencias
    SHURSCRIPT.GreaseMonkey.setValue =  function (key, value) {
		Cloud.setValue(key, value);
    };
	
    SHURSCRIPT.GreaseMonkey.getValue =  function (key, defaultValue) {
		Cloud.getValue(key, defaultValue);
    };

    SHURSCRIPT.GreaseMonkey.deleteValue =  function (key) {
        Cloud.deleteValue(key);
    };
	
	
	
/*
xuso0
Obtener la clave de sincronización de la configuración del navegador. CASO HABITUAL.
Si no se encuentra se busca en una carpeta falsa creada a propósito con la clave como nombre. Llamada sincrona. CASO REINSTALACION o INSTALACION EN OTRO NAVEGADOR. Se sincronizan las preferencias guardadas.
Si tampoco se encuentra, se genera una nueva, se crea la carpeta y se guarda la nueva clave de sincronización. Llamada sincrona. CASO PRIMERA INSTALACION.
*/
function getSyncKey() {
	var syncKey = GM_getValue("SHURSCRIPT_SYNC_KEY_" + userid);
	if (!syncKey || syncKey == "") { //No tenemos la clave de sincronización.
		var ajax = new XMLHttpRequest();
		ajax.open("GET", "http://www.forocoches.com/foro/subscription.php?do=editfolders", false); //La buscamos en la carpeta falsa que se crea en las suscripciones
		ajax.onreadystatechange = function () {
			if (ajax.readyState == 4 && ajax.statusText == "OK") {
				var documentResponse = jQuery.parseHTML(ajax.responseText);
				var folder = $(documentResponse).find("input[name='folderlist[50]']");
				if (folder.length > 0) {
					syncKey = folder.val();
					GM_setValue("SHURSCRIPT_SYNC_KEY_" + userid, syncKey);
				} else {
					ajax.open("POST", "http://www.forocoches.com/foro/subscription.php?do=doeditfolders", false); //Si tampoco existe, es que es la primera instalación. Generamos una, creamos la carpeta fake y guardamos la clave en el navegador para futuros usos.
					ajax.onreadystatechange = function () {
						if (ajax.readyState == 4 && ajax.statusText == "OK") {
							syncKey = getSyncKey(); //Repetimos para comprobar que se ha guardado correctamente
						}
					}
					var randomKey = "shurscript-" + Math.random().toString().substr(2); //0.63739128412 -> 63739128412 (cutre-random)
					var securitytoken = $("input[name='securitytoken']").val(); //Numero de seguridad que genera el vbulletin para autenticar las peticiones
				    var params = "s=&securitytoken=" + securitytoken + "&do=doeditfolders&folderlist[50]=" + randomKey + "&do=doeditfolders";
					ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
					ajax.setRequestHeader("Content-length", params.length);
					ajax.setRequestHeader("Connection", "close");
					ajax.send(params); //Creamos la carpeta
				}
			}
		}
		ajax.send();
	}
	return syncKey;
}

})(jQuery, SHURSCRIPT);
