// Shur Scripts SA
// GPLv2 Licensed
// http://www.gnu.org/licenses/gpl-2.0.html
//
// ==UserScript==
// @name  		ShurScript
// @description		Script para ForoCoches
// @namespace		http://shurscript.es
// @version			0.00
// @author			TheBronx
// @author			TheBronx
// @author			TheBronx
// @include			*forocoches.com/foro/*
// @require			http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js
// @grant	GM_log
// @grant	GM_getValue
// @grant	GM_setValue
// @grant	GM_xmlhttpRequest
// @grant	GM_registerMenuCommand
// @history 0.00 first version.
// ==/UserScript==

/**
 * Página actual (sin http://forocoches.com/foro/ ni parámetros php)
 */
var page;

jQuery(document).ready(function(){
	initialize();
	run();
});

function initialize() {
	//inicializamos variables
	page = location.pathname.replace("/foro/","");
}

function run() {
	if (page=="showthread.php") {
		//copiamos navegación a la parte inferior del foro
		bradcrumbToBot();
	}
}

/**
 * Copiamos la tabla con la navegación en la parte inferior del foro
 */
function bradcrumbToBot() {
	jQuery('#threadrating_menu').after( '<table width="100%" cellspacing="1" cellpadding="5" border="0" align="center" class="tborder">'+
		jQuery('.page>div>table').html()+'</table>' );
}
