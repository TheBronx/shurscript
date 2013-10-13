(function ($, SHURSCRIPT, undefined) {
    'use strict';
    /*
    Unidad para el nucleo de la aplicacion
    */

    var self = {};

    self.id = 'core';
    self.helper = SHURSCRIPT.helper.createHelper(self.id);

    self.initialize = function () {

        var body_html = $('body').html();

        // Saca por regexps id
        var id_regex_results = /userid=(\d*)/.exec(body_html);

        // Si el usuario no está logueado, aborta.
        if ( ! id_regex_results) {
            return false;
        }

        // Registra entorno
        self.environment = {
            user: {
                id: id_regex_results[1],
                name: /Hola, <(?:.*?)>(\w*)<\/(?:.*?)>/.exec(body_html)[1]
            },
            page: self.helper.location.pathname.replace("/foro","")
        };

        // Mete bootstrap
        self.helper.addStyle('bootstrapcss');

        // Configuracion de las ventanas modales
        self.helper.bootbox.setDefaults({
            locale: "es",
            className: "shurscript",
            closeButton: false
        });

        // Carga la ventana de preferencias
        SHURSCRIPT.settingsWindow.load();

        // Lanza carga modulos
        SHURSCRIPT.moduleManager.loadModules();

        // Busca actualizaciones
        // TODO
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

     SHURSCRIPT.core = self;
})(jQuery, SHURSCRIPT);
