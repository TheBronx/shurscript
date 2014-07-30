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
		server: SHURSCRIPT.config.server,
		apiKey: "",
		preferences: {}, //las preferencias sacadas del server

		setValue: function (key, value, callback) {
			GM_xmlhttpRequest({
				method: 'PUT',
				url: this.server + 'preferences/' + key + '/?apikey=' + this.apiKey,
				data: $.param({'value': value}),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				onload: function (response) {
					if (callback) {
						callback(JSON.parse(response.response));
					}
				}
			});
		},

		getValue: function (key, callback, defaultValue) {
			GM_xmlhttpRequest({
				method: 'GET',
				url: this.server + 'preferences/' + key + '/?apikey=' + this.apiKey,
				data: '',
				onload: function (response) {
					if (callback) {
						callback(JSON.parse(response.response));
					}
				}
			});
		},

		getAll: function (callback) {
			SHURSCRIPT.config.apiKey = this.apiKey;

			sync.helper.log("Cloud.getAll() using API key: " + this.apiKey);
			GM_xmlhttpRequest({
				method: 'GET',
				url: this.server + 'preferences/?apikey=' + this.apiKey,
				data: '',
				onload: function (response) {
					Cloud.preferences = JSON.parse(response.response);
					callback();
				},
				onerror: function (response) {
					switch (response.status) {
						case 403: //API Key no encontrada
							bootbox.confirm("<h3>¡Un momento!</h3>La Shurkey que estás utilizando no es válida. ¿Quieres que te generemos una nueva?", function (res) {
								if (res) {
									Cloud.generateApiKey(function () {
										Cloud.getAll(callback);
									});
								}
							});
							break;
						case 410: //API Key invalidada
							sync.helper.deleteLocalValue("API_KEY");
							Cloud.apiKey = getApiKey();
							Cloud.getAll(callback);
							break;
						case 500: //Error general
						default:
							sync.helper.showMessageBar({message: "<strong>Oops...</strong> No se ha podido contactar con el cloud de <strong>shurscript</strong>. Consulta qué puede estar causando este problema en <a href='https://github.com/TheBronx/shurscript/wiki/FAQ#no-se-ha-podido-contactar-con-el-cloud-de-shurscript'>las F.A.Q.</a> y, si el problema persiste, deja constancia en el <a href='" + SHURSCRIPT.config.fcThread + "'>hilo oficial</a>. <strong>{err: general}</strong>", type: "danger"});
							break;
					}
					sync.helper.throw("Error al recuperar las preferencias", response)
				}
			});
		},

		deleteValue: function (key, callback) {
			//TODO
			//set empty
			this.setValue(key, '', callback);
		},

		generateApiKey: function (callback, oldKey) {
			sync.helper.deleteLocalValue("API_KEY");
			sync.helper.log("Cloud.generateApiKey()");
			GM_xmlhttpRequest({
				method: 'POST',
				url: this.server + 'preferences/' + (oldKey !== undefined ? "?apikey=" + oldKey : ""),
				data: '',
				onload: function (data) {
					sync.helper.log("Generated API Key:" + JSON.stringify(data));
					Cloud.apiKey = data.apikey;
					saveApiKey(Cloud.apiKey); //guardamos la API key generada en las suscripciones
					callback();
				}
			});
		}
	};

	//Punto de entrada al componente.
	sync.loadAndCallback = function (callback) {
		//sobreescribimos las funciones de manejo de preferencias
		// [cb] es opcional, se ejecuta una vez los datos se guardan en el servidor asíncronamente
		SHURSCRIPT.GreaseMonkey.setValue = function (key, value, cb) {
			Cloud.preferences[key] = value; //Copia local
			Cloud.setValue(key, value, cb);
		};

		SHURSCRIPT.GreaseMonkey.getValue = function (key, defaultValue) {
			//utilizamos la copia local de esa clave (si leyésemos del server los getValue serían asíncronos)
			return (Cloud.preferences[key] != undefined) ? Cloud.preferences[key] : defaultValue;
		};

		SHURSCRIPT.GreaseMonkey.deleteValue = function (key, callback) {
			Cloud.deleteValue(key, callback);
		};

		//ahora necesitamos la API key. ¿existe ya una API Key guardada en las suscripciones?
		var apiKey = getApiKey();
		if (apiKey) {
			//tenemos apikey, usémosla
			Cloud.apiKey = apiKey;
			Cloud.getAll(callback);//una vez recuperadas las preferencias notificamos al core para que cargue el siguiente componente
		} else {
			//hay que pedirle una al server y guardarla en las suscripciones
			//una vez tengamos la apiKey, la usamos
			Cloud.generateApiKey(function () {
				Cloud.getAll(callback); //notificamos al core, el siguiente componente ya puede cargar
			});
		}

	};

	/**
	 * Genera una nueva API key e invalida la antigua
	 */
	sync.generateNewApiKey = function (callback) {
		Cloud.generateApiKey(callback, getApiKey()); //Le pasamos la antigua para que la invalide
	};

	/**
	 * Devuelve la API key guardada en las suscripciones del foro.
	 */
	function getApiKey() {
		var apiKey = sync.helper.getLocalValue("API_KEY");

		//Si no la tenemos guardada en local la buscamos en las suscripciones y la guardamos en local para evitar hacer cada vez una llamada para recuperar las suscripciones
		if (!apiKey) {
			var ajax = new XMLHttpRequest();
			ajax.open("GET", "http://www.forocoches.com/foro/subscription.php?do=editfolders", false); //La buscamos en la carpeta falsa que se crea en las suscripciones
			ajax.onreadystatechange = function () {
				if (ajax.readyState == 4 && ajax.statusText == "OK") {
					var documentResponse = $.parseHTML(ajax.responseText);
					var folder = $(documentResponse).find("input[name='folderlist[50]']");
					if (folder.length > 0) {
						//la API key existe
						apiKey = folder.val().replace("shurkey-", "");
						sync.helper.setLocalValue("API_KEY", apiKey);
					}
				}
			};
			ajax.send();
		}
		return apiKey;
	}

	/**
	 * Guarda la API key en las suscripciones
	 * Comprueba que el guardado sea exitoso. En caso contrario insiste una y otra vez...
	 */
	function saveApiKey(apiKey) {
		var ajax = new XMLHttpRequest();
		ajax.open("POST", "http://www.forocoches.com/foro/subscription.php?do=doeditfolders", false);
		ajax.onreadystatechange = function () {
			if (ajax.readyState == 4 && ajax.statusText == "OK") {
				if (getApiKey() == false) { //comprobamos que se ha guardado. si no se ha guardado
					saveApiKey(apiKey); //insistimos, hasta que se guarde o algo pete xD
				}
			}
		};
		var folderName = "shurkey-" + apiKey;
		var securitytoken = $("input[name='securitytoken']").val(); //Numero de seguridad que genera el vbulletin para autenticar las peticiones
		var params = "s=&securitytoken=" + securitytoken + "&do=doeditfolders&folderlist[50]=" + folderName + "&do=doeditfolders";
		ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		ajax.setRequestHeader("Content-length", params.length);
		ajax.setRequestHeader("Connection", "close");
		ajax.send(params); //Creamos la carpeta
	}

})(jQuery, SHURSCRIPT);
