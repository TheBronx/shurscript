(function (SHURSCRIPT, undefined) {
    'use strict';

    // Registra Objeto base para modulos
    SHURSCRIPT.protoModule = {
        enabledByDefault: true,
        additionalLoadCheck: function () {return true;},
        getPreferences: function () {return {};},
        isValidPage: function () {
            // Devuelve true si estamos en una pagina valida para el modulo
            return (this.validPages.indexOf(SHURSCRIPT.env.page) > -1);
        },
        __init__: function (helper) {
            this._helper = helper;
        }
    };

})(SHURSCRIPT);