(function ($, SHURSCRIPT, undefined) {
    'use strict';
    /*
    Componente core: nucleo de la aplicacion
    */

    var core = SHURSCRIPT.createNameSpace('core');

    core.id = 'core';
    core.helper = SHURSCRIPT.helper.createHelper(core.id);

    core.initialize = function () {

        var body_html = $('body').html();

        // Saca por regexps id
        var id_regex_results = /userid=(\d*)/.exec(body_html);

        // Si el usuario no está logueado, aborta.
        if ( ! id_regex_results) {
            return false;
        }

        // Registra entorno
        core.environment = {
            user: {
                id: id_regex_results[1],
                name: /Hola, <(?:.*?)>(\w*)<\/(?:.*?)>/.exec(body_html)[1]
            },
            page: core.helper.location.pathname.replace("/foro","")
        };

        // Mete bootstrap
        core.helper.addStyle('bootstrapcss');

        // Configuracion de las ventanas modales
        core.helper.bootbox.setDefaults({
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
    core.getModulesConfig = function () {
        var modulesConfig = {};

        try {
            var serializedModulesConfig = core.helper.GM.getValue("MODULES");
            modulesConfig = JSON.parse(serializedModulesConfig);

        } catch (e) {
            core.helper.GM.deleteValue("MODULES");
        }

        return modulesConfig;
     };

})(jQuery, SHURSCRIPT);
