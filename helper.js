/**
 * Helper
 */

(function ($, _, SHURSCRIPT, console, undefined) {
    'use strict';

    SHURSCRIPT.helper = {
        _persist: SHURSCRIPT.Persist,
        _GM: SHURSCRIPT.GreaseMonkey,

        /**
         * Genera un helper
         * @param id - identificador del componente, modulo o lo que sea que esté usando el helper
         */
        getInstance: function (id) {
            return Object.create(this).__init__(id);
        },

        /**
         * Personaliza el objeto
         */
		__init__: function (id) {
			this._id = id;

			// Devuelve el objeto para hacer concatenacion
			return this;
		},


        /**
         * Loguea un mensaje
         *
         * @param message
         */
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
            return 'SHURSCRIPT_' + this._id + '_' + key + id;
        },

        /**
         * Compone una cadena con el nombre del modulo que esta llamando al helper y la hora
         */
        _getCallerDescription: function () {
            return '[SHURSCRIPT]  [Modulo ' + this.moduleId + '] ' + new Date().toLocaleTimeString() + ': ';
        },

        /**
         * Guarda un par key-value y propaga el cambio al server
         */
        setValue: function (key, value) {
            this._persist.setValue(this._getShurKey(key), value);
        },

        /**
         * Devuelve un valor
         */
        getValue: function (key, defaultValue) {
            return this._persist.getValue(this._getShurKey(key), defaultValue);
        },

        /**
         * Elimina un valor
         */
        deleteValue: function (key) {
            this._persist.deleteValue(this._getShurKey(key));
        },

        /**
         * Lanza excepcion
         *
         * @param {string} message - mensaje para la excepcion
         * @param {object} exception - [opcional] la excepcion
         */
         // TODO [ikaros45 07.04.2014]: lanzar excepciones se deberia de poder hacer desde cualquier parte.
//        throw: function (message, exception) {
//            this.log('[EXCEPTION] - ' + message);
//            if (exception !== undefined) {
//                this.log(exception);
//            }
//        },

        /**
         * Mete CSS previamente registrado en archivo principal con @resource
         *
         * @param {string} styleResource - nombre del recurso css
         */
        addStyle: function (styleResource) {
            var css = this._GM.getResourceText(styleResource);
            this._GM.addStyle(css);
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

        getResourceText: this._GM.getResourceText,
        getResourceURL: this._GM.getResourceURL,
        bootbox: bootbox,
        location: location

    };
})(jQuery, _, SHURSCRIPT, window.console);
