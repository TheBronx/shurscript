// Shur Scripts SA
// GPLv2 Licensed
// http://www.gnu.org/licenses/gpl-2.0.html
//
// ==UserScript==
// @name			ShurScript
// @description		Script para ForoCoches
// @namespace		http://shurscript.es
// @version			0.04
// @author			TheBronx
// @author			xusoO
// @include			*forocoches.com/foro/*
// @require			http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js
// @grant	GM_log
// @grant	GM_getValue
// @grant	GM_setValue
// @grant	GM_xmlhttpRequest
// @grant	GM_registerMenuCommand
// @grant	GM_addStyle
// @history 0.00 first version.
// ==/UserScript==

/* ESTILOS NOTIFICACIONES */
GM_addStyle(".notifications {cursor: pointer; text-align: center; padding: 7px 15px; width: 35px; background: #CECECE; color: gray; font-size: 24pt;}");
GM_addStyle(".notifications.unread {background: #CC3300; color: white;}");
GM_addStyle(".notifications sup {font-size: 10px;}");

/**
 * Página actual (sin http://forocoches.com/foro ni parámetros php)
 */
var page;
var username;
var currentStatus = "QUERY"; //QUERY - Obteniendo datos, OK - Datos obtenidos, ERROR - Error al obtener los datos
var notificationsUrl;
var interval = 1 * 60 * 1000; //1 minuto
var lastUpdate;
var lastReadQuote;

jQuery(document).ready(function(){
	if (window.top != window) { // [xusoO] Evitar que se ejecute dentro de los iframes
		return;
	}
	initialize();
	run();
});

function initialize() {
	//inicializamos variables
	page = location.pathname.replace("/foro","");
	username = jQuery("a[href*='member.php']").first().text();
	//variables para notificaciones
	notificationsUrl = "http://www.forocoches.com/foro/search.php?do=process&query=" + escape(username) + "&titleonly=0&showposts=1";
	lastUpdate  = GM_getValue("FC_LAST_QUOTES_UPDATE");
	lastReadQuote = GM_getValue("FC_LAST_READ_QUOTE");
}

function run() {
	showNotifications();
	if (page=="/showthread.php" || page=="/newreply.php") {
		//copiamos navegación a la parte inferior del foro
		bradcrumbToBot();
	}
}

/**
 * Copiamos la tabla con la navegación en la parte inferior del foro
 */
function bradcrumbToBot() {
	jQuery('#threadrating_menu').after( '<table width="100%" cellspacing="1" cellpadding="5" border="0" align="center" class="tborder navigation-bot">'+
		jQuery('.page>div>table').html()+'</table>' );
}

/**
 * Mostramos el contador de notificaciones
 */
function showNotifications() {
	//creamos la celda de notificaciones
	jQuery(".page table td.alt2[nowrap]").first().parent().append('<td style="padding: 0px;" class="alt2"><div class="notifications">0</div></td>');
	jQuery('.notifications').click(function() {
		GM_setValue("FC_LAST_READ_QUOTE", lastReadQuote);

	    if (jQuery(this).text() == "0" || currentStatus == "ERROR") {
	        updateNotifications();
	    } else if (jQuery(this).text() == "1") {
		    window.open(lastReadQuote, "_blank");
		    setNotificationsCount(0);
	        GM_setValue("FC_LAST_QUOTES_COUNT", 0);
	    } else if (currentStatus == "OK") {
	        window.open(notificationsUrl, "_blank");
	        setNotificationsCount(0);
	        GM_setValue("FC_LAST_QUOTES_COUNT", 0);
	    }
	});

	//comprobamos (si procede) nuevas notificaciones
	if (!lastUpdate || Date.now() - parseFloat(lastUpdate) > interval) {
		//Han pasado más de 1 minuto, volvemos a actualizar
	    updateNotifications();
	} else {
		//Hace menos de 1 minutos desde la ultima actualización, 
		//usamos el último numero de citas no leídas guardado
	    var lastCount = GM_getValue("FC_LAST_QUOTES_COUNT");
	    setNotificationsCount(lastCount || 0);
	    currentStatus = "OK";
	}
}

function updateNotifications() {
	jQuery('.notifications').html("...");
    currentStatus = "QUERY";
    GM_xmlhttpRequest({
      method: "GET",
      url: notificationsUrl,
      headers: {
        "User-Agent": "Mozilla/5.0"
      },
      onload: function(response) {
    
        if (response.readyState != 4 && response.statusText != "OK") { //Ha ocurrido algun error
            currentStatus = "ERROR";
            setNotificationsCount("X");
            return;
        }
        
        var documentResponse = jQuery.parseHTML(response.responseText);
        var citas = jQuery(documentResponse).find("table > tbody > tr:nth-child(2) > td > div:nth-child(5) > div > em > a");
        if (citas.length == 0) {

            var tooManyQueriesError = jQuery(documentResponse).find(".page li").text();
            //Hemos recibido un error debido a demasidas peticiones seguidas. Esperamos el tiempo que nos diga ilitri y volvemos a lanzar la query.
            if (tooManyQueriesError) {
                tooManyQueriesError = tooManyQueriesError.substring(tooManyQueriesError.indexOf("aún") + 4);
                var secondsToWait = tooManyQueriesError.substring(0, tooManyQueriesError.indexOf(" "));
                var remainingSeconds = parseInt(secondsToWait) + 1;
                interval = setInterval(function() {
                    if (remainingSeconds > 0)
                        setNotificationsCount("...<sup>" + (remainingSeconds--) + "</sup>");
                    else {                    
                        updateNotifications();
                        clearInterval(interval);
                    }
                }
                , 1000);
                return;
            }
        }        
            
            
            
        var count = 0;
        if (lastReadQuote) { //Contamos las citas no leídas hasta la última que tenemos guardada
            for (i = 0; i < citas.length; i++) { 
                if (lastReadQuote == citas[i].href) {
                    break;
                } else {
                    count++;
                }
            }
        } else if (citas.length > 0) { //Si todavia no tenemos datos, el contador de citas es 0
            GM_setValue("FC_LAST_READ_QUOTE", citas[0].href);
        }
        
        lastReadQuote = citas[0].href;
    
        setNotificationsCount(count);

        GM_setValue("FC_LAST_QUOTES_UPDATE", Date.now().toString());
        GM_setValue("FC_LAST_QUOTES_COUNT", count);
        
        currentStatus = "OK";
        
      }
    });
}

function setNotificationsCount(count) {
    notificationsDiv = jQuery(".notifications");
    if (count > 0) {
        notificationsDiv.addClass("unread");
    } else {
        notificationsDiv.removeClass("unread");
    }
    notificationsDiv.html(count);
}





/* ACTUALIZADOR AUTOMÁTICO */
// The following code (updated 07/24/13) is released under public domain.
// Usage guide: https://userscripts.org/guides/45

(function() {
    var id = 175463,
      hours = 1,
      name = typeof GM_info === 'object' ? GM_info.script.name : 'ShurScript',
      version = typeof GM_info === 'object' ? GM_info.script.version : '0.02',
      time = new Date().getTime();
    function call(response, secure) {
        GM_xmlhttpRequest({
            method: 'GET',
            url: 'http'+(secure ? 's' : '')+'://userscripts.org/scripts/source/'+id+'.meta.js',
            onload: function(xpr) {compare(xpr, response);},
            onerror: function(xpr) {if (secure) call(response, false);}
        });
    }
    function enable() {
        GM_registerMenuCommand('Activar actualizaciones automáticas del '+name, function() {
            GM_setValue('updated_175463', new Date().getTime()+'');
            call(true, true)
        });
    }
    function compareVersion(r_version, l_version) {
        var r_parts = r_version.split('.'),
          l_parts = l_version.split('.'),
          r_len = r_parts.length,
          l_len = l_parts.length,
          r = l = 0;
        for(var i = 0, len = (r_len > l_len ? r_len : l_len); i < len && r == l; ++i) {
            r = +(r_parts[i] || '0');
            l = +(l_parts[i] || '0');
        }
        return (r !== l) ? r > l : false;
    }
    function compare(xpr,response) {
        var xversion=/\/\/\s*@version\s+(.+)\s*\n/i.exec(xpr.responseText);
        var xname=/\/\/\s*@name\s+(.+)\s*\n/i.exec(xpr.responseText);
        if ( (xversion) && (xname[1] == name) ) {
            xversion = xversion[1];
            xname = xname[1];
        } else {
            if ( (xpr.responseText.match('the page you requested doesn\'t exist')) || (xname[1] != name) )
            GM_setValue('updated_175463', 'off');
            return false;
        }
        var updated = compareVersion(xversion, version);
        if ( updated && confirm('Hay disponible una nueva versión del '+xname+'.\n¿Quieres instalarla?') ) {
            try {
                location.href = 'http://userscripts.org/scripts/source/'+id+'.user.js';
            } catch(e) {}
        } else if ( xversion && updated ) {
            if(confirm('¿Quieres desactivar las actualizaciones automáticas de este script?')) {
                GM_setValue('updated_175463', 'off');
                enable();
                alert('Puedes volver a activarlas desde el submenú User Script Commands.');
            }
        } else if (response)
            alert('No hay actualizaciones disponibles del '+name);
    }
    function check() {
        if (GM_getValue('updated_175463', 0) == 'off')
            enable();
        else {
            if (+time > (+GM_getValue('updated_175463', 0) + 1000*60*60*hours)) {
                GM_setValue('updated_175463', time+'');
                call(false, true);
            }
            GM_registerMenuCommand('Comprobar actualizaciones del '+name, function() {
                GM_setValue('updated_175463', new Date().getTime()+'');
                call(true, true);
            });
        }
    }
    if (typeof GM_xmlhttpRequest !== 'undefined' &&
        (typeof GM_info === 'object' ? // has a built-in updater?
         GM_info.scriptWillUpdate === false : true))
        try {
            if (unsafeWindow.frameElement === null) check();
        } catch(e) {
            check();
        }
})();


