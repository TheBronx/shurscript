/*
Modulo Shurscript
@id: Citas
@name: Notificador de citas
@author: xusoo
@version: 0.2 
@description: Notifica cada vez que el usuario es citado, mostrando alertas y un listado de las ultimas citas no leídas.
*/

function Citas() {

		var helper = new ScriptHelper("Citas");
		
		/* Estilos propios del módulo */
		GM_addStyle(".notifications {cursor: pointer; text-align: center; padding: 7px 15px; width: 35px; background: #CECECE; color: gray; font-size: 24pt;}");
		GM_addStyle(".notifications.unread {background: #CC3300; color: white;}");
		GM_addStyle(".notifications sup {font-size: 10px;}");
		GM_addStyle("#notificationsBox { background: white; border: 1px solid #CC3300; overflow: auto; position: absolute; width: 340px; display: none;max-height: 400px; min-height:83px; box-shadow: 0 2px 4px -2px; right: 5px;}");
		GM_addStyle(".notificationRow {overflow: visible; padding: 6px; font-size: 9pt; color: #444;border-bottom:1px solid lightgray;}");
		GM_addStyle(".notificationRow > div {margin-top: 2px;}");
		GM_addStyle(".notificationRow.read {color: #AAA !important;}");
		GM_addStyle(".notificationRow.read a {color: #888 !important;}");
		GM_addStyle(".notificationRow:hover {background: #eee;}");
		GM_addStyle("#noNotificationsMessage {text-align: center; line-height: 83px; font-size: 12pt; color: #646464;}");
		GM_addStyle("#markAllAsReadRow {background: #CC3300;color: white;cursor: pointer;font-size: 10pt;height: 30px;line-height: 27px;text-align: center;}");
	
		/* Variables globales del módulo */	
		var currentStatus = "QUERY"; //QUERY - Obteniendo datos, OK - Datos obtenidos, ERROR - Error al obtener los datos
		var notificationsUrl;
		var interval = 1 * 60 * 1000; //1 minuto
		
		var lastUpdate; //Ultima actualizacion - Config. guardada en el navegador
		var lastReadQuote;
		var lastQuotesJSON; //Lista de notificaciones no leidas en formato JSON - Config. guardada en el navegador
		
		var arrayQuotes;
		var notificationsCount;
		var notificationsBox;
				
		Citas.prototype.load = function initialize() {
			
			encodedUsername = "";
			for (i = 0; i < username.length; i++) {
				if (username.charCodeAt(i) > 255) {
					encodedUsername += "\\" + username.charCodeAt(i);
				} else {
					encodedUsername += username.charAt(i);
				}
			}
	
			notificationsUrl = "search.php?do=process&query=" + escape(encodedUsername) + "&titleonly=0&showposts=1";
			lastUpdate  = helper.getValue("LAST_QUOTES_UPDATE");
			lastReadQuote = helper.getValue("LAST_READ_QUOTE");
			lastQuotesJSON = helper.getValue("LAST_QUOTES");
			arrayQuotes = new Array();
			if (lastQuotesJSON) {
			    try {
				    arrayQuotes = JSON.parse(lastQuotesJSON);
			    } catch(e){
				    console.log("Error parsing JSON");
				    helper.deleteValue("LAST_QUOTES");
			    }
			}
			
			
			createNotificationsBox();
			showNotifications();
					
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
		        var cita;
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
		        	helper.setValue("LAST_READ_QUOTE", lastReadQuote);
		        }
		
		        arrayQuotes = newQuotes.concat(arrayQuotes); //Mergeamos las nuevas y las antiguas
		        
		        populateNotificationsBox(arrayQuotes);
		        
		        lastQuotesJSON = JSON.stringify(arrayQuotes); //Formateamos a JSON para guardarlo
		        
		        count = arrayQuotes.length;
		    
		        setNotificationsCount(count);
		
		        helper.setValue("LAST_QUOTES_UPDATE", Date.now().toString());
		        helper.setValue("LAST_QUOTES", lastQuotesJSON);
		    
		        currentStatus = "OK";
		        
		        
		        //Mensajes de alerta para el usuario
		        if (firstLoad) {
			        if (newQuotes.length == 1) {
				        cita = newQuotes[0];
				        if (confirm("El usuario '" + cita.userName + " te ha citado en el hilo '" + cita.threadName + "'\n¿Quieres ver el post ahora?")) {
				        	markAsRead(cita);
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
					helper.setValue("LAST_QUOTES", lastQuotesJSON);
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
		    	helper.setValue("LAST_QUOTES", lastQuotesJSON);
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

	
}
