var SHURSCRIPT = (function ($, GM, undefined) {
    'use strict';

    var self = {};

    self.name = 'core';

    self.GM = GM;
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
        worksInFrontPage: true,
        shouldLoad: function () {return true;}
    };

    self.loadModules = function () {
        $.each(self.modules, function(moduleName, moduleObject) {

            // Extiende el objeto
            moduleObject.__proto__ = self._moduleProto;

            // Si no debe cargar, continue
            if ( ! moduleObject.shouldLoad()) {
                return true;
            }

            // Metele un helper
            moduleObject.helper = self.getHelper(moduleObject.name);

        });
    };

    return self;

})(jQuery, GREASEMONKEY);