// Shur Scripts SA
// GPLv2 Licensed
// http://www.gnu.org/licenses/gpl-2.0.html
//
// ==UserScript==
// @name            ShurScript
// @description     Script para ForoCoches
// @namespace       http://shurscript.es
// @version         0.20.5
// @author          TheBronx
// @author          xusoO
// @author          Fritanga
// @author          juno / ikaros45
// @include         http://www.forocoches.com*
// @include         http://forocoches.com*
// @grant           GM_log
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_deleteValue
// @grant           GM_xmlhttpRequest
// @grant           GM_registerMenuCommand
// @grant           GM_addStyle
// @grant           GM_getResourceText
// @grant           GM_getResourceURL
// @grant           GM_getMetadata
// @run-at          document-end
// @require         http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min.js
// @require         http://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @require         http://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.1.1/js/bootstrap.min.js
// @require         https://github.com/TheBronx/shurscript/raw/parser/plugins/bootbox.js
// @require         https://github.com/TheBronx/shurscript/raw/parser/plugins/Markdown.Converter.js
// @require         https://github.com/TheBronx/shurscript/raw/parser/plugins/bootstrap-tokenfield.min.js
// @require         https://github.com/TheBronx/shurscript/raw/parser/core.js
// @require         https://github.com/TheBronx/shurscript/raw/parser/components/eventbus.js
// @require         https://github.com/TheBronx/shurscript/raw/parser/components/sync.js
// @require         https://github.com/TheBronx/shurscript/raw/parser/components/shurbar.js
// @require         https://github.com/TheBronx/shurscript/raw/parser/components/modulemanager.js
// @require         https://github.com/TheBronx/shurscript/raw/parser/components/topbar.js
// @require         https://github.com/TheBronx/shurscript/raw/parser/components/templater.js
// @require         https://github.com/TheBronx/shurscript/raw/parser/components/autoupdater.js
// @require         https://github.com/TheBronx/shurscript/raw/parser/components/preferences.js
// @require         https://github.com/TheBronx/shurscript/raw/parser/components/parser.js
// @require         https://github.com/TheBronx/shurscript/raw/parser/modules/Quotes.js
// @require         https://github.com/TheBronx/shurscript/raw/parser/modules/FilterThreads.js
// @require         https://github.com/TheBronx/shurscript/raw/parser/modules/BetterPosts.js
// @require         https://github.com/TheBronx/shurscript/raw/parser/modules/Scrollers.js
// @require         https://github.com/TheBronx/shurscript/raw/parser/modules/NestedQuotes.js
// @require         https://github.com/TheBronx/shurscript/raw/parser/modules/BottomNavigation.js
// @require         https://github.com/TheBronx/shurscript/raw/parser/modules/RefreshSearch.js
// @require         https://github.com/TheBronx/shurscript/raw/parser/modules/HighlightOP.js
// @require         https://github.com/TheBronx/shurscript/raw/parser/modules/ImageUploader.js
// @resource        bootstrapcss https://github.com/TheBronx/shurscript/raw/parser/css/bootstrap.css
// @resource        modalcss https://github.com/TheBronx/shurscript/raw/parser/css/modal.css
// @resource        shurbarcss https://github.com/TheBronx/shurscript/raw/parser/css/shurbar.css
// @resource        modalhtml https://github.com/TheBronx/shurscript/raw/parser/html/modal.html
// @resource        quotehtml https://github.com/TheBronx/shurscript/raw/parser/html/quote.html
// @resource        imageuploadercss https://github.com/TheBronx/shurscript/raw/parser/css/imageuploader.css
// @resource        imageuploaderhtml https://github.com/TheBronx/shurscript/raw/parser/html/imageuploader.html
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

