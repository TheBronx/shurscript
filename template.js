// Shur Scripts SA
// GPLv2 Licensed
// http://www.gnu.org/licenses/gpl-2.0.html
//
// ==UserScript==
// @name            ShurScript
// @description     Script para ForoCoches
// @namespace       http://shurscript.es
// @version         0.20.1-exp
// @author          TheBronx
// @author          xusoO
// @author          Fritanga
// @author          juno / ikaros45
// @include         *forocoches.com*
// @grant           GM_xmlhttpRequest
// @grant           GM_registerMenuCommand
// @grant           GM_addStyle
// @grant           GM_getResourceText
// @grant           GM_getResourceURL
// @grant           GM_getMetadata
// @run-at          document-end
// @require         http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min.js
// @require         http://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js
// ==/UserScript==

{init.js}
{tools/system.js}
{tools/persistence.js}

var pers = SH.persist.getInstance('test');

try {
    pers.synchronize();
} catch (e) {
    console.log(e);
}
