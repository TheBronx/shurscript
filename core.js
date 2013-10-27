/**
 * Inicializa el objeto que contiene la aplicacion,
 * Empaqueta las funciones de GreaseMonkey en un objeto
 * Genera el core.
 */
var SHURSCRIPT = {
    scriptVersion: '10.5-exp',
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
    environment: {
        page: location.pathname.replace("/foro","")
    }
};

(function ($, SHURSCRIPT, bootbox, console, undefined) {
    'use strict';

    var core = {},
        GM = SHURSCRIPT.GreaseMonkey;

    SHURSCRIPT.core = core;

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

        $.each(segments, function (index, nameNS) {
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
         * @param specs.id - id del propietario de este helper
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
        },

        /**
         * Compone el string para este modulo + usuario + key
         *
         * @param {string} key - nombre de la llave
         * @param {bool} [withId] - bool para incluir o no el ID del usuario en la llave. Default: false
         */
        _getShurKey: function (key, withId) {
            var id = (withId === true) ? SHURSCRIPT.environment.user.id : '';
            return 'SHURSCRIPT_' + this.moduleId + '_' + id + '_' + key;
        },

        /**
         * Compone una cadena con el nombre del modulo que esta llamando al helper y la hora
         */
        _getCallerDescription: function () {
            return '[SHURSCRIPT]  [Modulo ' + this.moduleId + '] ' + new Date().toLocaleTimeString() + ': ';
        },

        /**
         *
         * @param key
         * @param value
         * @param {bool} [withId] - bool para incluir o no el ID del usuario en la llave. Default: false
         */
        setValue: function(key, value, withId) {
            GM.setValue(this._getShurKey(key, withId), value);
        },

        /**
         *
         * @param key
         * @param defaultValue
         * @param {bool} [withId] - bool para incluir o no el ID del usuario en la llave. Default: false
         * @returns {string} - valor leido del navegador
         */
        getValue: function(key, defaultValue, withId) {
            return GM.getValue(this._getShurKey(key, withId), defaultValue);
        },

        /**
         * Borra una llave guardada en el navegador
         *
         * @param {string} key - nombre llave
         * @param {bool} [withId] - bool para incluir o no el ID del usuario en la llave. Default: false
         */
        deleteValue: function(key, withId) {
            GM.deleteValue(this._getShurKey(key, withId));
        },

        /**
         * Lanza excepcion
         *
         * @param {string} message - mensaje para la excepcion
         */
        throw: function (message) {
            var exc = '[EXCEPTION] - ' + this._getCallerDescription() + message;
            this.log(exc);
            throw exc;
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
        // Comprueba que el prototipo que extiende de protoComponentHelper esta creado ya
        if (getProtoModuleHelper.protoModuleHelper === undefined) {

            // Crea proto que extiende de protoComponentHelper
            getProtoModuleHelper.protoModuleHelper = Object.create(protoComponentHelper);

            // Metele nuevos atributos
            getProtoModuleHelper.protoModuleHelper.createPreferenceOption = SHURSCRIPT.preferences.createOption;
            getProtoModuleHelper.protoModuleHelper.templater = SHURSCRIPT.templater;
            getProtoModuleHelper.protoModuleHelper.environment = SHURSCRIPT.environment;
        }

        return getProtoModuleHelper.protoModuleHelper;
    };


    /**
     * Crea un helper para COMPONENTES
     *
     * @param {string} moduleId - id modulo o componente
     */
    core.createComponentHelper =  function (moduleId) {
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
     * @param {string} specs.id - id componente
     * @param {string} specs.name - nombre componente
     * @param {string} specs.description - que hace este componente
     */
    core.createComponent = function (id) {
        if (id === undefined) {
            core.helper.throw('Error al crear componente. La propiedad ' + prop + ' no ha sido definida.');
        }

        // Crea namespace y copiale las propiedades
        var comp = createNameSpace(id);
        comp.id = id;

        // Metele un helper
        comp.helper = core.createComponentHelper(comp.id);

        return comp;
    };

    /**
     * Inicializa la aplicacion de modo normal
     */
    core.initialize = function () {

        var body_html = $('body').html();

        // Saca por regexps id
        var id_regex_results = /userid=(\d*)/.exec(body_html);

        // Si el usuario no está logueado, aborta.
        if ( ! id_regex_results) {
            return false;
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

        // Carga modulo de preferencias
        SHURSCRIPT.preferences.start();

        // Lanza carga modulos
        SHURSCRIPT.moduleManager.startOnDocReadyModules();

        // Busca actualizaciones
        // TODO
    };

    /**
     * Inicializa la aplicacion en modo prematuro (antes del doc ready)
     */
    core.initializeEagerly = function () {
        // De forma pseudo-asincronica, espera hasta que el head este cargado
        SHURSCRIPT.moduleManager.startEagerModules();
    };


})(jQuery, SHURSCRIPT, bootbox, console);
