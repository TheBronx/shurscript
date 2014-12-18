/**
 * Componente moduleManager
 * Esto se encarga de generar y guardar los modulos
 */
(function ($, SHURSCRIPT, undefined) {
	'use strict';

	var moduleManager = SHURSCRIPT.core.createComponent('moduleManager');

	moduleManager.ALL = 'ALL';
	moduleManager.NO_FRONTPAGE = 'NO_FRONTPAGE';

	// Objeto prototipo-base para modulos
	var protoModule = {

		/**
		 * Constructor/incializador
		 *
		 * @param {string} specs.id
		 * @param {string} specs.name
		 * @param {string} specs.author
		 * @param {string} specs.version
		 * @param {string} specs.description
		 * @param {string} [specs.domain] - dominio en el que el modulo arranca. Posibles valores:
		 * - 'NO_FRONTPAGE' - carga en todo FC salvo la portada [valor por defecto]
		 * - 'ALL' - carga en todo FC
		 * - string con nombre del recurso tal y como esta en helper.environment.page
		 * - array de strings como en el punto anterior
		 * @param {object} [specs.initialPreferences] - preferencias iniciales del modulo.
		 * Las preferencias guardadas por el usuario tienen prioridad.
		 * @param {bool} [specs.initialPreferences.enabled] - bool para modulo cargado por defecto. Por defecto es true
		 */
		__init__: function (specs) {

			// Copia parametros y si falta alguno, aborta
			var params = ['id', 'name', 'author', 'version', 'description'],

			// Dentro del $.each, this no se refiere al objeto, asi que guarda una ref.
				self = this;

			$.each(params, function (index, param) {

				// Comprueba que no falte el parametro
				if (specs[param] === undefined) {
					var mod_name = specs.id || specs.name || 'no identificado';

					var error_msg = 'Error generando modulo {' + mod_name +
						'}.El parametro ' + param + ' no ha sido definido.';
					moduleManager.helper.log(error_msg);

					// Aborta todo
					moduleManager.helper.throw(error_msg);
				}

				// Si todo va bien, copia.
				self[param] = specs[param];
			});

			// Guarda preferencias iniciales, si las hay
			this.initialPreferences = specs.initialPreferences || {};

			// Inicializa las preferencias (FIXES #27)
			this.preferences = {
				enabled: true
			};

			// Metele opcionalmente el dominio (por default es NO_FRONTPAGE)
			if (specs.domain !== undefined) {
				this.domain = specs.domain;
			}

			// Metele un module helper ya configurado
			this.helper = SHURSCRIPT.core.createModuleHelper(specs.id);

			// Registra modulo
			moduleManager.modules[this.id] = this;

			// Elimina constructor
			delete this.__init__;

			// Devuelve objeto modulo
			return this;
		},

		// Objeto donde se almacenan las preferencias
		preferences: {
			enabled: true
		},

		/**
		 * Hace persistente el estado del modulo
		 */
		storePreferences: function (callback) {
			var serializedPreferences = JSON.stringify(this.preferences);

			this.helper.setValue('__preferences', serializedPreferences, callback);
		},

		/**
		 * Actualiza las preferencias.
		 *
		 * Una preferencia guardada tiene prioridad sobre una preferencia
		 * definida en .initialPreferences. Pero si el objeto de preferencias
		 * guardadas no tiene una llave, se toma de initialPreferences.
		 */
		refreshPreferences: function () {
			var serializedStoredPreferences = this.helper.getValue('__preferences', ''),
				storedPreferences = {};

			if (serializedStoredPreferences !== undefined && serializedStoredPreferences !== '') {
				storedPreferences = JSON.parse(serializedStoredPreferences);
			}

			// Aqui la cascada de storedPreferences > initialPreferences > preferences
			// El true es para hacer una copia recursiva
			$.extend(true, this.preferences, this.initialPreferences, storedPreferences);
		},

		// Por defecto los modulos arrancan fuera de la portada
		domain: moduleManager.NO_FRONTPAGE,

		/**
		 * Funcion a sobreescribir si queremos definir opciones para la configuracion
		 */
		getPreferenceOptions: function () {
			return [];
		},

		/**
		 * Function a sobreescribir para meter una condicion
		 * para la ejecucion prematura del modulo
		 */
		eagerStartCheck: function () {
			return false;
		},

		/**
		 * Funcion a sobreescribir si queremos ejecutar algo antes de document.ready
		 */
		onEagerStart: function () {
		},

		/**
		 *  Comprueba si en la pagina actual el modulo debe lanzarse.
		 *  Se ejecuta una vez cargado el DOM
		 */
		isValidPage: function () {
			var domain = this.domain,
				page = SHURSCRIPT.environment.page;

			// Si domain string.
			if (typeof domain === 'string') {

				// Comprueba valores predefinidos (all, no frontpage)
				if (domain === moduleManager.ALL) {
					return true;
				} else if (domain === moduleManager.NO_FRONTPAGE) {
					return page !== '/';
				}

				// Si no predefinido, comprueba que la pagina es la buena
				return page === domain;
			}

			// Si array, true si page en array
			return (domain.indexOf(page) > -1);
		},

		/**
		 * Funcion a sobreescribir si queremos hacer alguna comprobacion adicional antes de lanzar el modulo
		 * @returns {boolean}
		 */
		normalStartCheck: function () {
			return true;
		},

		/**
		 * Funcion a sobreescribir que se ejecutara tras la carga del DOM si el modulo debe ejecutarse
		 * Normalmente aqui va deberia ir la logica del modulo
		 */
		onNormalStart: function () {
		}


	};

	// Store de modulos
	moduleManager.modules = {};

	/**
	 * Genera modulo extendiendo la base y lo registra
	 *
	 * @returns module
	 */
	moduleManager.createModule = function (specs) {
		// Crea modulo a partir del proto modulo
		try {
			return Object.create(protoModule).__init__(specs);
		} catch (e) {
			moduleManager.helper.throw("Error creando módulo:", e);
		}
	};

	/**
	 * Lanza la carga de modulos en document.ready
	 */
	moduleManager.startOnDocReadyModules = function () {

		// Loop sobre modulos para cargarlos
		$.each(moduleManager.modules, function (moduleName, module) {

			// Intentamos carga.
			try {

				module.refreshPreferences(); //aqui la carga de preferencias ya sí será desde la nube

				//loading module event
				SHURSCRIPT.eventbus.trigger('loadingModule', [module]);

				// Si el modulo no esta activado
				// (nota: el estado del modulo ha sido actualizado
				// en el .startModulesEagerly
				if (!module.preferences.enabled) {
					return true;
				}

				// Si no estamos en una pagina en la que el modulo corre, continue
				if (!module.isValidPage()) {
					return true;
				}

				// Si no cumple el check adicional, continue
				if (!module.normalStartCheck()) {
					return true;
				}

				moduleManager.helper.log('Cargando modulo ' + module.id);
				module.onNormalStart();
				moduleManager.helper.log('Modulo ' + module.id + ' cargado');
			} catch (e) {
				moduleManager.helper.log('Fallo cargando modulo ' + module.id + '\nRazon: ' + e);
			}
		});

		//loading module event
		SHURSCRIPT.eventbus.trigger('allModulesLoaded');
	};

	/**
	 * Lanza la carga "prematura" de modulos. Todos la aplicacion
	 * ShurScript estará cargada pero el DOM no.
	 */
	moduleManager.startEagerModules = function () {

		// Loop sobre modulos para cargarlos
		$.each(moduleManager.modules, function (moduleName, module) {

			// Intentamos carga.
			try {

				module.refreshPreferences(); //aqui la carga de preferencias sera local (sync.js aun no ha metido la nube por medio)

				// Si el modulo no esta activado
				if (!module.preferences.enabled) {
					return true;
				}

				// Si el modulo no carga prematuramente, aborta
				if (!module.eagerStartCheck()) {
					return true;
				}

				// Si no estamos en una pagina en la que el modulo corre, aborta
				if (!module.isValidPage()) {
					return true;
				}

				moduleManager.helper.log('[Modo prematuro] Cargando modulo ' + module.id);
				module.onEagerStart();
				moduleManager.helper.log('[Modo prematuro] Modulo ' + module.id + ' cargado');
			} catch (e) {
				moduleManager.helper.log('[Modo prematuro] Fallo cargando modulo ' + module.id + '\nRazon: ' + e);
			}
		});
	};

})(jQuery, SHURSCRIPT);
