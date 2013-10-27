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

    // Prototipo para los helpers
    var protoHelper = {
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
            GM.setValue(this._getShurKey(key), value);
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
            GM.deleteValue(this._getShurKey(key), withId);
        },

        /**
         * Lanza excepcion
         *
         * @param {string} message - mensaje para la excepcion
         */
        throw: function (message) {
            throw this._getCallerDescription() + message;
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
        bootbox: bootbox,
        location: location
    };

    /**
     * Crea un helper
     *
     * @param {string} moduleId - id modulo o componente
     */
    core.createHelper =  function (moduleId) {
        var newHelper = Object.create(protoHelper);
        newHelper.moduleId = moduleId;
        return newHelper;
    };

    core.helper = core.createHelper('core');

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
        comp.helper = core.createHelper(comp.id);

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
        SHURSCRIPT.moduleManager.startModulesOnDocReady();

        // Busca actualizaciones
        // TODO
    };

    /**
     * Inicializa la aplicacion en modo prematuro (antes del doc ready)
     */
    core.initializeEagerly = function () {
        // De forma pseudo-asincronica, espera hasta que el head este cargado

//        Esto se espera a que head este cargado, pero funciona igual de bien sin el
//        var startLoopHeadReady = function () {
//            if ($('head') !== null) {
//                SHURSCRIPT.moduleManager.startModulesEagerly();
//            } else {
//                setTimeout(startLoopHeadReady, 10);
//            }
//        }
//        startLoopHeadReady();

        SHURSCRIPT.moduleManager.startModulesEagerly();
    };


})(jQuery, SHURSCRIPT, bootbox, console);
