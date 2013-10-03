(function ($, SHURSCRIPT, GM, console, undefined) {
    'use strict';

    // Define el prototipo del helper
    var proto = {
        log: function (message) {
            console.log("[SHURSCRIPT]" + (this.moduleName ? (" [Modulo " + this.moduleName + "] ") : " ") + new Date().toLocaleTimeString() + ": " + message);
        },
        setValue: function(key, value) {
            GM.setValue("SHURSCRIPT_" + (this.moduleName ? this.moduleName + "_" : "") + key + "_" + SHURSCRIPT.user.id, value);
        },
        getValue: function(key, defaultValue) {
            return GM.getValue("SHURSCRIPT_" + (this.moduleName ? this.moduleName + "_" : "") + key + "_" + SHURSCRIPT.user.id, defaultValue);
        },
        deleteValue: function(key) {
            GM.deleteValue("SHURSCRIPT_" + (this.moduleName ? this.moduleName + "_" : "") + key + "_" + SHURSCRIPT.user.id);
        }
    };

    SHURSCRIPT.getHelper = function (moduleName) {
        var helper = Object.create(proto);
        helper.moduleName = moduleName;
        return helper;
    };

})(jQuery, SHURSCRIPT, GREASEMONKEY, window.console);
