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
// @require         https://github.com/TheBronx/shurscript/raw/notifications/plugins/bootbox.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/plugins/Markdown.Converter.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/plugins/bootstrap-tokenfield.min.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/plugins/icheck.min.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/core.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/components/eventbus.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/components/sync.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/components/shurbar.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/components/modulemanager.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/components/topbar.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/components/templater.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/components/autoupdater.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/components/preferences.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/components/parser.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/components/notifications.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/modules/Quotes.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/modules/FilterThreads.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/modules/BetterPosts.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/modules/Scrollers.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/modules/NestedQuotes.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/modules/BottomNavigation.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/modules/RefreshSearch.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/modules/HighlightOP.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/modules/ImageUploader.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/modules/ThreadUpdater.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/modules/AutoIcons.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/modules/PrivateMode.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/modules/Integrations.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/modules/Reader.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/modules/AutoSpoiler.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/modules/History.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/modules/ImageGallery.js
// @require         https://github.com/TheBronx/shurscript/raw/notifications/modules/Announces.js
// @resource        bootstrapcss https://github.com/TheBronx/shurscript/raw/notifications/css/bootstrap.css
// @resource        modalcss https://github.com/TheBronx/shurscript/raw/notifications/css/modal.css
// @resource        shurbarcss https://github.com/TheBronx/shurscript/raw/notifications/css/shurbar.css
// @resource        modalhtml https://github.com/TheBronx/shurscript/raw/notifications/html/modal.html
// @resource        quotehtml https://github.com/TheBronx/shurscript/raw/notifications/html/quote.html
// @resource        imageuploadercss https://github.com/TheBronx/shurscript/raw/notifications/css/imageuploader.css
// @resource        imageuploaderhtml https://github.com/TheBronx/shurscript/raw/notifications/html/imageuploader.html
// @resource        autoiconscss https://github.com/TheBronx/shurscript/raw/notifications/css/autoicons.css
// @resource        readercss https://github.com/TheBronx/shurscript/raw/notifications/css/reader.css
// @resource        readerhtml https://github.com/TheBronx/shurscript/raw/notifications/html/reader.html
// @resource        historycss https://github.com/TheBronx/shurscript/raw/notifications/css/history.css
// @resource        historyhtml https://github.com/TheBronx/shurscript/raw/notifications/html/history.html
// @resource        gallerycss https://github.com/TheBronx/shurscript/raw/notifications/css/gallery.css
// @resource        notificationscss https://github.com/TheBronx/shurscript/raw/notifications/css/notifications.css
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
