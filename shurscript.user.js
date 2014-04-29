// Shur Scripts SA
// GPLv2 Licensed
// http://www.gnu.org/licenses/gpl-2.0.html
//
// ==UserScript==
// @name            ShurScript
// @description     Script para ForoCoches
// @namespace       http://shurscript.es
// @version         0.20.6.1
// @author          TheBronx
// @author          xusO
// @author          Fritanga / Korrosivo
// @author          Juno / ikaros45
// @author          Electrosa
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
// @require         https://github.com/TheBronx/shurscript/raw/master/plugins/bootbox.js
// @require         https://github.com/TheBronx/shurscript/raw/master/plugins/Markdown.Converter.js
// @require         https://github.com/TheBronx/shurscript/raw/master/plugins/bootstrap-tokenfield.min.js
// @require         https://github.com/TheBronx/shurscript/raw/master/plugins/icheck.min.js
// @require         https://github.com/TheBronx/shurscript/raw/master/core.js
// @require         https://github.com/TheBronx/shurscript/raw/master/components/eventbus.js
// @require         https://github.com/TheBronx/shurscript/raw/master/components/sync.js
// @require         https://github.com/TheBronx/shurscript/raw/master/components/shurbar.js
// @require         https://github.com/TheBronx/shurscript/raw/master/components/modulemanager.js
// @require         https://github.com/TheBronx/shurscript/raw/master/components/topbar.js
// @require         https://github.com/TheBronx/shurscript/raw/master/components/templater.js
// @require         https://github.com/TheBronx/shurscript/raw/master/components/autoupdater.js
// @require         https://github.com/TheBronx/shurscript/raw/master/components/preferences.js
// @require         https://github.com/TheBronx/shurscript/raw/master/modules/Quotes.js
// @require         https://github.com/TheBronx/shurscript/raw/master/modules/FilterThreads.js
// @require         https://github.com/TheBronx/shurscript/raw/master/modules/BetterPosts.js
// @require         https://github.com/TheBronx/shurscript/raw/master/modules/Scrollers.js
// @require         https://github.com/TheBronx/shurscript/raw/master/modules/NestedQuotes.js
// @require         https://github.com/TheBronx/shurscript/raw/master/modules/BottomNavigation.js
// @require         https://github.com/TheBronx/shurscript/raw/master/modules/RefreshSearch.js
// @require         https://github.com/TheBronx/shurscript/raw/master/modules/HighlightOP.js
// @require         https://github.com/TheBronx/shurscript/raw/master/modules/ImageUploader.js
// @resource        bootstrapcss https://github.com/TheBronx/shurscript/raw/master/css/bootstrap.css
// @resource        modalcss https://github.com/TheBronx/shurscript/raw/master/css/modal.css
// @resource        shurbarcss https://github.com/TheBronx/shurscript/raw/master/css/shurbar.css
// @resource        modalhtml https://github.com/TheBronx/shurscript/raw/master/html/modal.html
// @resource        quotehtml https://github.com/TheBronx/shurscript/raw/master/html/quote.html
// @resource        imageuploadercss https://github.com/TheBronx/shurscript/raw/master/css/imageuploader.css
// @resource        imageuploaderhtml https://github.com/TheBronx/shurscript/raw/master/html/imageuploader.html
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

