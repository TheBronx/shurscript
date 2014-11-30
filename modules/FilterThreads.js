(function ($, createModule, undefined) {
	'use strict';

	var mod = createModule({
		id: 'FilterThreads',
		name: 'Filtrado de hilos',
		author: 'xusoO',
		version: '0.2',
		description: 'Añade varias opciones a la lista de hilos de un subforo: Marcar hilos como favoritos, resaltarlos, u ocultar los temas que no te interesen. Ya sea de forma manual o automática mediante palabras clave.',
		domain: ['/forumdisplay.php', '/showthread.php', '/search.php'],
		initialPreferences: {
			enabled: true, // Esta es opcional - por defecto true
			hideReadThreads: false,
			hiddenUsers: '',
			hiddenKeywords: '',
			hiddenKeywordsIsRegex: false,
			highlightUsers: '',
			highlightKeywords: '',
			highlightKeywordsIsRegex: false,
			highlightColor: '#FAF7DD',
			highlightBorderOnly: false,
			favoritesColor: '#D5E6EE',
			favoritesBorderOnly: false,
		}
	});

	var Favorites = function (favorites) {
		var _this = this;
		this.favs = [];

		this.isFavorite = function (thread) {
			var threadId;
			if (typeof thread === 'number') {
				threadId = thread; //ya es un ID
			} else if (thread.id !== undefined) {
				threadId = thread.id; //es un objeto, sacamos ID
			} else {
				return false;
			}
			//buscamos en el array de favs aquel que tenga ID = threadId
			for (var i = 0; i < _this.favs.length; i++) {
				if (_this.favs[i].id == threadId) {
					return true;
				}
			}
			return false;
		};

		this.add = function (thread) {
			var fav = {};
			if (typeof thread === 'number') {
				fav.id = thread;
			} else {
				fav = thread;
			}
			_this.favs.push(fav);
		};

		this.remove = function (thread) {
			var threadId;
			if (typeof thread === 'number') {
				threadId = thread; //ya es un ID
			} else if (thread.id !== undefined) {
				threadId = thread.id; //es un objeto, sacamos ID
			}
			//borramos del array de favs aquel que tenga ID = threadId
			for (var i = 0; i < _this.favs.length; i++) {
				if (_this.favs[i].id == threadId) {
					_this.favs.splice(i, 1);
					break;
				}
			}
		};

		this.update = function (fav) {
			for (var i = 0; i < _this.favs.length; i++) {
				if (_this.favs[i].id == fav.id) {
					_this.favs[i] = fav;
				}
			}
		};

		this.getSections = function () {
			var sections = [];
			for (var i = 0; i < _this.favs.length; i++) {
				if (_this.favs[i].section != undefined) {
					var found = false;
					for (var j = 0; j < sections.length; j++) {
						if (_this.favs[i].section.id == sections[j].id) {
							found = true;
							break;
						}
					}
					if (!found)
						sections.push(_this.favs[i].section);
				}
			}
			return sections;
		};

		this.populateAndSave = function (fav, callback) {
			$.ajax({
				url: "/foro/showthread.php?t=" + fav.id,
				dataType: 'text'
			}).done(function (result) {
				var title = $(result).find('div.page td.thead span.cmega').html();
				title = title.replace("<!-- google_ad_section_start -->", "");
				title = title.replace("<!-- google_ad_section_end -->", "");

				var author = $(result).find('.bigusername').first().html();

				var section = $(result).find('.navbar').last().find('a').html();
				var sectionId = $(result).find('.navbar').last().find('a').attr('href').replace('forumdisplay.php?f=', '');

				fav.title = title;
				fav.author = author;
				fav.section = {
					'name': section,
					'id': sectionId,
				};
				//guardamos
				_this.update(fav);
				saveFavorites();
				if (callback != undefined)
					callback(fav);
			});
		};

		this.getFavHTML = function (fav) {
			var html = '<tr id="shurscript-fav-' + fav.id + '">' +
				'<td style="vertical-align:middle;"><a id="' + fav.id + '" style="cursor:pointer;"><img src="' + SHURSCRIPT.config.imagesURL + 'trash-black.png" style="width:16px;height:16px;" /></a></td>' +
				'<td><a href="{link}">{title}</a> <a href="{link}&goto=newpost" class="lastpost-tooltip" data-placement="bottom" data-toggle="tooltip" title="Ir al último mensaje leído">»</a></td>' +
				'<td style="text-align:center;vertical-align:middle;"><span class="badge" style="font-size:10px;">{author}</span></td></tr>';
			if (fav.hasOwnProperty('title'))
				html = html.replace("{title}", fav.title);
			else
				html = html.replace("{title}", "Cargando datos del hilo...");

			if (fav.hasOwnProperty('author'))
				html = html.replace("{author}", fav.author);
			else
				html = html.replace("{author}", "---");

			html = html.replace(/\{link\}/g, '/foro/showthread.php?t=' + fav.id);
			return html;
		};

		this.getSectionHTML = function (section) {
			var sectionTable = '<table class="table table-striped table-bordered" style="margin-bottom: 0;"><th></th><th style="text-align:center;font-size:12px;">Hilo</th><th style="text-align:center;font-size:12px;">Autor</th></table>';

			var sectionHTML = $('<div class="panel panel-default" id="shurscript-favs-section-' + section.id + '">' +
				'<div class="panel-heading"><h4 class="panel-title"><a data-toggle="collapse" data-parent="#accordion" href="#collapse-' + section.id + '">' + section.name + '</a></h4></div>' +
				'<div id="collapse-' + section.id + '" class="panel-collapse collapse">' +
				'<div class="panel-body">' + sectionTable + '</div>' +
				'</div>' +
				'</div>');

			return sectionHTML;
		};

		//init favs array
		if (favorites.favs !== undefined) {
			_this.favs = favorites.favs; //objeto favs
		} else {
			for (var i = 0; i < favorites.length; i++) {
				this.add(favorites[i]); //lista de ids de hilos (sistema antiguo)
			}
		}
	};

	var threads = [];
	var favorites;
	var readThreads = [];
	var hiddenThreads = [];
	var hiddenThreadsCount = 0;
	var hiddenThreadsBlock;
	var hideReadThreadsButton;
	var regexHiddenKeywords, regexHiddenUsers, regexHighlightKeywords, regexHighlightUsers;

	/**
	 * Método temporal de migración de valores
	 */
	mod.migrateValues = function (callback) {
		mod.helper.setValue("FAVORITES", mod.helper.getLocalValue("FAVORITES"), function () {
			mod.helper.setValue("HIDDEN_THREADS", mod.helper.getLocalValue("HIDDEN_THREADS"), callback);
		});
	};

	/**
	 * Activamos modo de carga normal (aunque viene activo por defecto)
	 * aqui se podrian hacer comprobaciones adicionales. No es nuestro caso
	 */
	mod.normalStartCheck = function () {
		return true;
	};

	/**
	 * Sobreescribimos la funcion de ejecucion
	 */
	mod.onNormalStart = function () {
		loadStyles();

		favorites = new Favorites(JSON.parse(mod.helper.getValue("FAVORITES", '[]')));

		if (mod.helper.environment.page == "/forumdisplay.php" || mod.helper.environment.page == "/search.php") {
			onForumDisplay();
		} else if (mod.helper.environment.page == "/showthread.php") {
			onShowThread();
		}

		SHURSCRIPT.eventbus.on('parseThread', parseThread);
	};

	mod.getPreferenceOptions = function () {
		// Para no repetir la ristra 15 veces, hacemos una referencia
		var createPref = mod.helper.createPreferenceOption;
		var f1 = function () {
			importBuddyList();
		};
		var f2 = function () {
			importIgnoreList();
		};
		
		if (typeof exportFunction === 'function') {// Firefox 31+
			exportFunction(f1, unsafeWindow, {defineAs: 'FilterThreads_importBuddyList'});
			exportFunction(f2, unsafeWindow, {defineAs: 'FilterThreads_importIgnoreList'});
		} else {
			unsafeWindow.FilterThreads_importBuddyList = f1;
			unsafeWindow.FilterThreads_importIgnoreList = f2;
		}
		
		return [
			createPref({type: 'header', caption: 'Ocultar hilos', subCaption: 'Puedes ocultar hilos de forma automática, ya sea mediante una lista negra de usuarios o por palabras clave en el título de los temas:'}),
			createPref({type: 'checkbox', mapsTo: 'hideReadThreads', caption: 'Mostrar solo hilos no leídos.', subCaption: '<span style="color:gray;">De cualquier modo aparecerá un botón para ocultarlos o mostrarlos. Esta opción solo cambia el comportamiento por defecto.</span>'}),
			createPref({type: 'tags', mapsTo: 'hiddenUsers', caption: 'Ignorar hilos por usuario <b>(separados por comas)</b>', buttons: true, plain: true, button1: '<a href="#" onclick="FilterThreads_importIgnoreList(); return false;" class="btn btn-xs btn-default">Importar de la lista de ignorados</a>'}),
			createPref({type: 'text', mapsTo: 'hiddenKeywords', caption: 'Ignorar hilos por palabras clave <b>(separadas por comas)</b>'}),
			//createPref({type: 'checkbox', mapsTo: 'hiddenKeywordsIsRegex', caption: '<b>Avanzado:</b> Usar expresión regular en las palabras clave'}),
			createPref({type: 'header', caption: 'Resaltar hilos', subCaption: 'Los hilos que contengan cualquiera de estas palabras serán resaltados con los colores selccionados de entre el resto de hilos:'}),
			createPref({type: 'tags', mapsTo: 'highlightUsers', caption: 'Resaltar hilos por usuario <b>(separados por comas)</b>', buttons: true, plain: true, button1: '<a href="#" onclick="FilterThreads_importBuddyList(); return false;" class="btn btn-xs btn-default">Importar de la lista de contactos</a>'}),
			createPref({type: 'text', mapsTo: 'highlightKeywords', caption: 'Resaltar hilos por palabras clave <b>(separadas por comas)</b>'}),
			//createPref({type: 'checkbox', mapsTo: 'highlightKeywordsIsRegex', caption: '<b>Avanzado:</b> Usar expresión regular en las palabras clave'}),
			createPref({type: 'color', mapsTo: 'highlightColor', caption: 'Color', subCaption: 'El color de fondo para los hilos resaltados. Por defecto <span class="badge">' + mod.initialPreferences.highlightColor + '</span>'}),
			createPref({type: 'checkbox', mapsTo: 'highlightBorderOnly', caption: 'Aplicar color solo al borde izquierdo'}),
			createPref({type: 'header', caption: 'Hilos favoritos', subCaption: 'Mostrará un icono al lado de cada hilo para marcarlo como favorito. Los hilos favoritos destacarán entre los demás cuando el usuario entre a algún subforo:'}),
			createPref({type: 'color', mapsTo: 'favoritesColor', caption: 'Color', subCaption: 'Color de fondo", "El color de fondo para los hilos favoritos. Por defecto <span class="badge">' + mod.initialPreferences.favoritesColor + '</span>'}),
			createPref({type: 'checkbox', mapsTo: 'favoritesBorderOnly', caption: 'Aplicar color solo al borde izquierdo'}),
		];
	};

	mod.onShurbarClick = function () {
		if (favorites == undefined)
			favorites = new Favorites(JSON.parse(mod.helper.getValue("FAVORITES", '[]')));

		var modal = $('<div id="shurscript-favs" class="shurscript modal fade" tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true">' +
			'<div class="modal-dialog modal-favs"><div class="modal-content"><div class="modal-header">' +
			'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
			'<h4 class="modal-title" id="modalLabel">Hilos Favoritos</h4></div>' +
			'<div class="modal-body panel-group" id="accordion"></div></div></div></div>');
		$('body').append(modal);

		//para cada seccion hacemos una capa y metemos dentro la tabla
		var sections = favorites.getSections();
		sections.forEach(function (section) {
			modal.find('.modal-body').append(favorites.getSectionHTML(section));
		});

		try {
			var match = location.href.match(/forumdisplay\.php\?f\=(\d+)/i); //De la URL
			var currentSection = match && match[1];
			if (!currentSection) {
				currentSection = $(".fjsel").val(); //Del <select> para cambiar de subforo al final del hilo
			}

			var defaultSection = $("#shurscript-favs #shurscript-favs-section-" + currentSection + " .collapse");
			if (!defaultSection.length) {
				defaultSection = $("#shurscript-favs .collapse").first();
			}
			defaultSection.collapse('show');
		} catch (e) {
		}

		//para cada hilo favorito:
		// a) tenemos solo su ID -> ajax para sacar titulo, autor y seccion
		// b) tenemos todos sus datos
		//pintar sus datos o placeholders para cuando carguen
		var fav;
		for (var i = 0; i < favorites.favs.length; i++) {
			fav = favorites.favs[i];
			if (!('title' in fav) || !('section' in fav) || !('author' in fav)) {
				//nos faltan datos, populate
				favorites.populateAndSave(fav, mod.favPopulated);
				//y cuando esté completo ya lo meteremos donde toque
			} else {
				//metemos el hilo en su correspondiente seccion
				var $sectionTable = $('#shurscript-favs-section-' + fav.section.id + ' table');
				$sectionTable.append(favorites.getFavHTML(fav));
				//evento click al borrar hilo
				$sectionTable.find('#shurscript-fav-' + fav.id + ' a#' + fav.id).click(function () {
					var threadID = $(this).attr('id');
					bootbox.confirm("Por favor, confirme que desea eliminar este hilo de sus favoritos", function (res) {
						if (res) {
							bootbox.hideAll();
							mod.favRemove(threadID);
						}
					});
				});
			}
		}

		//Mostrar mensaje informativo si no tiene ningún favorito
		if (!favorites.favs.length) {
			modal.find('.modal-body').css('text-align', 'center');
			modal.find('.modal-body').html('<span style="color: gray; font-size: 14pt; display: inline-block; font-weight: 200; margin-bottom: 10px;">'
				+ 'Todav&iacute;a no has a&ntilde;adido ning&uacute;n hilo como favorito :('
				+ '</span><img src="' + SHURSCRIPT.config.imagesURL + 'howtofav.gif' + '">');
		}

		modal.on('hidden.bs.modal', function () {
			//Eliminar al cerrar
			modal.remove();
		});
		modal.find('.lastpost-tooltip').tooltip({delay: 300});
		modal.modal('show');

		modal.css('z-index', 1000);
		$('.modal-backdrop').css('z-index', 999);
	};

	mod.favPopulated = function (fav) {
		//mostramos sus datos en el desplegable si es que existe
		var modal = $('#shurscript-favs');
		if (modal.length > 0) { //modal still exists
			//puede que la seccion exista, o puede que no
			var $sectionElement = $('#shurscript-favs-section-' + fav.section.id);
			if ($sectionElement.length <= 0) {
				$sectionElement = $(favorites.getSectionHTML(fav.section));
				modal.find('.modal-body').append($sectionElement);
				modal.find('.lastpost-tooltip').tooltip({delay: 300});
			}

			//metemos el hilo en su seccion
			$sectionElement.find('table').append(favorites.getFavHTML(fav));
			//evento click al borrar hilo
			$sectionElement.find('#shurscript-fav-' + fav.id + ' a#' + fav.id).click(function () {
				var threadID = $(this).attr('id');
				bootbox.confirm("Por favor, confirme que desea eliminar este hilo de sus favoritos", function (res) {
					if (res) {
						bootbox.hideAll();
						mod.favRemove(threadID);
					}
				});
			});
		}
	};

	mod.favRemove = function (id) {
		id = parseInt(id); //importante, el favorites.remove no funciona igual con strings
		favorites.remove(id);
		saveFavorites();
		$('#shurscript-fav-' + id).remove();
	};

	mod.shurbarIcon = function () {
		return {
			name: 'Hilos favoritos',
			description: 'Ver la lista de todos tus hilos favoritos',
			image: SHURSCRIPT.config.imagesURL + 'star.png',
			actionType: 'popover',
			handler: mod.onShurbarClick
		};
	};

	function loadStyles() {
		if (mod.preferences.favoritesColor !== "") {
			if (mod.preferences.favoritesBorderOnly) {
				GM_addStyle(".favorite>td:nth-child(3) {border-left: 4px solid " + mod.preferences.favoritesColor + " !important}");
			} else {
				GM_addStyle(".favorite>td:nth-child(3) {background-color:" + mod.preferences.favoritesColor + " !important;}");
			}
		}
		GM_addStyle(".fav img {display:none;} .fav {cursor: pointer; background-repeat:no-repeat; background-position: center; background-image:url('" + SHURSCRIPT.config.imagesURL + 'fav.png' + "');min-width:20px;}");
		GM_addStyle(".shurmenu_trigger img, .shurmenu_opened img {display:none;} .shurmenu_trigger, .shurmenu_opened {cursor: pointer; background-repeat:no-repeat; background-position: center; background-image:url('" + SHURSCRIPT.config.imagesURL + 'roto2.gif' + "');min-width:20px;}");
		GM_addStyle(".not_fav img {display:none;} .not_fav {cursor: pointer; background-repeat:no-repeat; background-position: center; background-image:url('" + SHURSCRIPT.config.imagesURL + 'nofav.png' + "');min-width:20px;}");
		GM_addStyle(".shur_estrella {width:30px;vertical-align:middle;} .shur_estrella a {cursor: pointer; width:20px; height:20px; display:block; background-repeat:no-repeat; background-position: center; background-image:url('" + SHURSCRIPT.config.imagesURL + 'nofav.png' + "'); margin:0 auto;} .shur_estrella a.fav {background-image:url('" + SHURSCRIPT.config.imagesURL + 'fav.png' + "');}");

		if (mod.preferences.highlightColor !== "") {
			if (mod.preferences.highlightBorderOnly) {
				GM_addStyle(".highlighted>td:nth-child(3) {border-left: 4px solid " + mod.preferences.highlightColor + "}");
			} else {
				GM_addStyle(".highlighted>td:nth-child(3) {background-color:" + mod.preferences.highlightColor + ";}");
			}
		}

		GM_addStyle(".highlightKeyword {text-decoration: underline; color: black;}");

		GM_addStyle(".hiddenKeyword {text-decoration: line-through; color: black;}");
	}

	function onForumDisplay() {
		createHideReadThreadsButton();
		createQuickFilter();

		//Evento para cerrar todos los popups abiertos al hacer clic en cualquier sitio (body)
		$('body').click(function (e) {
			if (e.target.className.indexOf("popover") == -1 && $(".popover").length && !jQuery.contains($(".popover")[0], e.target)) { //No estamos dentro del popup abierto
				$(".shurmenu_opened").not(e.target.id != "" ? "#" + e.target.id : "").removeClass("shurmenu_opened");

				if (e.target.id.indexOf("statusicon") == -1) { //No estamos clicando en un icono del hilo (este ya tiene el manejador de abrir y cerrar el popup)
					$(".filter-threads.popover").remove();
				}
			}
		});

		//Recuperar los hilos ocultos manualmente
		hiddenThreads = JSON.parse(mod.helper.getValue("HIDDEN_THREADS", '[]'));

		initRegexs();
	}

	function parseThread(event, thread) {
		processThread(thread);

		thread.icon_td.popover({content: getThreadMenu(thread), container: 'body', placement: 'right', html: true, trigger: 'manual'});

		thread.icon_td.click(function (e) {
			$(".filter-threads.popover").remove();
			$(this).popover('show');
			$(this).data('bs.popover').$tip.addClass('filter-threads').find(".popover-content").html(getThreadMenu(thread)).css({height: '30px'});
			$(this).addClass("shurmenu_opened");
		});

		thread.icon_td.hover(
			function () {//mouse in
				$(this).addClass("shurmenu_trigger");
			},
			function () {//mouse out
				$(this).removeClass("shurmenu_trigger");
			}
		);

		threads.push(thread);
	}

	function onShowThread() {
		//estamos viendo un hilo, ¿que hilo es?
		//la pregunta tiene miga, ya que en la URL no tiene por qué venir el topic_id
		var href = $("#threadtools_menu form>table tr:last a").attr("href");
		if (href.indexOf("subscription") != -1) {
			var t_id = parseInt(href.replace("subscription.php?do=addsubscription&t=", ""), 10);
		} else {
			var t_id = parseInt(href.replace("poll.php?do=newpoll&t=", ""), 10);
		}
		//vale, ahora que sabemos que hilo es, ¿es favorito?
		var is_favorite = favorites.isFavorite(t_id);
		//agregamos la estrella junto a los botones de responder
		var estrella = '<td class="shur_estrella shurscript"><a href="#" class="' + (is_favorite ? 'fav' : '') + '" data-placement="top" data-toggle="tooltip"></a></td>';
		//boton de arriba
		$("#poststop").next().find("td.smallfont").first().before(estrella);
		//boton de abajo
		$("#posts").next().find("table td.smallfont").first().before(estrella);

		//eventos
		$(".shur_estrella a").tooltip({delay: 300, title: (is_favorite ? 'Desmarcar como favorito' : 'Marcar como favorito')});
		$(".shur_estrella a").each(function () {
			$(this).click(function () {
				if (is_favorite) {
					$(this).tooltip('destroy');
					$(this).tooltip({delay: 300, title: 'Marcar como favorito'});
					is_favorite = false;
					//borramos de favoritos
					favorites.remove(t_id);
					saveFavorites();
					//quitamos el class
					$(".shur_estrella a").each(function () {
						$(this).removeClass('fav')
					});
				} else {
					$(this).tooltip('destroy');
					$(this).tooltip({delay: 300, title: 'Desmarcar como favorito'});
					is_favorite = true;
					//agregamos a favoritos
					favorites.add(t_id);
					favorites.populateAndSave({'id': t_id});
					//agregamos el class
					$(".shur_estrella a").each(function () {
						$(this).addClass('fav')
					});
				}
				return false;
			});
		});
	}

	/* Aplicar funcionalidad al hilo en cuestion: marcarlo como favorito, ocultarlo, etc.*/
	function processThread(thread) {
		if (mod.helper.environment.page == "/search.php") { //En el buscador solo se activan los favoritos
			if (favorites.isFavorite(thread.id)) {
				thread.element.addClass("favorite");
				thread.isFavorite = true;
			}
		} else {
			var matchResult;

			if (hiddenThreads.indexOf(thread.id) >= 0) { //Si está oculto manualmente, prevalece sobretodo lo demas
				addToHiddenThreads(thread);
				thread.isHidden = true;
			} else if (favorites.isFavorite(thread.id)) { //Después, si es favorito
				thread.isFavorite = true;

				//Lo movemos al principio de la lista
				if ($(".favorite").not('.hiddenThread').length > 0) {
					$(".favorite").not('.hiddenThread').last().after(thread.element);
				} else if ($(".highlighted").not('.hiddenThread').length > 0) { //Tiene que estar por encima de los resaltados
					$(".highlighted").not('.hiddenThread').first().before(thread.element)
				} else {
					$("#threadslist > tbody[id^='threadbits_forum'] > tr").first().before(thread.element); //El primero de la lista
				}

				thread.element.addClass("favorite");
			} else if (regexHiddenUsers && (matchResult = matchKeywords(thread.author, regexHiddenUsers, "hiddenKeyword"))) { //Si esta abierto por algun usuario que tengamos en la lista negra
				addToHiddenThreads(thread);
				thread.isHidden = true;
				thread.isHiddenByUser = true;
				thread.author_span.html(matchResult);
			} else if (regexHiddenKeywords && (matchResult = matchKeywords(thread.title, regexHiddenKeywords, "hiddenKeyword"))) { //Si concuerda con alguna palabra clave para ocultarlo
				addToHiddenThreads(thread);
				thread.isHidden = true;
				thread.isHiddenByKeywords = true;
				thread.title = matchResult;
				thread.title_link.html(matchResult);
			}

			var matchUserResult;
			if (regexHighlightKeywords && (matchResult = matchKeywords(thread.title, regexHighlightKeywords, "highlightKeyword"))
				|| regexHighlightUsers && (matchUserResult = matchKeywords(thread.author, regexHighlightUsers, "highlightKeyword"))) { //Si hay que resaltarlo por conincidir con las palabras clave definidas por el usuario
				thread.isHighlighted = true;
				if (matchUserResult) {
					thread.author_span.html(matchUserResult);
				} else {
					thread.title_link.html(matchResult);
				}

				if (!thread.isHidden && !thread.isFavorite) { //Lo movemos al principio de la lista
					if ($(".highlighted").not('.hiddenThread').length > 0) {
						$(".highlighted").not('.hiddenThread').last().after(thread.element);
					} else if ($(".favorite").not('.hiddenThread').length > 0) { //Tiene que estar por debajo de los favoritos
						$(".favorite").not('.hiddenThread').last().after(thread.element)
					} else {
						$("#threadslist > tbody[id^='threadbits_forum'] > tr").first().before(thread.element); //El primero de la lista
					}
				}

				thread.element.addClass("highlighted");

				if (thread.isHiddenByKeywords) { //Avisar al usuario de que se ha ocultado un hilo que coincide con sus preferencias de resaltado
					hiddenThreadsBlock.find(".tcat").css("background", "#FBBD97");
				}
			}

			if (!thread.isHidden && thread.icon_td.find("img").attr("src").indexOf("new.gif") == -1) { //Hilo leído
				if (mod.preferences.hideReadThreads) {
					thread.element.css("display", "none");
				}
				readThreads.push(thread);
			}
		}
	}

	/* Lo añade al menu de hilos ocultos desde donde podra ser mostrado de nuevo */
	function addToHiddenThreads(hilo) {

		var hiddenThreadsList = $("#hiddenthreadslist");

		if (hiddenThreadsList.length == 0) {
			var threadsList = $("#threadslist");

			hiddenThreadsList = $('<table id="hiddenthreadslist" class="tborder" cellspacing="1" cellpadding="5" border="0" width="100%" align="center">');

			hiddenThreadsList.append(threadsList.find('tbody').first().clone()); //Añadimos el nombre de las columnas

			var threadsListHeader = threadsList.prev();
			var hiddenThreadsHeader = $('<table id="hiddenthreadsheader" class="tborder" cellspacing="1" cellpadding="5" border="0" width="100%" align="center" style="cursor: pointer;"><tr><td class="tcat" width="100%"><span style="background: url(\'' + SHURSCRIPT.config.imagesURL + 'trash-black.png\') no-repeat scroll 0% 0% transparent; height: 16px; display: inline-block; vertical-align: middle; width: 20px; margin-top: -2px;"></span><span id="numhiddenthreads">0</span> Hilo(s) oculto(s)</td></tr></table>');
			hiddenThreadsHeader.click(function () {
				hiddenThreadsList.parent().slideToggle();
			});

			threadsListHeader.before(hiddenThreadsList);
			hiddenThreadsList.before(hiddenThreadsHeader);

			hiddenThreadsList.wrap('<div id="hiddenthreadslistwrapper" style="overflow: hidden;"></div>'); //No podemos hacer la animacion de slide con una tabla, la hacemos sobre un div sin overflow
			hiddenThreadsList.parent().hide(); //La ocultamos por defecto
			$("#hiddenthreadsheader, #hiddenthreadslistwrapper").wrapAll('<div id="hiddenthreads" style="margin-bottom: 15px;"></div>');
			hiddenThreadsBlock = $("#hiddenthreads");

		}

		hilo.element.addClass('hiddenThread');

		hiddenThreadsList.append(hilo.element);
		hiddenThreadsCount++;

		if (hiddenThreadsCount == 1) {
			hiddenThreadsBlock.show();
		}

		hiddenThreadsBlock.find("#numhiddenthreads").html(hiddenThreadsCount);
	}

	/* Construye el menu que aparece al pulsar sobre el icono del hilo */
	function getThreadMenu(thread) {
		var menu = $("<div class='shurscript'/>");
		if (!thread.isHidden || thread.isHiddenByKeywords) { //No tiene sentido marcar un hilo oculto como favorito
			menu.append(getThreadMenuToggle(thread, 'Quitar favorito', 'Favorito', SHURSCRIPT.config.imagesURL + 'star.png', thread.isFavorite, function (e) {
				toggleFavorite(thread);
				thread.icon_td.removeClass('shurmenu_opened');
				$(".popover").remove();
			}));
		}
		if (mod.helper.environment.page != "/search.php") {
			menu.append(getThreadMenuToggle(thread, 'Mostrar de nuevo', 'Ocultar', SHURSCRIPT.config.imagesURL + 'trash.png', thread.isHidden && !thread.isHiddenByKeywords, function (e) {
				toggleHidden(thread);
				thread.icon_td.removeClass('shurmenu_opened');
				$(".popover").remove();
			}, 'btn-danger'));
		}
		return menu;
	}

	/* Marcar o desmarcar un hilo favorito */
	function toggleFavorite(hilo) {
		if (!hilo.isFavorite) {
			//lo agregamos a favoritos
			markAsFavorite(hilo)
		} else {
			//lo borramos de favoritos
			unmarkAsFavorite(hilo);
		}
	}

	/* Oculta o muestra un hilo */
	function toggleHidden(hilo) {
		if (!hilo.isHidden) {
			hilo.element.fadeOut({complete: function () {
				markAsHiddenThread(hilo);
				hilo.element.show(); //Despues del fadeOut, lo mostramos y ya aparecera en la seccion de hilos ocultos
			}});
		} else {
			hilo.element.fadeOut({complete: function () {
				unmarkAsHiddenThread(hilo);
				hilo.element.show(); //Despues del fadeOut, lo mostramos y ya aparecera en la seccion de hilos ocultos
			}});
		}
	}

	function markAsFavorite(hilo) {
		favorites.add(hilo.id);
		favorites.populateAndSave({'id': hilo.id});
		$(hilo.element).addClass("favorite");
		hilo.isFavorite = true;
	}

	function unmarkAsFavorite(hilo) {
		favorites.remove(hilo.id);
		$(hilo.element).removeClass("favorite");
		hilo.isFavorite = false;
		saveFavorites();
	}

	/* Oculta un hilo */
	function markAsHiddenThread(hilo) {
		hilo.isHidden = true;
		hiddenThreads.push(hilo.id);
		if (hilo.isFavorite || favorites.isFavorite(hilo.id)) { //Si era favorito
			unmarkAsFavorite(hilo); //Ya no lo es
		}
		addToHiddenThreads(hilo);
		saveHiddenThreads();
	}

	/* Vuelve a mostrar un hilo que estaba oculto */
	function unmarkAsHiddenThread(hilo) {
		removeElementFromArray(hilo.id, hiddenThreads);
		hilo.icon_td.removeClass('shurmenu_opened');
		hilo.isHidden = false;
		removeFromHiddenThreads(hilo);
		saveHiddenThreads();
	}

	/* Lo quitamos del menu de hilos ocultos y lo metemos de nuevo en el general */
	function removeFromHiddenThreads(hilo) {
		$("#threadslist > tbody[id^='threadbits_forum']").append(hilo.element);
		hiddenThreadsCount--;
		hiddenThreadsBlock.find("#numhiddenthreads").html(hiddenThreadsCount);
		if (hiddenThreadsCount == 0) {
			hiddenThreadsBlock.hide();
			hiddenThreadsBlock.find("#hiddenthreadslistwrapper").hide();
		}
	}

	function getThreadMenuToggle(hilo, title_on, title_off, icon, active, onclick, className) {
		var $button = $('<button type="button" data-toggle="button" style="margin: 0 5px; display: inline-block;" class="btn btn-sm ' + (className ? className : 'btn-default') + '"><span style="background: url(\'' + icon + '\') no-repeat scroll 0% 0% transparent; height: 16px; display: inline-block; vertical-align: middle; width: 20px; margin-top: -2px;"></span><span>' + (active ? title_on : title_off) + '</span></button>');
		$button.click(function () {
			var title;
			if ($(this).hasClass("active")) {
				title = title_off;
			} else {
				title = title_on;
			}
			$(this).find("span")[0].style.backgroundImage = icon;
			$(this).find("span")[1].innerHTML = title;
		});
		if (active) {
			$button.addClass("active");
		}
		$button.click(onclick);
		return $button;
	}

	/* Funcionalidad de ocultar hilos ya leídos */
	function createHideReadThreadsButton() {
		var forumToolsButton = $("#stickies_collapse").length ? $("#stickies_collapse") : $("#forumtools");
		var hideReadThreadsLink = $('<a rel="nofollow">' + (mod.preferences.hideReadThreads ? "Mostrar todos los hilos" : "Mostrar solo los hilos no leídos") + '</a>');
		hideReadThreadsButton = $('<td class="vbmenu_control" nowrap="nowrap" style="cursor: pointer;"></td>');
		hideReadThreadsButton.append(hideReadThreadsLink);
		hideReadThreadsButton.click(function () {
			mod.preferences.hideReadThreads = !mod.preferences.hideReadThreads;
			if (mod.preferences.hideReadThreads) {
				$.each(readThreads, function (index, hilo) {
					hilo.hideRead = true;
					hilo.element.css("display", "none");
				});
				hideReadThreadsLink.html("Mostrar todos los hilos");
			} else {
				$.each(readThreads, function (index, hilo) {
					hilo.hideRead = false;
					hilo.element.css("display", "table-row");
				});
				hideReadThreadsLink.html("Mostrar solo los hilos no leídos");
			}
			mod.storePreferences();
		});
		forumToolsButton.before(hideReadThreadsButton);
	}

	function createQuickFilter() {
		var quickFilter = $("<input name='quickFilter' placeholder='Filtro rápido...'/>");
		var quickFilterWrapper = $("<td class='tcat' style='padding:0px 4px;'/>");
		quickFilterWrapper.append(quickFilter);

		if (mod.helper.environment.page == "/search.php") {
			$("#threadslist .tcat span").last().append(quickFilterWrapper);
		} else {
			hideReadThreadsButton.before(quickFilterWrapper);
		}

		var delayer;
		var filterFunction = function () {
			if (quickFilter.val() == "" || quickFilter.val().length <= 2) {
				threads.forEach(function (hilo) {
					if (!hilo.hideRead) { //Si estaba oculto antes de filtrar por estar leído (es el único tipo de ocultación que tiene un display:none;)
						hilo.element.css("display", "table-row");
					}
					hilo.title_link.html(hilo.title);
				});
			} else {
				var regex = getRegex(quickFilter.val(), false, false);
				threads.forEach(function (hilo) {
					if (hilo.isHidden) {
						return;
					}

					var matchResult;
					if (!hilo.hideRead && (matchResult = matchKeywords(hilo.title, regex, "highlightKeyword"))) { //Si hay que resaltarlo por conincidir con las palabras clave definidas por el usuario
						hilo.title_link.html(matchResult);
						hilo.element.css("display", "table-row");
					} else {
						hilo.title_link.html(hilo.title);
						hilo.element.css("display", "none");
					}
				});
			}
		};

		quickFilter.keydown(function (event) {
			if (event.which == 27) { //Escape
				setTimeout(function () {
					quickFilter.val("");
					quickFilter.trigger("input");
				}, 1); //No sé porqué pero si no se hace en un timer no se vacía :roto2:
			} else if (event.which == 13) { //Enter
				event.preventDefault(); //Evita que se haga el submit de un formulario que tiene por encima
			}

		});

		quickFilter.on("input", function () {
			clearTimeout(delayer);
			delayer = setTimeout(filterFunction, 200);
		});
	}

	/* Comprueba si un texto coincide con unas palabras clave concretas. Devuelve el texto con las palabras resaltadas en negrita */
	function matchKeywords(text, regexKeywords, className) {
		var match = false;
		var matches = regexKeywords && regexKeywords.exec(text);
		var highlighted = text;

		while (matches != null && matches[0] != "") {
			highlighted = highlighted.replace(matches[0].trim(), "<span class='" + className + "'>" + matches[0].trim() + "</span>");
			text = text.substring(matches.index + matches[0].length);
			matches = regexKeywords.exec(text);
			match = true;
		}

		return match && highlighted;
	}

	/* Crear todas las expresiones regulares segun el input del usuario */
	function initRegexs() {
		//Crear regex de hilos ocultos
		if (mod.preferences.hiddenKeywords) {
			try {
				regexHiddenKeywords = getRegex(mod.preferences.hiddenKeywords, mod.preferences.hiddenKeywordsIsRegex);
			} catch (e) {
				regexHiddenKeywords = null;
				bootbox.alert("Ha ocurrido un error. Revisa la expresión regular que has introducido para ocultar hilos.");
			}
		}

		//Crear regex de hilos ocultos por usuario
		if (mod.preferences.hiddenUsers) {
			try {
				regexHiddenUsers = getRegex(mod.preferences.hiddenUsers, false);
			} catch (e) {
				regexHiddenUsers = null;
				bootbox.alert("Ha ocurrido un error. Revisa la expresión regular que has introducido para ocultar hilos por usuario.");
			}
		}

		//Crear regex para resaltar hilos
		if (mod.preferences.highlightKeywords) {
			try {
				regexHighlightKeywords = getRegex(mod.preferences.highlightKeywords, mod.preferences.highlightKeywordsIsRegex);
			} catch (e) {
				regexHighlightKeywords = null;
				bootbox.alert("Ha ocurrido un error. Revisa la expresión regular que has introducido para resaltar hilos.");
			}
		}

		//Crear regex para resaltar hilos
		if (mod.preferences.highlightUsers) {
			try {
				regexHighlightUsers = getRegex(mod.preferences.highlightUsers, false);
			} catch (e) {
				regexHighlightUsers = null;
				bootbox.alert("Ha ocurrido un error. Revisa la expresión regular que has introducido para resaltar hilos por usuario.");
			}
		}
	}

	/* Construye la expresion regular a partir de una lista de palabras */
	function getRegex(userInput, isRegex, wholeWords) {
		var regex;
		if (isRegex) {
			regex = new RegExp(userInput, "i");
		} else {
			userInput = userInput.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"); //Escapar caracteres reservador de las regex
			userInput = userInput.replace(/[\ ]*[\,]+[\ ]*$/, ""); //Quitar comas sobrantes
			if (typeof wholeWords == "undefined" || wholeWords) {
				regex = "(\\b|\\ )"; //word-break
			} else {
				regex = "";
			}

			regex += "(" + userInput
				.replace(/[aáà]/ig, "[aáà]")
				.replace(/[eéè]/ig, "[eéè]")
				.replace(/[iíï]/ig, "[iíï]") //Accents insensitive
				.replace(/[oóò]/ig, "[oóò]")
				.replace(/[uúü]/ig, "[uúü]")
				.replace(/[\ ]*[\,]+[\ ]*/g, "|") + ")"; //Reemplazar las comas por |

			if (typeof wholeWords == "undefined" || wholeWords) {
				regex += "(\\b|\\ )"; //word-break
			}

			regex = new RegExp(regex, "i");
		}

		return regex;
	}

	function saveFavorites() {
		mod.helper.setValue("FAVORITES", JSON.stringify(favorites));
	}

	function saveHiddenThreads() {
		mod.helper.setValue("HIDDEN_THREADS", JSON.stringify(hiddenThreads));
	}

	function removeElementFromArray(element, array) {
		var index = array.indexOf(element);
		if (index > -1) {
			array.splice(index, 1);
		}
	}

	function importBuddyList() {
		var xmlhttp = new XMLHttpRequest();

		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
				var html = xmlhttp.responseText;
				var parser = new DOMParser();
				var doc = parser.parseFromString(html, "text/html");

				var elems = doc.getElementById("buddylist").getElementsByTagName("a");
				var contacts = [];

				for (var i = 0, n = elems.length; i < n; i++) {
					contacts.push(elems[i].textContent);
				}
				
				var newContactsList = contacts.join(', ');
				var oldContactsList = $("input[data-maps-to='highlightUsers']").tokenfield('getTokensList', ',');

				if (contacts.length > 0) { // Si se han obtenido contactos de la importación
					if (oldContactsList) { // hay algo ya definido en el campo
						if (newContactsList !== oldContactsList) { // y la lista es diferente
							bootbox.confirm("<p>La lista actual se sobreescribirá con el nuevo listado que se obtenga de tu " +
									"<a href='/foro/profile.php?do=buddylist' target='_blank'>lista de contactos</a>.</p>" +
									"<p>¿Desea continuar?</p>",
								function (result) {
									if (result) {
										$("input[data-maps-to='highlightUsers']").tokenfield('setTokens', newContactsList); // sobreescribe con la nueva lista
									}
								}
							);
						} else { // y la lista es igual a la anterior
							bootbox.alert("No hemos detectado cambios en tu <a href='/foro/profile.php?do=buddylist' target='_blank'>lista de contactos</a> " +
								"desde la última importación. Realiza cambios en tus contactos antes de volver a intentarlo.");
						}
					} else {					
						$("input[data-maps-to='highlightUsers']").tokenfield('setTokens', newContactsList);
					}
				} else { // en caso contrario, avisa al usuario de que no existen contactos
					bootbox.alert("Tu <a href='/foro/profile.php?do=buddylist' target='_blank'>lista de contactos</a> está vacía. " +
						"Para resaltar los mensajes de tus contactos... ¡primero añade algunos!");
				}
			}
		};

		xmlhttp.open("GET", "/foro/profile.php?do=buddylist&nojs=1", true);
		xmlhttp.send();
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
					var oldIgnoredList = $("input[data-maps-to='hiddenUsers']").tokenfield('getTokensList', ',');

					if (ignoredUsers.length > 0) { // Si se han obtenido ignorados de la importación
						if (oldIgnoredList) { // hay algo ya definido en el campo
							if (newIgnoredList !== oldIgnoredList) { // y la lista es diferente
								bootbox.confirm("<p>La lista actual se sobreescribirá con el nuevo listado que se obtenga de tu " +
										"<a href='/foro/profile.php?do=ignorelist' target='_blank'>lista de ignorados</a>.</p>" +
										"<p>¿Desea continuar?</p>",
									function (result) {
										if (result) {
											$("input[data-maps-to='hiddenUsers']").tokenfield('setTokens', newIgnoredList); // sobreescribe con la nueva lista
										}
									}
								);
							} else { // y la lista es igual a la anterior
								bootbox.alert("No hemos detectado cambios en tu <a href='/foro/profile.php?do=ignorelist' target='_blank'>lista de ignorados</a> " +
									"desde la última importación. Realiza cambios en tus ignorados antes de volver a intentarlo.");
							}
						} else {
							$("input[data-maps-to='hiddenUsers']").tokenfield('setTokens', newIgnoredList);
						}
					}
				} else { // en caso contrario, avisa al usuario de que no existen ignorados
					bootbox.alert("Tu <a href='/foro/profile.php?do=ignorelist' target='_blank'>lista de ignorados</a> está vacía. " +
						"Para ocultar los posts de tus usuarios ignorados... ¡primero ignora a alguien!");
				}
			}
		};

		xmlhttp.open("GET", "/foro/profile.php?do=ignorelist&nojs=1", true);
		xmlhttp.send();
	}
})(jQuery, SHURSCRIPT.moduleManager.createModule);
