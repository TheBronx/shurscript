(function ($, SHURSCRIPT, GM, bootbox, location, console, undefined) {
    'use strict';
    /*
    Unidad para helpers
    */

    var self = {};

    // Define el prototipo del helper
    self.proto = {
        log: function (message) {
            console.log("[SHURSCRIPT]" + (this.moduleName ? (" [Modulo " + this.moduleName + "] ") : " ") + new Date().toLocaleTimeString() + ": " + message);
        },
        setValue: function(key, value) {
            GM.setValue("SHURSCRIPT_" + (this.moduleName ? this.moduleName + "_" : "") + key + "_" + SHURSCRIPT.core.environment.user.id, value);
        },
        getValue: function(key, defaultValue) {
            return GM.getValue("SHURSCRIPT_" + (this.moduleName ? this.moduleName + "_" : "") + key + "_" + SHURSCRIPT.core.environment.user.id, defaultValue);
        },
        deleteValue: function(key) {
            GM.deleteValue("SHURSCRIPT_" + (this.moduleName ? this.moduleName + "_" : "") + key + "_" + SHURSCRIPT.core.environment.user.id);
        },
        addStyle: function (styleResource) {
            /*
            Mete CSS previamente registrado en archivo principal con @resource
            */
            var css = GM.getResourceText(styleResource);
            GM.addStyle(css);
        },
        GM: GM,
        bootbox: bootbox,
        location: location
    };

    self.createHelper = function (moduleName) {
        var helper = Object.create(self.proto);
        helper.moduleName = moduleName;
        return helper;
    };

    SHURSCRIPT.helper = self;
})(jQuery, SHURSCRIPT, GREASEMONKEY, bootbox, location, console);
