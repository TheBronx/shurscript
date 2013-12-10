/**
 * Módulo de sincronización de preferencias en la nube
 * Sobreescribe los métodos getValue, setValue y deleteValue del objeto core.GreaseMonkey
 * IMPORTANTE: debe cargarse antes que cualquier otro componente/módulo que no sea el propio core
 */
(function ($, SHURSCRIPT, undefined) {
    'use strict';
    
    //por si queremos usar los get/set/delete que trabajan en local y no en la nube
    var noCloud = {
        setValue : SHURSCRIPT.GreaseMonkey.setValue,
        getValue : SHURSCRIPT.GreaseMonkey.getValue,
        deleteValue : SHURSCRIPT.GreaseMonkey.deleteValue
    };
    
    /**
     *
     * @param key
     * @param value
     */
    SHURSCRIPT.GreaseMonkey.setValue =  function (key, value) {
        console.log("setValue("+key+") intercepted");
    };

    /**
     *
     * @param key
     * @param defaultValue
     * @returns {string} - valor leido del navegador
     */
    SHURSCRIPT.GreaseMonkey.getValue =  function (key, defaultValue) {
        console.log("getValue("+key+") intercepted");
    };

    /**
     *
     * @param {string} key - nombre llave
     */
    SHURSCRIPT.GreaseMonkey.deleteValue =  function (key) {
        console.log("deleteValue("+key+") intercepted");
    };

})(jQuery, SHURSCRIPT);
