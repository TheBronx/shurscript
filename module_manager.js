(function ($, SHURSCRIPT, undefined) {
    'use strict';
    /*
    Unidad para creacion y registro de modulos
    */

    var self = {};

    self.id = 'ModuleManager';
    self.helper = SHURSCRIPT.helper.createHelper(self.id);

    self.ALL = 'ALL';
    self.NO_FRONTPAGE = 'NO_FRONTPAGE';

    // Registra Objeto base para modulos
    self.protoModule = {
        enabledByDefault: true,
        additionalLoadCheck: function () {return true;},
        getPreferences: function () {return {};},
        domain: NO_FRONTPAGE,
        isValidPage: function () {
            /*
            Comprueba si en la pagina actual el modulo
            debe lanzarse.
            */
            var domain = this.domain,
                page = SHURSCRIPT.env.page;

            if (typeof domain === 'string') {
                if (domain === self.ALL) {
                    return true;
                } else if (domain === self.NO_FRONTPAGE) {
                    return page !== '/';
                }
                return page === domain;
            }

            // Si array, true si page en array
            return (domain.indexOf(page) > -1);
        }
    };

    self.modules = {};

    self.createModule = function (specs) {
        /*
        Genera modulo extendiendo la base y lo registra
        */

        // Crea modulo a partir del proto modulo
        var module = Object.create(self.protoModule);

        // Copia parametros y si falta alguno, aborta
        var params = ['id', 'name', 'author', 'version', 'description'];

        $.each(params, function (index, param) {

            // Comprueba que no falte el parametro
            if (specs[param] === undefined) {
                var mod_name = specs.id || specs.name || 'no identificado';

                var error_msg = 'Error generando modulo {' + mod_name +
                                '}.El parametro ' + param + ' no ha sido definido.';
                self.helper.log(error_msg);

                // Aborta todo
                throw (error_msg);
            }

            // Si todo va bien, copia.
            module[param] = specs[param];
        });

        // Metele un helper ya configurado
        module.helper = SHURSCRIPT.helper.createHelper(module.id);

        // Registra modulo
        self.modules[module.id] = module;

        return module;
    };

    self.loadModules = function () {
        /*
        Lanza la carga de modulos
        */

        // Ejecutamos settingsWindow
        // self.settingsWindow.load();

        // Loop sobre modulos para cargarlos
        $.each(self.modules, function (moduleName, moduleObject) {

            // Intentamos carga.
            try {

                // Si no estamos en una pagina en la que el modulo corre, continue
                if ( ! moduleObject.isValidPage()) {
                    return true;
                }

                // Si no cumple el check adicional, continue
                if ( ! moduleObject.additionalLoadCheck()) {
                    return true;
                }

                self.helper.log('Cargando modulo ' + moduleObject.id);
                moduleObject.load();
                self.helper.log('Modulo ' + moduleObject.id + ' cargado');
            } catch (e) {
                self.helper.log('Fallo cargando modulo ' + moduleObject.id + '\nRazon: ' + e);
            }
        });
    };

    SHURSCRIPT.moduleManager = self;

})(jQuery, SHURSCRIPT);