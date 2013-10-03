var SHURSCRIPT = (function ($, GM, undefined) {
    'use strict';

    var self = {};

    self.name = 'core';

    // self.GM = GM; // Esto casi que solo lo deberian usar los helpers
    self.modules = {};

    self.initialize = function () {
        // Helper para el core
        self.helper = SHURSCRIPT.getHelper(self.name);

        // Saca toda la informacion del entorno (environment)
        self.env = {
            inFrontPage: location.href === 'http://www.forocoches.com/',
            page: location.pathname.replace("/foro","")
        };

        var body_html = $('body').html();

        // Saca por regexps nick y id
        var id_regex_results = /userid=(\d*)/.exec(body_html);

        if (id_regex_results) {
            self.env.user = {
                id: id_regex_results[1],
                name: /Hola, <(?:.*?)>(\w*)<\/(?:.*?)>/.exec(body_html)[1],
                loggedIn: true
            }
        }
    };

    // Objeto base para modulos
    self._moduleProto = {
        enabledByDefault: true,
        worksInFrontPage: false,
        shouldLoad: function () {return true;},
        getPreferences: function () {return [];}
    };

    self.loadModules = function () {
        $.each(self.modules, function(moduleName, moduleObject) {

            // Extiende el objeto
            moduleObject.__proto__ = self._moduleProto;

            // Si no debe cargar, continue
            if ( ! moduleObject.shouldLoad()) {
                return true;
            }

            // Si estamos en portada y el modulo no funciona en la portada, continue
            if (self.env.inFrontPage && ( ! moduleObject.worksInFrontPage)) {
                return true;
            }

            // Luz verde: Ahora a ciclar sanamente al objeto.
            moduleObject.helper = self.getHelper(moduleObject.id);


            // Intentamos carga.
            try {
                self.helper.log('Cargando modulo ' + moduleObject.id);
                moduleObject.load();
                self.helper.log('Modulo ' + moduleObject.id + 'cargado');
            } catch (e) {
                self.helper.log('Fallo cargando modulo ' + moduleObject.id + '\nRazon: ' + e);
            }
        });
    };

    return self;

})(jQuery, GREASEMONKEY);