(function ($, createModule, undefined) {
	'use strict';

	var mod = createModule({
		id: 'Quotes',
		name: 'Notificador de citas y menciones',
		author: 'xusoO',
		version: '0.2',
		description: 'Avisará al usuario cada vez que alguien le cite en un post, mostrando alertas y un listado de las ultimas citas no leídas.',
		domain: 'ALL',
		initialPreferences: {
			enabled: true,
			showAlerts: true,
			mentionsToo: true,
			openInTabsButton: false,
			refreshEvery: 2,
			ignoredUsers: ''
		}
	});

	mod.getPreferenceOptions = function () {

		var creOpt = mod.helper.createPreferenceOption;

		unsafeWindow.chromeTabsWarning = function () {
			bootbox.alert("<p>Si al darle al botón de Abrir en pestañas solo os abre una pestaña y no todas, es porque tenéis bloqueados los pop-ups para Forocoches, tendréis que permitirselos para poder abrir las notificaciones en pestañas.</p>\
				<p>Pero eso no es todo, Google Chrome por norma general solo te abrirá el primer enlace en una nueva pestaña. El resto te los abrirá en ventanas independientes.</p>\
				<p>Cómo sabemos que esto puede ser molesto y no existe solución por nuestra parte, en el caso que de verdad quieras usar esta funcionalidad de abrir las notificaciones en pestañas, \
				deberás instalar <a target='_blank' href='https://chrome.google.com/webstore/detail/one-window/papnlnnbddhckngcblfljaelgceffobn/related'>esta extensión</a> que aunque no es una solución muy limpia, hace su función.</p>\
				<p>Para evitar confusiones, decir que esto no tiene nada que ver con abrir una única notificación en una nueva pestaña, eso funciona perfectamente. El problema descrito solo aplica cuando se abre más de una a la vez.</p> <p>Disculpa las molestias</p>");
		};

		var f = function () {
			importIgnoreList();
		};
		if (typeof exportFunction === 'function') {// Firefox 31+
			exportFunction(f, unsafeWindow, {defineAs: 'Quotes_importIgnoreList'});
		} else {
			unsafeWindow.Quotes_importIgnoreList = f;
		}

		return [

			creOpt({type: 'checkbox', mapsTo: 'showAlerts', caption: 'Mostrar una alerta en el navegador cada vez que llegue una nueva notificación'}),
			creOpt({type: 'checkbox', mapsTo: 'mentionsToo', caption: 'Notificarme también cuando alguien me mencione en un hilo, no solo cuando me citen', subCaption: '<br/>Desmarca esta opci&oacute;n si tienes problemas con tu nick o te llegan citas que no deber&iacute;an llegarte'}),

			creOpt({type: 'checkbox', mapsTo: 'openInTabsButton', caption: "Mostrar botón en la lista de notificaciones para abrir las no leídas en pestañas. <b style='text-decoration:underline;' onclick='chromeTabsWarning()'>Leer usuarios de Chrome</b>"}),

			creOpt({
				type: 'radio',
				elements: [
					{value: 2, caption: 'Cada 2 minutos'},
					{value: 10, caption: 'Cada 10 minutos'},
					{value: 30, caption: 'Cada 30 minutos'},
					{value: 'off', caption: 'Manualmente', subCaption: 'Haciendo clic en el contador de notificaciones'}
				],
				caption: 'Buscar citas:',
				mapsTo: 'refreshEvery'
			}),

			creOpt({type: 'tags', mapsTo: 'ignoredUsers', caption: 'No mostrar citas de los siguientes usuarios <b>(separados por comas)</b>', buttons: true, plain: true, button1: '<a href="#" onclick="Quotes_importIgnoreList(); return false;" class="btn btn-xs btn-default">Importar de la lista de ignorados</a>'}),
		];
	};

	/* Estilos propios del módulo */
	GM_addStyle(".notifications {cursor: pointer; text-align: center; padding: 3px 0px; width: 70px; background: #CECECE; color: gray; font-size: 24pt;}");
	GM_addStyle(".notifications.unread {background: #CC3300; color: white;}");
	GM_addStyle(".notifications.unread:hover {background: #E64D1A; color: white;}");
	GM_addStyle(".notifications sup {font-size: 10px;}");
	GM_addStyle("#notificationsBox {background: #FFF;border: 1px solid #C30;position: absolute;display: none;box-shadow: 0 2px 4px -2px;right: 11px;font:10pt verdana,geneva,lucida,'lucida grande',arial,helvetica,sans-serif}");
	GM_addStyle("#notificationsBox #notificationsList{overflow: auto;max-height: 380px;min-height: 83px;width: 340px;}");
	GM_addStyle("#notificationsBox:after, #notificationsBox:before {bottom: 100%;border: solid transparent;content: ' ';height: 0;width: 0;position: absolute;pointer-events: none;}");
	GM_addStyle("#notificationsBox:after {border-color: rgba(255, 255, 255, 0);border-bottom-color: #fff;border-width: 10px;left: 92%;margin-left: -13px;}");
	GM_addStyle("#notificationsBox:before {border-color: rgba(204, 51, 0, 0);border-bottom-color: #CC3300;border-width: 11px;left: 92%;margin-left: -14px;}");
	GM_addStyle("#notificationsList a.postLink {font-weight: normal;}");
	GM_addStyle(".notificationRow {overflow: visible; padding: 6px; font-size: 9pt; color: #444;border-bottom:1px solid lightgray;}");
	GM_addStyle(".notificationRow > div {margin-top: 2px;}");
	GM_addStyle(".notificationRow.read {color: #AAA !important;}");
	GM_addStyle(".notificationRow.read a {color: #888 !important;}");
	GM_addStyle(".notificationRow:hover {background: #eee;}");
	GM_addStyle("#noNotificationsMessage {text-align: center; line-height: 83px; font-size: 12pt; color: #646464;}");
	GM_addStyle("#notificationsListButtons td {background: #CC3300;color: white;cursor: pointer;font-size: 10pt;height: 30px;line-height: 30px;text-align: center;border-right: 1px solid white;}");
	GM_addStyle("#notificationsListButtons td:last-child {border: none;}");
	GM_addStyle("#notificationsListButtons td:hover {background: #E64D1A;}");
	GM_addStyle("#notificationsListButtons {width: 100%;}");

	/* Estilos para la portada */
	GM_addStyle("#AutoNumber1.contenido .notifications {padding: 6px 0px;}");

	/* Variables globales del módulo */
	var currentStatus = "QUERY"; //QUERY - Obteniendo datos, OK - Datos obtenidos, ERROR - Error al obtener los datos
	var notificationsUrl;
	var refreshEvery;// = 1 * 60 * 1000; //1 minuto
	var ajax;

	var lastUpdate; //Ultima actualizacion - Config. guardada en el navegador
	var lastReadQuote;
	var lastQuotesJSON; //Lista de notificaciones no leidas en formato JSON - Config. guardada en el navegador

	var arrayQuotes;
	var notificationsCount;
	var notificationsBox;
	var notificationsList;
	var notificationsListButtons;

	var originalTitle;

	/**
	 * Método temporal de migración de valores
	 */
	mod.migrateValues = function (callback) {
		if (!mod.helper.getValue("LAST_QUOTES_UPDATE")) { //Al ser una segunda migración, no machacar los datos de los usuarios de la beta que ya habían migrado
			mod.helper.setValue("LAST_QUOTES_UPDATE", mod.helper.getLocalValue("LAST_QUOTES_UPDATE"), function () {
				mod.helper.setValue("LAST_READ_QUOTE", mod.helper.getLocalValue("LAST_READ_QUOTE"), function () {
					mod.helper.setValue("LAST_QUOTES", mod.helper.getLocalValue("LAST_QUOTES"), callback);
				});
			});
		} else {
			callback();
		}
	};

	mod.onNormalStart = function () {

		originalTitle = document.title; //Para cambiar el titulo de la pagina con el numero de notificaciones

		var username = mod.helper.environment.user.name;
		var encodedUsername = "";

		for (var i = 0; i < username.length; i++) {
			if (username.charCodeAt(i) > 255) {
				encodedUsername += "\\" + username.charCodeAt(i);
			} else {
				encodedUsername += username.charAt(i);
			}
		}

		notificationsUrl = "http://www.forocoches.com/foro/search.php?do=process&query=" + escape(encodedUsername) + "&titleonly=0&showposts=1";
		lastUpdate = mod.helper.getValue("LAST_QUOTES_UPDATE");
		lastReadQuote = mod.helper.getValue("LAST_READ_QUOTE");
		lastQuotesJSON = mod.helper.getValue("LAST_QUOTES");
		arrayQuotes = new Array();
		if (lastQuotesJSON) {
			arrayQuotes = JSON.parse(lastQuotesJSON);
		}

		refreshEvery = mod.preferences.refreshEvery;
		if (refreshEvery != 'off') {
			refreshEvery = parseInt(refreshEvery);
		}

		// Precarga la plantilla de las citas y la compila
		var tempName = 'quote',
			templateText = mod.helper.getResourceText('quotehtml');
		SHURSCRIPT.templater.storeTemplate(tempName, templateText);
		SHURSCRIPT.templater.compile(tempName);

		createNotificationsBox();
		showNotifications();

	};

	/**
	 * Mostramos el contador de notificaciones
	 */
	function showNotifications() {

		//creamos la celda de notificaciones
		if (mod.helper.environment.page === 'frontpage') { //Portada
			$("#AutoNumber1.contenido tr:first-child").append('<td style="padding: 0px;" rowspan=3 class="alt2"><div class="notifications">0</div></td>')
			GM_addStyle("#notificationsBox {right: 19px;}");
		} else {
			$(".page table td.alt2[nowrap]").first().parent().append('<td style="padding: 0px;" class="alt2"><div class="notifications">0</div></td>');
		}
		$('.notifications').click(function () {
			if (currentStatus == "ERROR" || (!lastUpdate || Date.now() - parseFloat(lastUpdate) > (60 * 1000))) { //La actualizacion manual hay que esperar un minuto minimo
				updateNotifications();
			}

			if (notificationsBox.is(':visible')) { // Si la caja está desplegada
				notificationsBox.hide(); // la cerramos
			} else {
				showNotificationsBox(); // Si no está desplegada, la mostramos
			}

		});

		//comprobamos (si procede) nuevas notificaciones
		if (refreshEvery != 'off' && mod.helper.environment.page != "/search.php" && (!lastUpdate || Date.now() - parseFloat(lastUpdate) > (refreshEvery * 60 * 1000))) {
			//Volvemos a actualizar
			updateNotifications(true);
		} else {
			//Usamos las ultimas citas guardadas
			populateNotificationsBox(arrayQuotes);
			// setNotificationsCount (arrayQuotes.length);

			currentStatus = "OK";
		}
	}

	function updateNotifications(firstLoad) {
		firstLoad = typeof firstLoad != 'undefined' ? firstLoad : false;

		$('.notifications').html("...");
		currentStatus = "QUERY";

		ajax = new XMLHttpRequest();
		ajax.onreadystatechange = function () {
			if (ajax.readyState == 4 && ajax.statusText == "OK") {
				try {
					lastUpdate = Date.now();

					var documentResponse = $.parseHTML(ajax.responseText);
					var citas = $(documentResponse).find("#inlinemodform table[id*='post']");

					if (citas.length == 0) {

						if (ajax.responseText.indexOf("debes estar registrado o identificado") != -1) {
							currentStatus = "ERROR";
							var notificationsDiv = $(".notifications");
							notificationsDiv.attr("title", "Ha ocurrido un error al cargar las notificaciones. Contacta con los desarrolladores en el hilo oficial del Shurscript (ForoCoches).");
							notificationsDiv.html("X");
							return;
						}

						var tooManyQueriesError = $(documentResponse).find(".page li").text();
						//Hemos recibido un error debido a demasidas peticiones seguidas. Esperamos el tiempo que nos diga ilitri y volvemos a lanzar la query.
						if (tooManyQueriesError && !firstLoad) {
							tooManyQueriesError = tooManyQueriesError.substring(tooManyQueriesError.indexOf("aún") + 4);
							var secondsToWait = tooManyQueriesError.substring(0, tooManyQueriesError.indexOf(" "));
							var remainingSeconds = parseInt(secondsToWait) + 1;
							var timer = setInterval(function () {
									if (remainingSeconds > 0)
										setNotificationsCount("...<sup>" + (remainingSeconds--) + "</sup>");
									else {
										updateNotifications();
										clearInterval(timer);
									}
								}
								, 1000);
							return;
						} else if (firstLoad && arrayQuotes.length > 0) {
							//Si en la primera carga falla, no dejamos esperando al usuario
							populateNotificationsBox(arrayQuotes);

							currentStatus = "OK";

							return;
						}

					}

					var newQuotes = new Array();
					var cita;

					if (lastReadQuote) { //Contamos las citas no leídas hasta la última que tenemos guardada
						if (isNaN(lastReadQuote)) { // Es el enlace completo, no es un numero (NaN). Compatibilidad hacia atrás.
							lastReadQuote = lastReadQuote.match(/#post([\d]*)/)[1];
						}
						lastReadQuote = parseInt(lastReadQuote);
						var ignorados = mod.preferences.ignoredUsers.split(/\s*,\s*/);
						for (var i = 0; i < citas.length; i++) {
							cita = new Cita(citas[i], false);
							if (lastReadQuote >= cita.postID) {
								break;
							} else if (ignorados.indexOf(cita.userName) === -1) {
								if (mod.preferences.mentionsToo || isQuote(cita)) {
									newQuotes.push(cita);
								}
							}
						}
					}

					if (citas.length > 0) {
						lastReadQuote = new Cita(citas[0]).postID;
						mod.helper.setValue("LAST_READ_QUOTE", lastReadQuote);
					}

					//Mergeamos las nuevas, las antiguas y hasta llegar a 10 citas, lo rellenamos con notificaciones ya leidas
					var unreadQuotes = [];
					var readQuotes = [];

					arrayQuotes = newQuotes.concat(arrayQuotes);
					for (var i = 0; i < arrayQuotes.length; i++) {
						if (!arrayQuotes[i].read) {
							unreadQuotes.push(arrayQuotes[i]);
						} else {
							readQuotes.push(arrayQuotes[i]);
						}
					}

					arrayQuotes = unreadQuotes.concat(readQuotes.slice(0, 10 - unreadQuotes.length)); //No leídas + Leidas hasta llegar a 10 citas maximo. Si hay 3 no leidas, se rellenaran con 7 leidas. Si hay 15 no leidas, se veran las 15 pero ninguna leída.

					lastQuotesJSON = JSON.stringify(arrayQuotes); //Formateamos a JSON para guardarlo
					mod.helper.setValue("LAST_QUOTES_UPDATE", Date.now().toString());
					mod.helper.setValue("LAST_QUOTES", lastQuotesJSON);

					populateNotificationsBox(arrayQuotes);

					currentStatus = "OK";

					//Mensajes de alerta para el usuario
					if (mod.preferences.showAlerts && firstLoad) {
						if (newQuotes.length == 1) {
							cita = newQuotes[0];
							bootbox.dialog({message: "El usuario <b>" + cita.userName + "</b> te ha citado en el hilo <b>" + cita.threadName + "</b><p><br></p><i>" + cita.postText + "</i><p><br></p>¿Quieres ver el post ahora?",
								buttons: [
									{
										label: "Ya leída",
										className: "btn-default",
										callback: function () {
											markAsRead(cita);
											populateNotificationsBox(arrayQuotes);
										}
									},
									{
										label: "Más tarde",
										className: "btn-default"
									},
									{
										label: "Abrir post",
										className: "btn-default",
										callback: function () {
											markAsRead(cita, function () {
												openQuote(cita, "_self");
											});
										}
									},
									{
										label: "En nueva ventana",
										className: "btn-primary",
										callback: function () {
											markAsRead(cita, function () {
												openQuote(cita, "_blank");
												populateNotificationsBox(arrayQuotes);
											});
										}
									}
								]
							});
						} else if (newQuotes.length > 1) {
							bootbox.dialog({message: "Tienes <b>" + newQuotes.length + " citas nuevas</b> en el foro ¿Quieres verlas ahora?",
								buttons: [
									{
										label: "Ya leídas",
										className: "btn-default",
										callback: function () {
											markAllAsRead();
										}
									},
									{
										label: "Más tarde",
										className: "btn-default"
									},
									{
										label: "Ver lista",
										className: "btn-default",
										callback: function () {
											$("html, body").animate({ scrollTop: 0 }, "slow");
											showNotificationsBox();
										}
									},
									{
										label: "Abrir todas en pestañas",
										className: "btn-primary",
										callback: function () {
											markAllAsRead(function () {
												newQuotes.forEach(function (cita) {
													openQuote(cita, "_blank");
												});
											});
										}
									}
								]
							});

						}
					}
				} catch (e) {
					mod.helper.throw(e);
				}
			}
		};

		ajax.open("GET", notificationsUrl, true);
		ajax.send();

	}

	function setNotificationsCount(count) {
		var notificationsDiv = $(".notifications");
		if (count > 0) {

			document.title = "(" + count + ") - " + originalTitle;

			notificationsDiv.attr("title", "Tienes " + count + " " + (count == 1 ? "notificación no leída" : "notificaciones no leídas"));
			notificationsDiv.addClass("unread");
		} else {

			document.title = originalTitle;

			notificationsDiv.attr("title", "No tienes ninguna notificación nueva");
			notificationsDiv.removeClass("unread");
		}
		notificationsCount = count;
		notificationsDiv.html(count);

	}

	function createNotificationsBox() {
		notificationsBox = $("<div id='notificationsBox'/>");
		notificationsList = $("<div id='notificationsList'/>");

		$(document.body).append(notificationsBox);
		notificationsBox.append(notificationsList);

		$(document).mouseup(function (e) {
			if (notificationsBox.css("display") == "block" && !notificationsBox.is(e.target) //No es nuestra caja
				&& !$('.notifications').is(e.target)
				&& notificationsBox.has(e.target).length === 0) { //Ni tampoco un hijo suyo
				notificationsBox.hide(); //Cerramos la caja
				e.stopImmediatePropagation();
				e.stopPropagation();
				e.preventDefault();
			}
		});

	}

	function showNotificationsBox() {
		notificationsBox.css("top", $(".notifications").offset().top + $(".notifications").outerHeight() + 6);
		notificationsBox.show();
	}

	function populateNotificationsBox(array) {
		notificationsList.html('<div id="noNotificationsMessage">No tienes ninguna notificación</div>'); //Vaciamos
		var count = 0;
		for (var i = 0; i < array.length; i++) {
			addToNotificationsBox(array[i]);
			if (!array[i].read) {
				count++;
			}
		}
		setNotificationsCount(count);

		if (!notificationsListButtons) {
			notificationsListButtons = $("<table id='notificationsListButtons' border='0' cellspacing='0'><tr></tr></table>");

			var markAsReadButton = $("<td title='Marcar todas las citas como leídas'/>");
			markAsReadButton.html("Marcar como leídas");
			markAsReadButton.click(function () {
				markAllAsRead();
			});
			notificationsListButtons.append(markAsReadButton);

			if (mod.preferences.openInTabsButton) {
				var openInTabsButton = $("<td title='Abrir todas las citas no leídas en diferentes pestañas'/>");
				openInTabsButton.html("Abrir en pestañas");
				openInTabsButton.click(function () {
					var unread = getUnreadQuotes();
					markAllAsRead(function () {
						unread.forEach(function (cita) {
							openQuote(cita, "_blank");
						});
					});
				});
				notificationsListButtons.append(openInTabsButton);
			}

			notificationsBox.append(notificationsListButtons);
		}

		if (count > 0) {
			notificationsListButtons.show();
		} else {
			notificationsListButtons.hide();
		}
	}

	function getUnreadQuotes() {
		var unread = [];
		arrayQuotes.forEach(function (cita) {
			if (!cita.read) {
				unread.push(cita);
			}
		});
		return unread;
	}

	function markAllAsRead(callback) {
		for (var i = 0; i < arrayQuotes.length; i++) {
			arrayQuotes[i].read = true;
		}

		populateNotificationsBox(arrayQuotes);
		lastQuotesJSON = JSON.stringify(arrayQuotes);
		mod.helper.setValue("LAST_QUOTES", lastQuotesJSON, callback);
		notificationsBox.hide();
	}
	
	var rows = {};

	function addToNotificationsBox(cita) {
		$("#noNotificationsMessage").hide();

		var fixUrl = function(url) {
			return url.indexOf('http') === 0 ? url : '/foro/' + url;
		};

		var ulink = fixUrl(cita.userLink);
		var tlink = fixUrl(cita.threadLink);
		var link = fixUrl(cita.postLink);
		var row = $(SHURSCRIPT.templater.fillOut('quote', {cita: cita, postLink: link, threadLink: tlink, userLink: ulink}));

		//Necesitamos esperar a que se marque como leída antes de abrir el link
		//No usamos click porque no ejecuta el evento con el botón central
		//TO-DO: Cuando las preferencias se guarden en local y no necesitemos esperar al callback del servidor, quitar todo este lio y usar el evento de click nativo
		row.on('mouseup', '.postLink', function (e) {
			if (e.which !== 3 && !cita.read) { //No es botón derecho y la cita no está leída
				markAsRead(cita, function () {
					if (e.which === 1 && !e.ctrlKey && !e.metaKey) { //Solo clic izquierdo. Si es el botón central o Ctrl o Command están pulsados se abrirá nativamente en nueva pestaña
						openQuote(cita, '_self');
					}
				});
			}
		});

		rows[cita.postID] = row;

		notificationsList.append(row);
	}

	function markAsRead(cita, callback) {

		cita.read = true;

		lastQuotesJSON = JSON.stringify(arrayQuotes);
		mod.helper.setValue("LAST_QUOTES", lastQuotesJSON, callback);

		setNotificationsCount(notificationsCount - 1);
		rows[cita.postID].addClass("read");
	}

	function openQuote(cita, target) {
		window.open(cita.postLink.indexOf('http') == 0 ? cita.postLink : '/foro/' + cita.postLink, target);
	}

	function Cita(el, read) {

		var postElement = $(el).find(".smallfont > em > a");
		this.postLink = postElement.attr("href");
		this.postText = postElement.text().replace(/</g, '&lt;');
		this.postID = this.postLink.match(/#post([\d]*)/)[1];

		var threadElement = $(el).find(".alt1 > div > a > strong");
		this.threadLink = threadElement.parent().attr("href");
		this.threadName = threadElement.text();

		var userElement = $(el).find(".smallfont > a");
		this.userLink = userElement.attr("href");
		this.userName = userElement.text();

		this.read = read;

	}

	//Llamada SINCRONA para parsear un post y detectar si es una cita real o solo una mención.
	function isQuote(cita) {
		var result = false;
		ajax = new XMLHttpRequest();
		ajax.onreadystatechange = function () {
			if (ajax.readyState == 4 && ajax.statusText == "OK") {
				var documentResponse = $.parseHTML(ajax.responseText);
				var postContent = $(documentResponse).find("#post_message_" + cita.postID).text();
				var usernameRegexReady = mod.helper.environment.user.name.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"); //Escapar caracteres reservados de las regex;
				if (postContent.match(RegExp("Originalmente Escrito por " + usernameRegexReady, "i"))) {
					result = true;
				}
			}
		};

		ajax.open("GET", cita.postLink, false);
		ajax.send();
		return result;
	}

	function importIgnoreList() {
		var xmlhttp = new XMLHttpRequest();
		
		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
				var html = xmlhttp.responseText;
				var parser = new DOMParser();
				var doc = parser.parseFromString(html, "text/html");

				var ignoreListElem = doc.getElementById("ignorelist"); // Si no hay nadie en ignorados este elemento no existe
				
				if (ignoreListElem) {
					var elems = ignoreListElem.getElementsByTagName("a");
					var ignoredUsers = [];

					for (var i = 0, n = elems.length; i < n; i++) {
						ignoredUsers.push(elems[i].textContent);
					}
					
					var newIgnoredList = ignoredUsers.join(', ');
					var oldIgnoredList = $("input[data-maps-to='ignoredUsers']").tokenfield('getTokensList', ',');

					if (ignoredUsers.length > 0) { // Si se han obtenido ignorados de la importación
						if (oldIgnoredList) { // hay algo ya definido en el campo
							if (newIgnoredList !== oldIgnoredList) { // y la lista es diferente
								bootbox.confirm("<p>La lista actual se sobreescribirá con el nuevo listado que se obtenga de tu " +
										"<a href='/foro/profile.php?do=ignorelist' target='_blank'>lista de ignorados</a>.</p>" +
										"<p>¿Desea continuar?</p>",
									function (result) {
										if (result) {
											$("input[data-maps-to='ignoredUsers']").tokenfield('setTokens', newIgnoredList); // sobreescribe con la nueva lista
										}
									}
								);
							} else { // y la lista es igual a la anterior
								bootbox.alert("No hemos detectado cambios en tu <a href='/foro/profile.php?do=ignorelist' target='_blank'>lista de ignorados</a> " +
									"desde la última importación. Realiza cambios en tus ignorados antes de volver a intentarlo.");
							}
						} else {
							$("input[data-maps-to='ignoredUsers']").tokenfield('setTokens', newIgnoredList);
						}
					}
				} else { // en caso contrario, avisa al usuario de que no existen ignorados
					bootbox.alert("Tu <a href='/foro/profile.php?do=ignorelist' target='_blank'>lista de ignorados</a> está vacía. " +
						"Para ocultar los posts de tus usuarios ignorados... ¡primero ignora a alguien!");
				}
			}
		};

		xmlhttp.open("GET", "/foro/profile.php?do=ignorelist", true);
		xmlhttp.send();
	}
})(jQuery, SHURSCRIPT.moduleManager.createModule);
