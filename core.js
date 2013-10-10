var SHURSCRIPT = (function ($, undefined) {
    'use strict';
    var self = {};

    self.id = 'core';
    self.scriptVersion = '10.5';
    self.modules = {};

    // Genera modulo extendiendo la base y lo registra
    self.createModule = function (specs) {

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
        module.helper = self.createHelper(module.id);

        // Guarda modulo
        self.modules[module.id] = module;

        return module;
    };

    self.initialize = function () {

        // Configuracion de las ventanas modales
        self.helper.bootbox.setDefaults({
            locale: "es",
            className: "shurscript",
            closeButton: false
        });

        // Mete bootstrap
        self.helper.addStyle('bootstrapcss');

        // Saca toda la informacion del entorno (environment)
        self.env = {
            page: self.helper.location.pathname.replace("/foro",""),
            user: {
                loggedIn: false // valor por defecto
            }
        };

        var body_html = $('body').html();

        // Saca por regexps nick y id
        var id_regex_results = /userid=(\d*)/.exec(body_html);

        if (id_regex_results) {
            self.env.user = {
                id: id_regex_results[1],
                name: /Hola, <(?:.*?)>(\w*)<\/(?:.*?)>/.exec(body_html)[1],
                loggedIn: true
            };
        }
    };

    self.loadModules = function () {
        // Ejecutamos settingsWindow
        self.settingsWindow.load();

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

    // Devuelve objeto con la configuracion del usuario (activo/inactivo)
    // {module1: true, module2: false...}
    self.getModulesConfig = function () {
        var modulesConfig = {};

        try {
            var serializedModulesConfig = self.helper.GM.getValue("MODULES");
            modulesConfig = JSON.parse(serializedModulesConfig);

        } catch (e) {
            self.helper.GM.deleteValue("MODULES");
        }

        return modulesConfig;
     };

    return self;
})(jQuery);
