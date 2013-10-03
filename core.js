var SHURSCRIPT = (function ($, GM, undefined) {
    'use strict';

    var self = {};

    self.name = 'core';

    self.GM = GM;
    self.modules = {};

    self.initialize = function () {
        self.helper = SHURSCRIPT.getHelper(self.name);

        self.env = {
            page: location.pathname.replace("/foro","")
        };

    };

    self.loadModules = function () {

    };

    return self;

})(jQuery, GREASEMONKEY);