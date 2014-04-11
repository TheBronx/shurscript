(function (SH, $, console, undefined) {
    'use strict';

    SH.system = {
        /**
         * Crea un tool system personalizado
         */
        getInstance: function (id) {
            var sys = Object.create(this);
            sys.id = id;

            return sys;
        },
        /**
         * Compone una cadena con el nombre del modulo que esta llamando al helper y la hora
         */
        _getCallerDescription: function () {
            return '[SHURSCRIPT]  [Modulo ' + this.id + '] ' + new Date().toLocaleTimeString() + ': ';
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
         * Loguea y lanza excepcion
         */
        throw: function (name, description) {
            var exc = '[EXCEPTION]' + this._getCallerDescription() + name + ' --- ' + description;
            this.log(exc);
            throw new Error(exc);
        }
    };

})(SH, jQuery, window.console);