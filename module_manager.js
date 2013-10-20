(function ($, SHURSCRIPT, undefined) {
    'use strict';
    /*
    Componente moduleManager: creacion y registro de modulos
    */

    var moduleManager = SHURSCRIPT.createNameSpace('moduleManager');

    moduleManager.id = 'ModuleManager';
    moduleManager.helper = SHURSCRIPT.helper.createHelper(moduleManager.id);

    moduleManager.ALL = 'ALL';
    moduleManager.NO_FRONTPAGE = 'NO_FRONTPAGE';

    // Registra Objeto base para modulos
    moduleManager.protoModule = {
        enabledByDefault: true,
        additionalLoadCheck: function () {return true;},
        getPreferences: function () {return {};},
        domain: moduleManager.NO_FRONTPAGE,
        isValidPage: function () {
            /*
            Comprueba si en la pagina actual el modulo
            debe lanzarse.
            */
            var domain = this.domain,
                page = SHURSCRIPT.core.environment.page;

            if (typeof domain === 'string') {
                if (domain === moduleManager.ALL) {
                    return true;
                } else if (domain === moduleManager.NO_FRONTPAGE) {
                    return page !== '/';
                }
                return page === domain;
            }

            // Si array, true si page en array
            return (domain.indexOf(page) > -1);
        }
    };

    // Store de modulos
    moduleManager.modules = {};

    moduleManager.createModule = function (specs) {
        /*
        Genera modulo extendiendo la base y lo registra
        */

        // Crea modulo a partir del proto modulo
        var module = Object.create(moduleManager.protoModule);

        // Copia parametros y si falta alguno, aborta
        var params = ['id', 'name', 'author', 'version', 'description'];

        $.each(params, function (index, param) {

            // Comprueba que no falte el parametro
            if (specs[param] === undefined) {
                var mod_name = specs.id || specs.name || 'no identificado';

                var error_msg = 'Error generando modulo {' + mod_name +
                                '}.El parametro ' + param + ' no ha sido definido.';
                moduleManager.helper.log(error_msg);

                // Aborta todo
                throw (error_msg);
            }

            // Si todo va bien, copia.
            module[param] = specs[param];
        });

        // Metele un helper ya configurado
        module.helper = SHURSCRIPT.helper.createHelper(module.id);

        // Registra modulo
        moduleManager.modules[module.id] = module;

        return module;
    };

    moduleManager.loadModules = function () {
        /*
        Lanza la carga de modulos
        */

        // Ejecutamos settingsWindow
        // moduleManager.settingsWindow.load();

        // Loop sobre modulos para cargarlos
        $.each(moduleManager.modules, function (moduleName, moduleObject) {

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

                moduleManager.helper.log('Cargando modulo ' + moduleObject.id);
                moduleObject.load();
                moduleManager.helper.log('Modulo ' + moduleObject.id + ' cargado');
            } catch (e) {
                moduleManager.helper.log('Fallo cargando modulo ' + moduleObject.id + '\nRazon: ' + e);
            }
        });
    };

})(jQuery, SHURSCRIPT);