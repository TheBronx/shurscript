// Shur Scripts SA
// GPLv2 Licensed
// http://www.gnu.org/licenses/gpl-2.0.html
//
// ==UserScript==
// @name            ShurScript
// @description     Script para ForoCoches
// @namespace       http://shurscript.es
// @version         0.10.2.1
// @author          TheBronx
// @author          xusoO
// @author          Fritanga
// @author          juno / ikaros45
// @include         *forocoches.com*
// @require         http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @require         http://netdna.bootstrapcdn.com/bootstrap/3.0.0-wip/js/bootstrap.min.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/plugins/bootbox.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/plugins/Markdown.Converter.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/modules/Quotes.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/modules/FilterThreads.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/modules/BetterPosts.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/modules/Scrollers.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/modules/NestedQuotes.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/modules/BottomNavigation.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/modules/RefreshSearch.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/modules/NightMode.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/modules/HighlightOP.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/AutoUpdater.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/preferences.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/settings_window.js
// @resource nightmodecss https://github.com/TheBronx/shurscript/raw/dev/css/nightmode-min.css
// @resource bootstrapcss https://github.com/TheBronx/shurscript/raw/dev/css/bootstrap.css
// @resource scroller-img https://github.com/TheBronx/shurscript/raw/dev/img/scroller.png
// @resource star-img https://github.com/TheBronx/shurscript/raw/dev/img/star.png
// @resource trash-img https://github.com/TheBronx/shurscript/raw/dev/img/trash.png
// @resource trash-black-img https://github.com/TheBronx/shurscript/raw/dev/img/trash-black.png
// @resource nightmode-on https://github.com/TheBronx/shurscript/raw/dev/img/light-on.png
// @resource nightmode-off https://github.com/TheBronx/shurscript/raw/dev/img/light-off.png
// @grant   GM_log
// @grant   GM_getValue
// @grant   GM_setValue
// @grant   GM_deleteValue
// @grant   GM_xmlhttpRequest
// @grant   GM_registerMenuCommand
// @grant   GM_addStyle
// @grant   GM_getResourceText
// @grant   GM_getResourceURL
// ==/UserScript==

var helper;
var allModules = []; //Todos los modulos
var activeModules = {}; //{"modulo1" : true, "modulo2" : false, etc.}
var AutoUpdater;

/* Variables útiles y comunes a todos los módulos */
var page; //Página actual (sin http://forocoches.com/foro ni parámetros php)
var username;
var userid;
var scriptVersion;
// Comprueba si estamos en la portada
var inFrontPage = location.href === 'http://www.forocoches.com/'

jQuery(document).ready(function(){
    if (window.top !== window) { // [xusoO] Evitar que se ejecute dentro de los iframes WYSIWYG
        return;
    }

    if (isLoggedIn() && isCompatible()) {
        initialize();
        loadModules();

        AutoUpdater = new AutoUpdater();
        AutoUpdater.check();
    }
});

function isCompatible() {
    //Comprobamos que está soportada la extensión y de paso recogemos la version del script actual.
    if (typeof GM_info !== 'undefined' ) { //GreaseMonkey, TamperMonkey, ...
        scriptVersion = GM_info.script.version;

    } else if (typeof GM_getMetadata !== 'undefined') { //Scriptish
        scriptVersion = GM_getMetadata('version');

    } else {
        alert('El addon de userscripts de tu navegador no está soportado.');
        return false;
    }

    return true;
}

function initialize() {

    helper = new ScriptHelper();

    //inicializamos variables
    page = location.pathname.replace("/foro","");

    GM_addStyle(GM_getResourceText('bootstrapcss'));

    //Configuracion de las ventanas modales
    bootbox.setDefaults({
        locale: "es",
        className: "shurscript",
        closeButton: false
    });

}

function isLoggedIn() {
    var user;

    if (inFrontPage) {
        user = jQuery("#AutoNumber1 a[href*='member.php?u=']").first();
    } else {
        user = jQuery(".alt2 > .smallfont > strong > a[href*='member.php?u=']").first();
        username = user.text();
    }

    if (user.length) {
        userid = user.attr("href").match(/\?u\=(\d*)/)[1];
        return true;
    }

    return false;
}

function loadModules() {

    activeModules = getActiveModules();
    var moduleNames = getAllModules(),
        module;

    var getModuleInstance = function (moduleName) {
        var module;

        try {
            module = eval("new " + moduleName + "()");
        } catch (e) {
            helper.log('No se ha podido instanciar el modulo "' + moduleName + '"\nRazon: ' + e);
        }

        return module;
    };

    // En $.each continue="return true", break="return false"
    $.each(moduleNames, function(index, moduleName) {

        // Instancia modulo
        module = getModuleInstance(moduleName);

        if ( ! module) {
            return true;
        }

        // Guardalo
        allModules.push(module);

        // Si el modulo no está registrado en activeModules, hazlo y mete su .enabledByDefault como valor
        if ( ! activeModules.hasOwnProperty(moduleName)) {
            activeModules[moduleName] = module.enabledByDefault;
        }

        // Comprueba que el modulo está activo o aborta
        if ( ! activeModules[moduleName]) {
            return true;
        }

        // Si el modulo tiene .shouldLoad y este devuelve false, aborta
        if (module.shouldLoad && ( ! module.shouldLoad())) {
            return true;
        }

        // Si estamos en portada pero el modulo no carga en portada, continue
        if (inFrontPage && ( ! module.worksInFrontPage))  {
            return true;
        }

        // Si cumplimos con todo, intenta cargar el modulo
        try {
            helper.log("Loading module '" + moduleName + "'...");
            module.load();
            helper.log ("Module '" + moduleName + "' loaded successfully.");
        } catch (e) {
            helper.log ("Failed to load module '" + moduleName + "'\nCaused by: " + e);
        }
    });
}

/*
* Obtener los modulos cargados de los @require
*/
function getAllModules() {
    var modules = [];
    if (typeof GM_info !== 'undefined' ) {
        var metas = GM_info.scriptMetaStr.split("// @");
        var meta;
        for (var i = 0; i < metas.length; i++) {
            meta = metas[i].trim();
            if (meta.indexOf("require") === 0 && meta.match("/modules/")) {
                var moduleName = meta.match(/modules\/(.*)\.js/)[1];
                modules.push(moduleName.trim());
            }
        }
    } else if (typeof GM_getMetadata !== 'undefined') { //Scriptish
        var requires = GM_getMetadata('require');
        for (var i = 0; i < requires.length; i++) {
            if (requires[i].match("/modules/")) {
                var moduleName = requires[i].match(/modules\/(.*)\.js/)[1];
                modules.push(moduleName);
            }
        }
    }

    return modules;
}

/*
* Obtienes los modulos que tiene activados el usuario {"modulo1" : true, "modulo2" : false, etc.}
*/
function getActiveModules() {
    var serializedActiveModules = helper.getValue("MODULES"),
        activeModules = {};

    try {
        activeModules = JSON.parse(serializedActiveModules);
    } catch (e) {
        helper.deleteValue("MODULES");
    }

    return activeModules;
}


/* Metodos de ayuda comunes a todos los módulos. */
function ScriptHelper(moduleName) {
    this.moduleName = moduleName;
}

ScriptHelper.prototype.log = function(message) {
    console.log("[SHURSCRIPT]" + (this.moduleName ? (" [Modulo " + this.moduleName + "] ") : " ") + new Date().toLocaleTimeString() + ": " + message)
}

ScriptHelper.prototype.setValue = function(key, value) {
    GM_setValue("SHURSCRIPT_" + (this.moduleName ? this.moduleName + "_" : "") + key + "_" + userid, value);
}

ScriptHelper.prototype.getValue = function(key, defaultValue) {
    return GM_getValue("SHURSCRIPT_" + (this.moduleName ? this.moduleName + "_" : "") + key + "_" + userid, defaultValue);
}

ScriptHelper.prototype.deleteValue = function(key) {
    GM_deleteValue("SHURSCRIPT_" + (this.moduleName ? this.moduleName + "_" : "") + key + "_" + userid);
}
