var SHURSCRIPT = (function ($, undefined) {
    'use strict';
    var self = {};

    self.id = 'core';

    // self.GM = GM; // Esto casi que solo lo deberian usar los helpers
    self.modules = {};

    self.initialize = function () {
        // Helper para el core
        self._helper = SHURSCRIPT.getHelper(self.id);

        // Saca toda la informacion del entorno (environment)
        self.env = {
            page: self._helper.location.pathname.replace("/foro","")
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
        $.each(self.modules, function (moduleName, moduleObject) {

            // Intentamos carga.
            try {

                // Inicializa: pasa helper
                moduleObject.__init__(self.getHelper(moduleObject.id));

                // Si no estamos en una pagina en la que el modulo corre, continue
                if ( ! moduleObject.isValidPage()) {
                    return true;
                }

                // Si no cumple el check adicional, continue
                if ( ! moduleObject.additionalLoadCheck()) {
                    return true;
                }

                self._helper.log('Cargando modulo ' + moduleObject.id);
                moduleObject.load();
                self._helper.log('Modulo ' + moduleObject.id + 'cargado');
            } catch (e) {
                self._helper.log('Fallo cargando modulo ' + moduleObject.id + '\nRazon: ' + e);
            }
        });
    };

    return self;
})(jQuery);
