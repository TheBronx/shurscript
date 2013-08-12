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
// @grant	GM_deleteValue
// @grant	GM_xmlhttpRequest
// @grant	GM_registerMenuCommand
// @grant	GM_addStyle
// @history 0.00 first version.
// ==/UserScript==

/* ESTILOS NOTIFICACIONES */
GM_addStyle(".notifications {cursor: pointer; text-align: center; padding: 7px 15px; width: 35px; background: #CECECE; color: gray; font-size: 24pt;}");
GM_addStyle(".notifications.unread {background: #CC3300; color: white;}");
GM_addStyle(".notifications sup {font-size: 10px;}");
GM_addStyle("#notificationsBox { background: white; border: 1px solid #CC3300; overflow: auto; position: absolute; width: 340px; display: none;max-height:400px; min-height:83px; box-shadow: 0 2px 4px -2px; right: 5px;}");
GM_addStyle(".notificationRow {height: 70px; overflow: visible; padding: 6px; font-size: 9pt; color: #444;border-bottom:1px solid lightgray;}");
GM_addStyle(".notificationRow > div {margin-top: 2px;}");
GM_addStyle(".notificationRow.read {color: #AAA !important;}");
GM_addStyle(".notificationRow.read a {color: #888 !important;}");
GM_addStyle(".notificationRow:hover {background: #eee;}");
GM_addStyle("#noNotificationsMessage {text-align: center; line-height: 83px; font-size: 12pt; color: #646464;}");
GM_addStyle("#markAllAsReadRow {background: #CC3300;color: white;cursor: pointer;font-size: 10pt;height: 30px;line-height: 27px;text-align: center;}");


/**
 * Página actual (sin http://forocoches.com/foro ni parámetros php)
 */
var page;
var username;
var userid;
var currentStatus = "QUERY"; //QUERY - Obteniendo datos, OK - Datos obtenidos, ERROR - Error al obtener los datos
var notificationsUrl;
var interval = 1 * 60 * 1000; //1 minuto

var lastUpdate; //Ultima actualizacion - Config. guardada en el navegador
var lastReadQuote;
var lastQuotesJSON; //Lista de notificaciones no leidas en formato JSON - Config. guardada en el navegador

var arrayQuotes;
var notificationsCount;
var notificationsBox;

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
	userid = jQuery("a[href*='member.php']").first().attr("href").replace("member.php?u=", "");
	//variables para notificaciones
	notificationsUrl = "http://www.forocoches.com/foro/search.php?do=process&query=" + escape(username) + "&titleonly=0&showposts=1";
	lastUpdate  = GM_getValue("FC_LAST_QUOTES_UPDATE_" + userid);
	lastReadQuote = GM_getValue("FC_LAST_READ_QUOTE_" + userid);
	lastQuotesJSON = GM_getValue("FC_LAST_QUOTES_" + userid);
	arrayQuotes = new Array();
	if (lastQuotesJSON) {
	    try {
		    arrayQuotes = JSON.parse(lastQuotesJSON);
	    } catch(e){
		    console.log("Error parsing JSON");
		    GM_deleteValue("FC_LAST_QUOTES_" + userid);
	    }
	}
}

function run() {
	createNotificationsBox();
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
		if (status == "ERROR" || (!lastUpdate || Date.now() - parseFloat(lastUpdate) > interval)) {
			updateNotifications();			
		}
		showNotificationsBox();
	});

	//comprobamos (si procede) nuevas notificaciones
	if (!lastUpdate || Date.now() - parseFloat(lastUpdate) > interval) {
		//Han pasado más de 1 minuto, volvemos a actualizar
	    updateNotifications(true);
	} else {
		//Hace menos de 1 minutos desde la ultima actualización, 
		//usamos las ultimas citas guardadas	    
	    populateNotificationsBox(arrayQuotes);
		setNotificationsCount(arrayQuotes.length);
	    
	    currentStatus = "OK";
	}
}

function updateNotifications(firstLoad) {
	firstLoad = typeof firstLoad !== 'undefined' ? firstLoad : false;
	
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
        
        lastUpdate = Date.now();
        
        var documentResponse = jQuery.parseHTML(response.responseText);
        var citas = jQuery(documentResponse).find("#inlinemodform table[id*='post']");
        if (citas.length == 0) {

            var tooManyQueriesError = jQuery(documentResponse).find(".page li").text();
            //Hemos recibido un error debido a demasidas peticiones seguidas. Esperamos el tiempo que nos diga ilitri y volvemos a lanzar la query.
            if (tooManyQueriesError && !firstLoad) {
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
            } else if (firstLoad && arrayQuotes.length > 0) {
	            //Si en la primera carga falla, no dejamos esperando al usuario
			    populateNotificationsBox(arrayQuotes);
				setNotificationsCount(arrayQuotes.length);
			    
			    currentStatus = "OK";

			    return;
            }
        }        
            
        newQuotes = new Array();
        if (lastReadQuote) { //Contamos las citas no leídas hasta la última que tenemos guardada
            for (i = 0; i < citas.length; i++) { 
            	cita = new Cita(citas[i]);
                if (lastReadQuote == cita.postLink) {
                    break;
                } else {
	                newQuotes.push(cita);
                }
            }
        }
 
        if (citas.length > 0) {
        	lastReadQuote = new Cita(citas[0]).postLink;
        	GM_setValue("FC_LAST_READ_QUOTE_" + userid, new Cita(citas[0]).postLink);
        }

        arrayQuotes = newQuotes.concat(arrayQuotes); //Mergeamos las nuevas y las antiguas
        
        populateNotificationsBox(arrayQuotes);
        
        lastQuotesJSON = JSON.stringify(arrayQuotes); //Formateamos a JSON para guardarlo
        
        count = arrayQuotes.length;
    
        setNotificationsCount(count);

        GM_setValue("FC_LAST_QUOTES_UPDATE_" + userid, Date.now().toString());
        GM_setValue("FC_LAST_QUOTES_" + userid, lastQuotesJSON);
    
        currentStatus = "OK";
        
        
        //Mensajes de alerta para el usuario
        if (firstLoad) {
	        if (newQuotes.length == 1) {
		        if (confirm("El usuario '" + cita.userName + " te ha citado en el hilo '" + cita.threadName + "'\n¿Quieres ver el post ahora?")) {
			        window.open(cita.postLink, "_self");
		        }
	        } else if (newQuotes.length > 1) {
		        if (confirm("Tienes " + newQuotes.length + " nuevas citas en el foro\n¿Quieres verlas ahora?")) {
		        	$("html, body").animate({ scrollTop: 0 }, "slow");
			        showNotificationsBox();
		        }
	        }
        }
        
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
    notificationsCount = count;
    notificationsDiv.html(count);
}

function createNotificationsBox() {
	notificationsBox = jQuery("<div id='notificationsBox'/>");

	$(document.body).append(notificationsBox);
	$(document).mouseup(function (e) {	
	    if (notificationsBox.css("display") == "block" && !notificationsBox.is(e.target) //No es nuestra caja
	        && notificationsBox.has(e.target).length === 0) { //Ni tampoco un hijo suyo
	        notificationsBox.hide(); //Cerramos la caja
	        e.stopImmediatePropagation();
	        e.stopPropagation();
	        e.preventDefault();
	    }
	});
	
	markAsReadButton = jQuery("<div class='notificationRow' id='markAllAsReadRow'/>");
	markAsReadButton.html("Marcar todas como leídas");
	notificationsBox.append(markAsReadButton);
	
}

function showNotificationsBox() {
	notificationsBox.css("top", jQuery(".notifications").offset().top + jQuery(".notifications").height() + 14);	
	notificationsBox.show();
}

function populateNotificationsBox(array) {
	notificationsBox.html('<div id="noNotificationsMessage">No tienes ninguna notificación</div>'); //Vaciamos
	for (i = 0; i < array.length; i++) {
		addToNotificationsBox(array[i]);
	}
	if (array.length > 0) {
		markAsReadButton = jQuery("<div id='markAllAsReadRow'/>");
		markAsReadButton.html("Marcar todas como leídas");
		markAsReadButton.click(function(){
			emptyArray = new Array();
			setNotificationsCount(0);
			populateNotificationsBox(emptyArray);
			lastQuotesJSON = JSON.stringify(emptyArray);
			GM_setValue("FC_LAST_QUOTES_" + userid, lastQuotesJSON);
/* 			updateNotifications(); */
		});
		notificationsBox.append(markAsReadButton);
	}
}

function addToNotificationsBox(cita) {
	jQuery("#noNotificationsMessage").hide();
	row = jQuery("<div class='notificationRow'><div><b>El usuario <a href='" + cita.userLink + "'>" + cita.userName + "</a> te ha citado</div><div><a href='" + cita.threadLink + "'>" + cita.threadName + "</a></b></div><div></div></div>");
	link = jQuery("<a href='" + cita.postLink + "' style='color:#444;'>" + cita.postText + "</a>");
	
	link.mousedown(function(e) { 
		if (e.which != 3) {
			setNotificationsCount(notificationsCount - 1);
			$(this).parent().parent().addClass("read");
			markAsRead(cita);
			$(this).off("mousedown");	
		}
	});

	link.appendTo(row.find("div").get(2));

	notificationsBox.append(row);
}

function markAsRead(cita) {
	
	var index = jQuery.inArray(cita, arrayQuotes);
	
	if (index != -1) {
		arrayQuotes.splice(index, 1);
		lastQuotesJSON = JSON.stringify(arrayQuotes);
    	GM_setValue("FC_LAST_QUOTES_" + userid, lastQuotesJSON);
    }
}


function Cita(el) {
	
	postElement = $(el).find(".smallfont > em > a");
	this.postLink = postElement.attr("href");
	this.postText = postElement.text();	
	
	threadElement = $(el).find(".alt1 > div > a > strong");
	this.threadLink = threadElement.parent().attr("href");
	this.threadName = threadElement.text();
	
	userElement = $(el).find(".smallfont > a");
	this.userLink = userElement.attr("href");
	this.userName = userElement.text();
	
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


