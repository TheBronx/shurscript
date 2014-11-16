// Shur Scripts SA
// GPLv2 Licensed
// http://www.gnu.org/licenses/gpl-2.0.html
//
// ==UserScript==
// @name            ShurScript
// @description     Script para ForoCoches
// @namespace       http://shurscript.es
// @version         0.25.0-exp
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
// @require         https://github.com/TheBronx/shurscript/raw/experimental/plugins/bootbox.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/plugins/Markdown.Converter.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/plugins/bootstrap-tokenfield.min.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/plugins/icheck.min.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/core.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/components/eventbus.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/components/sync.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/components/shurbar.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/components/modulemanager.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/components/topbar.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/components/templater.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/components/autoupdater.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/components/preferences.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/components/parser.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/Quotes.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/FilterThreads.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/BetterPosts.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/Scrollers.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/NestedQuotes.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/BottomNavigation.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/RefreshSearch.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/HighlightOP.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/ImageUploader.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/ThreadUpdater.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/AutoIcons.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/PrivateMode.js
// @require         https://github.com/TheBronx/shurscript/raw/experimental/modules/Integrations.js
// @resource        bootstrapcss https://github.com/TheBronx/shurscript/raw/experimental/css/bootstrap.css
// @resource        modalcss https://github.com/TheBronx/shurscript/raw/experimental/css/modal.css
// @resource        shurbarcss https://github.com/TheBronx/shurscript/raw/experimental/css/shurbar.css
// @resource        modalhtml https://github.com/TheBronx/shurscript/raw/experimental/html/modal.html
// @resource        quotehtml https://github.com/TheBronx/shurscript/raw/experimental/html/quote.html
// @resource        imageuploadercss https://github.com/TheBronx/shurscript/raw/experimental/css/imageuploader.css
// @resource        imageuploaderhtml https://github.com/TheBronx/shurscript/raw/experimental/html/imageuploader.html
// @resource        autoiconscss https://github.com/TheBronx/shurscript/raw/experimental/css/autoicons.css
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

