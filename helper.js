(function ($, SHURSCRIPT, bootbox, location, console, undefined) {
    'use strict';
    /*
    Componente helpers
    */

    var helper = SHURSCRIPT.createNameSpace('helper'),
        GM = SHURSCRIPT.GreaseMonkey;

    // Define el prototipo del helper
    helper.proto = {
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

    helper.createHelper = function (moduleName) {
        var newHelper = Object.create(helper.proto);
        newHelper.moduleName = moduleName;
        return newHelper;
    };

})(jQuery, SHURSCRIPT, bootbox, location, console);
