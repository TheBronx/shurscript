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
        enabledByDefault: true,

        // Por defecto los modulos arrancan fuera de la portada
        domain: moduleManager.NO_FRONTPAGE,

        /**
         * Funcion a sobreescribir si queremos mas preferencias
         */
        getPreferences: function () {return {};},

        /**
         * Function a sobreescribir para comprobar si onEagerLoad se debe ejecutar
         */
        eagerStartCheck: function () {return false;},

        /**
         * Funcion a sobreescribir si queremos ejecutar algo antes de document.ready
         */
        onEagerStart: function () {},

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
        additionalStartCheck: function () {return true;},

        /**
         * Funcion a sobreescribir que se ejecutara tras la carga del DOM si el modulo debe ejecutarse
         * Normalmente aqui va deberia ir la logica del modulo
         */
        onStart: function () {}


    };

    // Store de modulos
    moduleManager.modules = {};

    /**
     * Genera modulo extendiendo la base y lo registra
     *
     * @param specs.id
     * @param specs.name
     * @param specs.author
     * @param specs.version
     * @param specs.description
     * @returns module
     */
    moduleManager.createModule = function (specs) {

        // Crea modulo a partir del proto modulo
        var module = Object.create(protoModule);

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
        module.helper = SHURSCRIPT.core.createHelper(module.id);

        // Registra modulo
        moduleManager.modules[module.id] = module;

        return module;
    };

    /**
     * Lanza la carga de modulos en document.ready
     */
    moduleManager.startModules = function () {


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
                if ( ! moduleObject.additionalStartCheck()) {
                    return true;
                }

                moduleManager.helper.log('Cargando modulo ' + moduleObject.id);
                moduleObject.onStart();
                moduleManager.helper.log('Modulo ' + moduleObject.id + ' cargado');
            } catch (e) {
                moduleManager.helper.log('Fallo cargando modulo ' + moduleObject.id + '\nRazon: ' + e);
            }
        });
    };

})(jQuery, SHURSCRIPT);