/**
 * Inicializa el objeto que contiene la aplicacion,
 * Empaqueta las funciones de GreaseMonkey en un objeto
 * Genera el core.
 */
var SHURSCRIPT = {
	GreaseMonkey: {
		log: GM_log,
		getValue: GM_getValue,
		setValue: GM_setValue,
		deleteValue: GM_deleteValue,
		xmlhttpRequest: GM_xmlhttpRequest,
		registerMenuCommand: GM_registerMenuCommand,
		addStyle: GM_addStyle,
		getResourceText: GM_getResourceText,
		getResourceURL: GM_getResourceURL
	},
	config: {
		server: "http://cloud.shurscript.org:8080/"
	},
	environment: {
		page: location.pathname.replace("/foro", "")
	}
};

/**
 * @param {object} $ - jQuery object
 * @param {object} _ - underscore object
 * @param {object} bootbox - bootbox object
 * @param {object} console - console object
 * @param {undefined} undefined - safe reference to undefined
 */
(function ($, _, SHURSCRIPT, bootbox, console, undefined) {
	'use strict';

	var core = {},
		GM = SHURSCRIPT.GreaseMonkey;

	SHURSCRIPT.core = core;

	/**
	* Comprobamos que está soportada la extensión y seteamos al objeto SHURSCRIPT la version y la rama del script actual.
	*/
	var isCompatible = function () {

		var version;
		if (typeof GM_info !== "undefined") { // GreaseMonkey, TamperMonkey, ...
			version = GM_info.script.version;
		} else if (typeof GM_getMetadata !== "undefined") { // Scriptish
			version = GM_getMetadata('version') + ''; // getMetadata returns: Object, String or Array
		} else {
            return false;
        }

		//Separamos número de versión y nombre de la rama (master, dev o exp)
		var splitted = version.split("-");
		SHURSCRIPT.scriptVersion = splitted[0];
		SHURSCRIPT.scriptBranch = splitted[1] || "master";

		return true;
	};

	/**
	 * Crea un namespace dentro de SHURSCRIPT pasandole
	 * un string de forma 'SHURSCRIPT.nombreNameSpace'
	 * o simplemente 'nombreNameSpace' o 'nameSpace.subNameSpace.subSub...'
	 *
	 * @param {string} ns - nombre/ruta del nameSpace
	 */
	var createNameSpace = function (ns) {
		var segments = ns.split('.'),
			parent = SHURSCRIPT;

		// Si se ha pasado SHURSCRIPT, quitalo del medio
		if (segments[0] === 'SHURSCRIPT') {
			segments = segments.slice(1);
		}

		_.each(segments, function (nameNS) {
			// Inicializa si no existe
			parent[nameNS] = parent[nameNS] || {};

			// Referencia para el siguiente ciclo (pseudorecursividad)
			parent = parent[nameNS];
		});

		return parent;
	};

	/**
	 * Prototipo para los helpers para componentes
	 */
	var protoComponentHelper = {
		/**
		 * Inicializa el objeto
		 * @param moduleId - id del propietario de este helper
		 */
		__init__: function (moduleId) {
			this.moduleId = moduleId;

			// Elimina este metodo ya que no se debe usar mas
			delete this.__init__;

			// Devuelve el objeto para hacer concatenacion
			return this;
		},
		log: function (message) {
			console.log(this._getCallerDescription() + message);
			var $log = $('#shurscript_log');

			if ($log.length === 0) {
				$(document.body).append('<div id="shurscript_log" style="display:none;"></div>');
				$log = $('#shurscript_log');
			}
			$log.append(message + "<br>");
		},

		/**
		 * Compone el string para este modulo + usuario + key
		 *
		 * @param {string} key - nombre de la llave
		 * @param {boolean} [withId] - bool para incluir o no el ID del usuario en la llave. Default: false
		 */
		_getShurKey: function (key, withId) {
			var id = (withId === true) ? '_' + SHURSCRIPT.environment.user.id : '';
			return 'SHURSCRIPT_' + this.moduleId + '_' + key + id;
		},

		/**
		 * Compone una cadena con el nombre del modulo que esta llamando al helper y la hora
		 */
		_getCallerDescription: function () {
			return '[SHURSCRIPT]  [Modulo ' + this.moduleId + '] ' + new Date().toLocaleTimeString() + ': ';
		},

		/**
		 * Almacena un valor en el servidor y ejecuta el callback al terminar
		 * @param key
		 * @param value
		 * @param callback
		 */
		setValue: function (key, value, callback) {
			GM.setValue(this._getShurKey(key, false), value, callback);
		},

		/**
		 * Devuelve un valor del servidor, o el defaultValue si no encuentra la clave
		 * @param key
		 * @param defaultValue
		 */
		getValue: function (key, defaultValue) {
			return GM.getValue(this._getShurKey(key, false), defaultValue);
		},

        /**
         * Elimina un valor del servidor
         *
         * @param key
         * @param {function} callback - funcion a ejecutar despues de la operacion
         */
		deleteValue: function (key, callback) {
			GM.deleteValue(this._getShurKey(key, false), callback);
		},

		/**
		 * Almacena un valor en el navegador
		 * @param key
		 * @param value
		 */
		setLocalValue: function (key, value) {
			GM_setValue(this._getShurKey(key, true), value);
		},

		/**
		 * Devuelve un valor del navegador, o el defaultValue si no encuentra la clave
		 * @param key
		 * @param defaultValue
		 */
		getLocalValue: function (key, defaultValue) {
			return GM_getValue(this._getShurKey(key, true), defaultValue);
		},

		/**
		 * Elimina un valor del navegador
		 *
		 * @param key - nombre llave
		 */
		deleteLocalValue: function (key) {
			GM_deleteValue(this._getShurKey(key, true));
		},

		/**
		 * Lanza excepcion
		 *
		 * @param {string} message - mensaje para la excepcion
		 * @param {object} exception - [opcional] la excepcion
		 */
		throw: function (message, exception) {
			this.log('[EXCEPTION] - ' + message);
			if (exception !== undefined) {
				this.log(exception);
				console.log(exception);
			}
		},

		/**
		 * Mete CSS previamente registrado en archivo principal con @resource
		 *
		 * @param {string} styleResource - nombre del recurso css
		 */
		addStyle: function (styleResource) {
			var css = GM.getResourceText(styleResource);
			GM.addStyle(css);
		},
		
		/**
		 * Muestra un mensaje al usuario en una barra arriba de la página
		 *
		 * @param {object} properties { 
		 *						message: "Mensaje a mostrar",
		 *						type: ["info", "success", "warning", "danger"],
		 *						onClose: "Función a ejecutar después al hacer clic en el aspa de cerrar"
		 *                 }
		 */
		showMessageBar: function (properties) {
			SHURSCRIPT.topbar.showMessage(properties);
		},
		
		getResourceText: GM.getResourceText,
		getResourceURL: GM.getResourceURL,
		bootbox: bootbox,
		location: location
	};

	/**
	 * Devuelve el protoModuleHelper, asegurandose de que esta
	 * extendido con los nuevos elementos
	 */
	var getProtoModuleHelper = function () {
		var moduleHelper = Object.create(protoComponentHelper);
		moduleHelper.createPreferenceOption = SHURSCRIPT.preferences.createOption;
		moduleHelper.templater = SHURSCRIPT.templater;
		moduleHelper.environment = SHURSCRIPT.environment;
		return moduleHelper;
	};

	/**
	 * Crea un helper para COMPONENTES
	 *
	 * @param {string} moduleId - id modulo o componente
	 */
	core.createComponentHelper = function (moduleId) {
		return Object.create(protoComponentHelper).__init__(moduleId);
	};

	/**
	 * Crea un helper para MODULOS. Como los modulos no tienen accesso a SHURSCRIPT,
	 * reciben un helper más completo con acceso a otros componentes que no existían
	 * cuando protoComponentHelper se creo
	 *
	 * @param {string} moduleId
	 */
	core.createModuleHelper = function (moduleId) {
		return getProtoModuleHelper().__init__(moduleId);
	};

	core.helper = core.createComponentHelper('core');

	/**
	 * Crea un componente para la aplicacion
	 *
	 * @param {string} id - id componente
	 */
	core.createComponent = function (id) {
		if (id === undefined) {
			core.helper.throw('Error al crear componente. El ID no ha sido definido.');
		}

		// Crea namespace y copiale las propiedades
		var comp = createNameSpace(id);
		comp.id = id;

		//Registra el componente
		if (core.components === undefined) {
            core.components = [];
        }
		core.components.push(id);

		// Metele un helper
		comp.helper = core.createComponentHelper(comp.id);

		return comp;
	};

	/**
	 * Inicializa la aplicacion de modo normal
	 */
	core.initialize = function () {

		if (!isCompatible()) {
			alert('SHURSCRIPT: El complemento o extensión de userscripts que usas en tu navegador no está soportado.');
			return;
		}

		var body_html = $('body').html();

		// Saca por regexps id
		var id_regex_results = /userid=(\d*)/.exec(body_html);

		// Si el usuario no está logueado, aborta.
		if (!id_regex_results) {
			return;
		}

		// Guarda info usuario
		SHURSCRIPT.environment.user = {
			id: id_regex_results[1],
			name: /Hola, <(?:.*?)>(\w*)<\/(?:.*?)>/.exec(body_html)[1]
		};

		// Mete bootstrap
		core.helper.addStyle('bootstrapcss');

		// Configuracion de las ventanas modales
		core.helper.bootbox.setDefaults({
			locale: "es",
			className: "shurscript",
			closeButton: false
		});

		//Recuperamos las configuraciones del servidor
		$.ajax({
			type: 'GET',
			url: SHURSCRIPT.config.server + 'config-' + SHURSCRIPT.scriptBranch
		}).done(function (data) {
			_.extend(SHURSCRIPT.config, data);

			//lanza la carga de componentes y modulos
			core.loadNextComponent();
			
			core.helper.deleteLocalValue('SERVER_DOWN_ALERT');
		}).fail(function(error){
			if (!core.helper.getLocalValue('SERVER_DOWN_ALERT')) {
				core.helper.showMessageBar({
					message: "<strong>Oops...</strong> Parece que se ha roto alguna pieza en el servidor de <strong>Shurscript</strong>. Int&eacute;ntalo de nuevo en unos minutos o deja constancia en el <a href='http://shurscript.org/hilo'>hilo oficial</a>.",
					type: "danger",
					onClose: function() {
						core.helper.setLocalValue('SERVER_DOWN_ALERT', true);
					}
				});
			}
		});

	};

	// Carga el siguiente componente. En caso contrario llama a la carga de módulos.
	// La carga de componentes se hace asíncronamente y por orden de "registro" (SHURSCRIPT.core.createComponent())
	// cada componente debe implementar un método load(callback) y llamar a dicho callback cuando termine
	// Así se permite que los componentes puedan bloquear la carga del resto de scripts y módulos
	core.loadNextComponent = function () {
		var component = core.getNextComponent();

        if (component === undefined) {
			// No quedan componentes, lanza carga modulos
            SHURSCRIPT.moduleManager.startOnDocReadyModules();
            return;
        }

        // TODO [ikaros45 28.03.2014]: No hay que comprobar si la funcion existe, sino definir una
        // funcion dummy en el prototype que puede ser sobreescrita por los modulos

        if (_.isFunction(component.loadAndCallback)) { // existe funcion de carga?
            console.log("Cargando componente " + component.id);
            component.loadAndCallback(core.loadNextComponent); //carga y una vez termines llama a loadNextComponent
            return;
        }

        // TODO [ikaros45 28.03.2014]: lo mismo aqui... no hay que comprobar si existe!
        if (_.isFunction(component.load)) {
            component.load(); // sin callback
        }
        core.loadNextComponent();
	};

	// devuelve el siguiente componente en el proceso de carga
	core.getNextComponent = function () {
		if (core.components !== undefined) {
			if (core.componentIndex === undefined) {
				core.componentIndex = 0;
			} else {
				core.componentIndex += 1;
			}
			return SHURSCRIPT[core.components[core.componentIndex]];
		}
	};

	/**
	 * Inicializa la aplicacion en modo prematuro (antes del doc ready)
	 */
	core.initializeEagerly = function () {
		// De forma pseudo-asincronica, espera hasta que el head este cargado
		SHURSCRIPT.moduleManager.startEagerModules();
	};

})(jQuery, _, SHURSCRIPT, bootbox, console);
