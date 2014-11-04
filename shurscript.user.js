// Shur Scripts SA
// GPLv2 Licensed
// http://www.gnu.org/licenses/gpl-2.0.html
//
// ==UserScript==
// @name            ShurScript
// @description     Script para ForoCoches
// @namespace       http://shurscript.es
// @version         0.23-dev
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
// @require         https://github.com/TheBronx/shurscript/raw/dev/plugins/bootbox.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/plugins/Markdown.Converter.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/plugins/bootstrap-tokenfield.min.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/plugins/icheck.min.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/core.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/components/eventbus.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/components/sync.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/components/shurbar.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/components/modulemanager.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/components/topbar.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/components/templater.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/components/autoupdater.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/components/preferences.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/components/parser.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/modules/Quotes.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/modules/FilterThreads.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/modules/BetterPosts.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/modules/Scrollers.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/modules/NestedQuotes.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/modules/BottomNavigation.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/modules/RefreshSearch.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/modules/HighlightOP.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/modules/ImageUploader.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/modules/ThreadUpdater.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/modules/AutoIcons.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/modules/PrivateMode.js
// @require         https://github.com/TheBronx/shurscript/raw/dev/modules/Webm.js
// @resource        bootstrapcss https://github.com/TheBronx/shurscript/raw/dev/css/bootstrap.css
// @resource        modalcss https://github.com/TheBronx/shurscript/raw/dev/css/modal.css
// @resource        shurbarcss https://github.com/TheBronx/shurscript/raw/dev/css/shurbar.css
// @resource        modalhtml https://github.com/TheBronx/shurscript/raw/dev/html/modal.html
// @resource        quotehtml https://github.com/TheBronx/shurscript/raw/dev/html/quote.html
// @resource        imageuploadercss https://github.com/TheBronx/shurscript/raw/dev/css/imageuploader.css
// @resource        imageuploaderhtml https://github.com/TheBronx/shurscript/raw/dev/html/imageuploader.html
// @resource        autoiconscss https://github.com/TheBronx/shurscript/raw/dev/css/autoicons.css
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

