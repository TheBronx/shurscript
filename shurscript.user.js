// Shur Scripts SA
// GPLv2 Licensed
// http://www.gnu.org/licenses/gpl-2.0.html
//
// ==UserScript==
// @name            ShurScript
// @description     Script para ForoCoches
// @namespace       http://shurscript.es
// @version         0.24.0
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
// @require         https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min.js
// @require         https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js
// @require         https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.1.1/js/bootstrap.min.js
// @require         https://github.com/TheBronx/shurscript/raw/release/plugins/bootbox.js
// @require         https://github.com/TheBronx/shurscript/raw/release/plugins/Markdown.Converter.js
// @require         https://github.com/TheBronx/shurscript/raw/release/plugins/bootstrap-tokenfield.min.js
// @require         https://github.com/TheBronx/shurscript/raw/release/plugins/icheck.min.js
// @require         https://github.com/TheBronx/shurscript/raw/release/core.js
// @require         https://github.com/TheBronx/shurscript/raw/release/components/eventbus.js
// @require         https://github.com/TheBronx/shurscript/raw/release/components/sync.js
// @require         https://github.com/TheBronx/shurscript/raw/release/components/shurbar.js
// @require         https://github.com/TheBronx/shurscript/raw/release/components/modulemanager.js
// @require         https://github.com/TheBronx/shurscript/raw/release/components/topbar.js
// @require         https://github.com/TheBronx/shurscript/raw/release/components/templater.js
// @require         https://github.com/TheBronx/shurscript/raw/release/components/autoupdater.js
// @require         https://github.com/TheBronx/shurscript/raw/release/components/preferences.js
// @require         https://github.com/TheBronx/shurscript/raw/release/components/parser.js
// @require         https://github.com/TheBronx/shurscript/raw/release/modules/Quotes.js
// @require         https://github.com/TheBronx/shurscript/raw/release/modules/FilterThreads.js
// @require         https://github.com/TheBronx/shurscript/raw/release/modules/BetterPosts.js
// @require         https://github.com/TheBronx/shurscript/raw/release/modules/Scrollers.js
// @require         https://github.com/TheBronx/shurscript/raw/release/modules/NestedQuotes.js
// @require         https://github.com/TheBronx/shurscript/raw/release/modules/BottomNavigation.js
// @require         https://github.com/TheBronx/shurscript/raw/release/modules/RefreshSearch.js
// @require         https://github.com/TheBronx/shurscript/raw/release/modules/HighlightOP.js
// @require         https://github.com/TheBronx/shurscript/raw/release/modules/ImageUploader.js
// @require         https://github.com/TheBronx/shurscript/raw/release/modules/ThreadUpdater.js
// @require         https://github.com/TheBronx/shurscript/raw/release/modules/AutoIcons.js
// @require         https://github.com/TheBronx/shurscript/raw/release/modules/PrivateMode.js
// @require         https://github.com/TheBronx/shurscript/raw/release/modules/Webm.js
// @resource        bootstrapcss https://github.com/TheBronx/shurscript/raw/release/css/bootstrap.css
// @resource        modalcss https://github.com/TheBronx/shurscript/raw/release/css/modal.css
// @resource        shurbarcss https://github.com/TheBronx/shurscript/raw/release/css/shurbar.css
// @resource        modalhtml https://github.com/TheBronx/shurscript/raw/release/html/modal.html
// @resource        quotehtml https://github.com/TheBronx/shurscript/raw/release/html/quote.html
// @resource        imageuploadercss https://github.com/TheBronx/shurscript/raw/release/css/imageuploader.css
// @resource        imageuploaderhtml https://github.com/TheBronx/shurscript/raw/release/html/imageuploader.html
// @resource        autoiconscss https://github.com/TheBronx/shurscript/raw/release/css/autoicons.css
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

