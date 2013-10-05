(function ($, SHURSCRIPT, undefined) {
    'use strict';

    // Registra Objeto base para modulos
    SHURSCRIPT.protoModule = {
        enabledByDefault: true,
        additionalLoadCheck: function () {return true;},
        getPreferences: function () {return {};},
        validPages: ['ALL'],
        isValidPage: function () {

            if (this.validPages[0] === 'ALL') {
                return true;
            }

            // Devuelve true si estamos en una pagina valida para el modulo
            return (this.validPages.indexOf(SHURSCRIPT.env.page) > -1);
        },
        __init__: function (helper) {
            this._helper = helper;

            // Comprueba que el modulo se ha iniciado correctamente
            var error_checks = {
                'id': this.id === undefined,
                'name': this.name === undefined,
                'author': this.author === undefined,
                'version': this.version === undefined,
                'description': this.description === undefined
            };

            $.each(error_checks, function (prop, error_condition) {
                if (error_condition) {
                    throw ('El modulo no tiene definida la propiedad ' + prop);
                }
            });

        }
    };

})(jQuery, SHURSCRIPT);