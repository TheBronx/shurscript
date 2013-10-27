// Shur Scripts SA
// GPLv2 Licensed
// http://www.gnu.org/licenses/gpl-2.0.html
//
// ==UserScript==
// @name            ShurScript
// @description     Script para ForoCoches
// @namespace       http://shurscript.es
// @version         0.11.0-exp
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
// @run-at document-start
// @require         http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @require         http://netdna.bootstrapcdn.com/bootstrap/3.0.0-wip/js/bootstrap.min.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/plugins/bootbox.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/plugins/Markdown.Converter.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/core.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/components/modulemanager.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/components/templater.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/components/autoupdater.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/components/settingswindow.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/components/preferences.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/nightmode.js
// @resource        nightmodecss https://github.com/TheBronx/shurscript/raw/experimental/css/nightmode-min.css
// @resource        bootstrapcss https://github.com/TheBronx/shurscript/raw/experimental/css/bootstrap.css
// @resource        modalcss https://github.com/TheBronx/shurscript/raw/experimental/css/modal.css
// @resource        scroller-img https://github.com/TheBronx/shurscript/raw/experimental/img/scroller.png
// @resource        star-img https://github.com/TheBronx/shurscript/raw/experimental/img/star.png
// @resource        trash-img https://github.com/TheBronx/shurscript/raw/experimental/img/trash.png
// @resource        trash-black-img https://github.com/TheBronx/shurscript/raw/experimental/img/trash-black.png
// @resource        modalhtml https://github.com/TheBronx/shurscript/raw/experimental/html/modal.html
// ==/UserScript==

/**
 * Es imprescindible que los archivos js se carguen en este orden:
 * core > componentes > modulos
*/

if (window.top === window) { // [xusoO] Evitar que se ejecute dentro de los iframes WYSIWYG
    // Lanza la carga prematura
    SHURSCRIPT.core.initializeEagerly();

    // Programa la carga normal
    jQuery(document).ready(SHURSCRIPT.core.initialize);
}

