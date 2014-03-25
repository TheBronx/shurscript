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
// @run-at          document-end
// @require         http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @require         http://netdna.bootstrapcdn.com/bootstrap/3.0.0-wip/js/bootstrap.min.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/plugins/bootbox.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/plugins/Markdown.Converter.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/core.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/components/sync.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/components/modulemanager.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/components/templater.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/components/autoupdater.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/components/preferences.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/Quotes.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/FilterThreads.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/BetterPosts.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/Scrollers.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/NestedQuotes.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/BottomNavigation.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/RefreshSearch.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/NightMode.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/HighlightOP.js
// @resource        nightmodecss https://github.com/TheBronx/shurscript/raw/experimental/css/nightmode-min.css
// @resource        bootstrapcss https://github.com/TheBronx/shurscript/raw/experimental/css/bootstrap.css
// @resource        modalcss https://github.com/TheBronx/shurscript/raw/experimental/css/modal.css
// @resource        modalhtml https://github.com/TheBronx/shurscript/raw/experimental/html/modal.html
// @resource        quotehtml https://github.com/TheBronx/shurscript/raw/experimental/html/quote.html
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

