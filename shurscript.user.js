// Shur Scripts SA
// GPLv2 Licensed
// http://www.gnu.org/licenses/gpl-2.0.html
//
// ==UserScript==
// @name            ShurScript
// @description     Script para ForoCoches
// @namespace       http://shurscript.es
// @version         0.10.1-exp
// @author          TheBronx
// @author          xusoO
// @author          Fritanga
// @author          juno / ikaros45
// @include         *forocoches.com*
// @grant           GM_log
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_deleteValue
// @grant           GM_xmlhttpRequest
// @grant           GM_registerMenuCommand
// @grant           GM_addStyle
// @grant           GM_getResourceText
// @grant           GM_getResourceURL
// @require         http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @require         http://netdna.bootstrapcdn.com/bootstrap/3.0.0-wip/js/bootstrap.min.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/plugins/bootbox.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/plugins/Markdown.Converter.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/gm_wrap.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/core.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/proto_module.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/helper.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/Quotes.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/FilterThreads.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/BetterPosts.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/Scrollers.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/NestedQuotes.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/BottomNavigation.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/RefreshSearch.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/NightMode.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/AutoUpdater.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/preferences.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/settings_window.js
// @resource        nightmodecss https://github.com/TheBronx/shurscript/raw/experimental/css/nightmode-min.css
// @resource        bootstrapcss https://github.com/TheBronx/shurscript/raw/experimental/css/bootstrap.css
// @resource        scroller-img https://github.com/TheBronx/shurscript/raw/experimental/img/scroller.png
// @resource        star-img https://github.com/TheBronx/shurscript/raw/experimental/img/star.png
// @resource        trash-img https://github.com/TheBronx/shurscript/raw/experimental/img/trash.png
// @resource        trash-black-img https://github.com/TheBronx/shurscript/raw/experimental/img/trash-black.png
// @resource        nightmode-on https://github.com/TheBronx/shurscript/raw/experimental/img/light-on.png
// @resource        nightmode-off https://github.com/TheBronx/shurscript/raw/experimental/img/light-off.png
// ==/UserScript==

jQuery(document).ready(function(){
    if (window.top !== window) { // [xusoO] Evitar que se ejecute dentro de los iframes WYSIWYG
        return;
    }

    SHURSCRIPT.initialize();

    if (SHURSCRIPT.env.user.loggedIn) {
        SHURSCRIPT.loadModules();
        // SHURSCRIPT.AutoUpdater.check();
    }
    /*
    if (isLoggedIn() && isCompatible()) {
        initialize();
        loadModules();

        AutoUpdater = new AutoUpdater();
        AutoUpdater.check();
    }*/
});

// var helper;
// var allModules = []; //Todos los modulos
// var activeModules = {}; //{"modulo1" : true, "modulo2" : false, etc.}
// var AutoUpdater;

// /* Variables útiles y comunes a todos los módulos */
// var page; //Página actual (sin http://forocoches.com/foro ni parámetros php)
// var username;
// var userid;
// var scriptVersion;
// // Comprueba si estamos en la portada
// var inFrontPage = location.href === 'http://www.forocoches.com/'

// jQuery(document).ready(function(){
//     if (window.top !== window) { // [xusoO] Evitar que se ejecute dentro de los iframes WYSIWYG
//         return;
//     }

//     if (isLoggedIn() && isCompatible()) {
//         initialize();
//         loadModules();

//         AutoUpdater = new AutoUpdater();
//         AutoUpdater.check();
//     }
// });

// function isCompatible() {
//     //Comprobamos que está soportada la extensión y de paso recogemos la version del script actual.
//     if (typeof GM_info !== 'undefined' ) { //GreaseMonkey, TamperMonkey, ...
//         scriptVersion = GM_info.script.version;

//     } else if (typeof GM_getMetadata !== 'undefined') { //Scriptish
//         scriptVersion = GM_getMetadata('version');

//     } else {
//         alert('El addon de userscripts de tu navegador no está soportado.');
//         return false;
//     }

//     return true;
// }

// function initialize() {

//     helper = new ScriptHelper();

//     //inicializamos variables
//     page = location.pathname.replace("/foro","");

//     GM_addStyle(GM_getResourceText('bootstrapcss'));

//     //Configuracion de las ventanas modales
//     bootbox.setDefaults({
//         locale: "es",
//         className: "shurscript",
//         closeButton: false
//     });

// }

// function isLoggedIn() {
//     var user;

//     if (inFrontPage) {
//         user = jQuery("#AutoNumber1 a[href*='member.php?u=']").first();
//     } else {
//         user = jQuery(".alt2 > .smallfont > strong > a[href*='member.php?u=']").first();
//         username = user.text();
//     }

//     if (user.length) {
//         userid = user.attr("href").match(/\?u\=(\d*)/)[1];
//         return true;
//     }

//     return false;
// }

// function loadModules() {

//     activeModules = getActiveModules();
//     var moduleNames = getAllModules(),
//         module;

//     var getModuleInstance = function (moduleName) {
//         var module;

//         try {
//             module = eval("new " + moduleName + "()");
//         } catch (e) {
//             helper.log('No se ha podido instanciar el modulo "' + moduleName + '"\nRazon: ' + e);
//         }

//         return module;
//     };

//     // En $.each continue="return true", break="return false"
//     $.each(moduleNames, function(index, moduleName) {

//         // Instancia modulo
//         module = getModuleInstance(moduleName);

//         if ( ! module) {
//             return true;
//         }

//         // Guardalo
//         allModules.push(module);

//         // Si el modulo no está registrado en activeModules, hazlo y mete su .enabledByDefault como valor
//         if ( ! activeModules.hasOwnProperty(moduleName)) {
//             activeModules[moduleName] = module.enabledByDefault;
//         }

//         // Comprueba que el modulo está activo o aborta
//         if ( ! activeModules[moduleName]) {
//             return true;
//         }

//         // Si el modulo tiene .shouldLoad y este devuelve false, aborta
//         if (module.shouldLoad && ( ! module.shouldLoad())) {
//             return true;
//         }

//         // Si estamos en portada pero el modulo no carga en portada, continue
//         if (inFrontPage && ( ! module.worksInFrontPage))  {
//             return true;
//         }

//         // Si cumplimos con todo, intenta cargar el modulo
//         try {
//             helper.log("Loading module '" + moduleName + "'...");
//             module.load();
//             helper.log ("Module '" + moduleName + "' loaded successfully.");
//         } catch (e) {
//             helper.log ("Failed to load module '" + moduleName + "'\nCaused by: " + e);
//         }
//     });
// }
