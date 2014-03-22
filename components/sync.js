/**
 * Módulo de sincronización de preferencias en la nube
 * Sobreescribe los métodos getValue, setValue y deleteValue del objeto core.GreaseMonkey
 * IMPORTANTE: debe cargarse antes que cualquier otro componente/módulo que no sea el propio core
 */
(function ($, SHURSCRIPT, undefined) {
	'use strict';

	var sync = SHURSCRIPT.core.createComponent('sync');

	//por si queremos usar los get/set/delete que trabajan en local y no en la nube
	var noCloud = {
		setValue: SHURSCRIPT.GreaseMonkey.setValue,
		getValue: SHURSCRIPT.GreaseMonkey.getValue,
		deleteValue: SHURSCRIPT.GreaseMonkey.deleteValue
	};

	var Cloud = {
		server: "http://cloud.shurscript.org:8080/",
		apiKey: "", //que pasa si llegan peticiones get/set mientras estamos consiguiendo/generando la apiKey???
		preferences: {}, //las preferencias sacadas del server

		setValue: function (key, value, callback) {
			sync.helper.log("Cloud.setValue(" + key + ", " + value + ")");
			$.ajax({
				type: 'PUT',
				url: this.server + 'preferences/' + key + '/?apikey=' + this.apiKey,
				data: {'value': value},
				dataType: 'json'
			}).done(function () {
					if (typeof callback === 'function') {
						callback();
					}
				});
		},

		getValue: function (key, defaultValue) {
			sync.helper.log("Cloud.getValue(" + key + ", " + defaultValue + ")");
			$.ajax({
				type: 'get',
				url: this.server + 'preferences/' + key + '/?apikey=' + this.apiKey,
				data: "",
				dataType: 'json'
			}).done(function (data) {
					sync.helper.log("Server answer:" + JSON.stringify(data));
				});
		},

		getAll: function (callback) {
			sync.helper.log("Cloud.getAll()");
			$.ajax({
				type: 'get',
				url: this.server + 'preferences/?apikey=' + this.apiKey,
				data: "",
				dataType: 'json'
			}).done(function (data) {
					sync.helper.log("Server answer:" + JSON.stringify(data));
					Cloud.preferences = data;
					callback();
				});
		},

		deleteValue: function (key, callback) {
			//TODO
			//set empty
			this.setValue(key, '', callback);
		},

		generateApiKey: function (callback) {
			sync.helper.log("Cloud.generateApiKey()");
			$.ajax({
				type: 'POST',
				url: this.server + 'preferences/',
				data: "",
				dataType: 'json'
			}).done(function (data) {
					sync.helper.log("Server answer:" + JSON.stringify(data));
					Cloud.apiKey = data.apikey;
					saveApiKey(Cloud.apiKey); //guardamos la API key generada en las suscripciones
					callback();
				});
		}
	};

	//Punto de entrada al componente.
	sync.loadAndCallback = function (callback) {
		//sobreescribimos las funciones de manejo de preferencias
		// [cb] es opcional, se ejecuta una vez los datos se guardan en el servidor asíncronamente
		SHURSCRIPT.GreaseMonkey.setValue = function (key, value, cb) {
			Cloud.setValue(key, value, cb);
		};

		SHURSCRIPT.GreaseMonkey.getValue = function (key, defaultValue) {
			//no podemos llamar sin más a getValue, ya que es asincrona.
			//es decir, no podemos simplemente decir "return pref"
			//tampoco podemos tirar de callbacks, complicaría excesivamente los módulos
			//por tanto trabajaremos con una copia local de las preferencias de la nube
			//iremos actualizando esa copia cuando el usuario use set o delete, y al cargar el script
			//Cloud.getValue(key, defaultValue);
			sync.helper.log("getValue( " + key + " ) = " + Cloud.preferences[key]);
			return (Cloud.preferences[key] != undefined) ? Cloud.preferences[key] : defaultValue;
		};

		SHURSCRIPT.GreaseMonkey.deleteValue = function (key, callback) {
			Cloud.deleteValue(key, callback);
		};

		//ahora necesitamos la API key. ¿existe ya una API Key guardada en las suscripciones?
		var apiKey = getApiKey();
		if (apiKey !== false) {
			//tenemos apikey, usémosla
			Cloud.apiKey = apiKey;
			Cloud.getAll(callback);//una vez recuperadas las preferencias notificamos al core para que cargue el siguiente componente
		} else {
			//hay que pedirle una al server y guardarla en las suscripciones
			//una vez tengamos la apiKey, la usamos
			Cloud.generateApiKey(function () {
				Cloud.getAll(callback);
			}); //usamos las preferencias y despues notificamos al core
		}
	};

	/**
	 * Devuelve la API key guardada en las suscripciones del foro.
	 * Si no existe, devuelve 'false'
	 */
	function getApiKey() {
		var apiKey = false;
		var ajax = new XMLHttpRequest();
		ajax.open("GET", "http://www.forocoches.com/foro/subscription.php?do=editfolders", false); //La buscamos en la carpeta falsa que se crea en las suscripciones
		ajax.onreadystatechange = function () {
			if (ajax.readyState == 4 && ajax.statusText == "OK") {
				var documentResponse = $.parseHTML(ajax.responseText);
				var folder = $(documentResponse).find("input[name='folderlist[50]']");
				if (folder.length > 0) {
					//la API key existe
					apiKey = folder.val().replace("shurscript-", "");
				}
			}
		}
		ajax.send();
		return apiKey;
	}

	/**
	 * Guarda la API key en las suscripciones
	 * Comprueba que el guardado sea exitoso. En caso contrario insiste una y otra vez...
	 */
	function saveApiKey(apiKey) {
		var ajax = new XMLHttpRequest();
		ajax.open("POST", "http://www.forocoches.com/foro/subscription.php?do=doeditfolders", false); //Si no existe es que es la primera instalación. Generamos una, creamos la carpeta fake y guardamos la clave en el navegador para futuros usos.
		ajax.onreadystatechange = function () {
			if (ajax.readyState == 4 && ajax.statusText == "OK") {
				if (getApiKey() == false) { //comprobamos que se ha guardado. si no se ha guardado
					saveApiKey(apiKey); //insistimos, hasta que se guarde o algo pete xD
				}
			}
		}
		var folderName = "shurscript-" + apiKey;
		var securitytoken = $("input[name='securitytoken']").val(); //Numero de seguridad que genera el vbulletin para autenticar las peticiones
		var params = "s=&securitytoken=" + securitytoken + "&do=doeditfolders&folderlist[50]=" + folderName + "&do=doeditfolders";
		ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		ajax.setRequestHeader("Content-length", params.length);
		ajax.setRequestHeader("Connection", "close");
		ajax.send(params); //Creamos la carpeta
	}

})(jQuery, SHURSCRIPT);
