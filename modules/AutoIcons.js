(function ($, createModule, undefined) {
	'use strict';

	var mod = createModule({
		id: 'AutoIcons',
		name: 'Iconos favoritos y autocompletado',
		author: 'xus0',
		version: '0.1',
		description: 'Muestra una caja con sugerencias de iconos de Forocoches al escribir ":" en la caja de respuesta.<br>'
			+ 'Y define tus iconos favoritos para tenerlos a golpe de click en la respuesta rápida.',
		domain: ['/showthread.php', '/newthread.php', '/newreply.php', '/editpost.php'],
		initialPreferences: {
			enabled: true,
			addFavouriteIcons: true,
			favouriteIcons: ":roto2:, :sisi3:, :mola:, :cantarin:, :qmeparto:, :nusenuse:, :facepalm:, "
				+ ":zpalomita, :zplatano2, :number1:, :elrisas:, :gaydude:, :sisi1:, :babeando:, :elboinas:, "
				+ ":qtedoy:, :abrazo:"
		}
	});

	mod.getPreferenceOptions = function () {
		return [
			mod.helper.createPreferenceOption({type: 'checkbox', mapsTo: 'addFavouriteIcons', caption: 'Añadir un listado debajo de la caja de respuesta rápida con los siguientes iconos:'}),
			mod.helper.createPreferenceOption({type: 'tags', mapsTo: 'favouriteIcons', subCaption: 'Deja el campo en blanco para usar los iconos por defecto.'})
		];
	};

	var $iconsBox, $iconsPanel;
	var active = false;
	var sortedIcons, //Array de iconos ordenador por uso
		iconsMap; //Objeto {iconName: icon} para acceso rapido por nombre
	var mostUsedIcons; //Objeto {icon: uses} que guarda los usos de cada icono

	mod.onNormalStart = function () {

		mod.helper.addStyle('autoiconscss');

		//Construimos el popup
		buildPopup();
		//Recuperamos todos los iconos del foro
		getAllIcons(function (sorted, map) {

			sortedIcons = sorted;
			iconsMap = map;

			//Comprobamos que el editor es WYSIWYG
			onWYSIWYGEnabled(function () {
				prepareEvents();
			});

			//Ademas del autocompletado, tambien añadimos una lista de los iconos favoritos del usuario
			if (mod.preferences.addFavouriteIcons) {
				addDefaultIcons();
			}

		});
	};

	/**
	 * Añade todos los eventos necesarios para el correcto funcionamiento del módulo
	 */
	function prepareEvents() {
		var delay;

		//Punto y coma abre y cierra el popup
		$(getEditor().editdoc.body).keypress(function (e) {
			if (e.which === KeyEvent.DOM_VK_COLON) {
				var currentFilter = getCurrentFilter();
				if (active && currentFilter) {
					var matchedIcon = iconsMap[currentFilter + ':'];
					if (matchedIcon) { //Al cerrar pulsando ':', introducimos la coincidencia exacta
						insertIcon(matchedIcon);
						e.preventDefault(); //No añadir el último ':'
					}
					hide();
				} else {
					active = true;
					e.preventDefault();
					//Metemos el ':' entre etiquetas para acotar el nodo actual del editor (no usamos <span> porque Chrome se los pasa por el forro)
					//Luego es más fácil recuperar la posición y el texto que ha escrito el usuario
					appendTextToEditor('<icon>:</icon>');

					//Retrasamos mostrar la caja si simplemente pulsamos ':' para evitar que aparezca sin querer
					delay = setTimeout(applyFilter, 1000);
				}
			}

		});

		//Controlar la acción de cada tecla
		$(getEditor().editdoc.body).keydown(function (e) {
			if (active) {
				clearTimeout(delay);
				manageKeyDown(e);
			}
		});

		//Cerramos el popup al pulsar fuera, al pulsar en la caja de texto y al redimensionar la ventana
		$('body').click(hide);
		$(getEditor().editdoc).click(hide);
		$(window).on('resize', hide);
	}

	function buildPopup() {
		$iconsBox = $('<div id="shurscript-icons-box" style="display: none;" class="popover top in"><div class="arrow"></div></div>');
		$iconsPanel = $('<div class="panel-body" tabindex="-1"></div>');
		$iconsPanel.on('click', '.icon', function () {
			//Al hacer click en un icono del popup, lo insertamos
			insertIcon($(this).data('icon'));
		});

		$iconsBox.append($iconsPanel);
		$('<div class="shurscript">').append($iconsBox).prependTo(getEditor().controlbar.parentNode);

		//Tooltip de ayuda
		var help = '<table><tr><td>Enter</td><td>Insertar</td></tr>'
			+ '<tr><td>Shift + Enter</td> <td>Insertar varios</td> </tr>'
			+ '<tr><td>Flechas/Tab</td> <td>Seleccionar</td> </tr>'
			+ '<tr><td>Esc</td> <td>Cerrar popup</td></tr></table>';
		var tooltip = $('<span id="shurscript-autoicons-tooltip-trigger" data-toggle="tooltip" data-placement="top">?</span>');
		tooltip.tooltip({title: help, html: true});
		$iconsBox.append(tooltip);
	}

	/**
	 * Llamara al callback cuando el editor sea WYSIWYG
	 */
	function onWYSIWYGEnabled(callback) {
		if (isWYSIWYG()) {
			callback();
		} else {
			SHURSCRIPT.eventbus.on('editorReady', function () {
				if (isWYSIWYG()) callback();
			});
		}
	}

	/**
	 * Oculta la caja de iconos y desactiva el filtrado
	 */
	function hide() {
		active = false;
		$iconsBox.hide();
		$iconsPanel.empty();
	}

	/**
	 * Activa el filtrado de iconos y muestra el popup en la posición correspondiente segun donde tengamos el cursor
	 */
	function show() {
		active = true;
		$iconsBox.show();
		var position = getCurrentCaretPosition();
		if (position) {
			var boxLeft = Math.min($(window).width() - $iconsBox.outerWidth(), position.absoluteLeft - $iconsBox.outerWidth() / 2 + 5); //Que no se salga por la derecha
			boxLeft = Math.max(0, boxLeft); //Que no se salga por la izquierda
			$iconsBox.css('marginTop', '0');
			$iconsBox.css('top', (position.absoluteTop - 90) + 'px');
			$iconsBox.css('left', boxLeft + 'px');
			$iconsBox.find('.arrow').show();
			$iconsBox.find('.arrow').css('left', ((position.absoluteLeft - boxLeft) + 5) + 'px');
		} else { //Fallback
			$iconsBox.css('top', 'auto');
			$iconsBox.css('left', 'auto');
			$iconsBox.css('marginTop', '-65px');
			$iconsBox.find('.arrow').hide();
		}

	}

	/**
	 * Devuelve el texto actual que ha introducido el usuario
	 */
	function getCurrentFilter() {
		var filter = getEditor().editwin.getSelection().anchorNode.nodeValue;
		return filter && filter.toLowerCase().trim();
	}

	/**
	 * Resalta el siguiente icono en la lista de entre los filtrados. O el primero si no hay ninguno.
	 */
	function selectNextIcon() {
		var selectedIcon = $iconsBox.find('.icon.selected');
		if (!selectedIcon.length) {
			$iconsPanel.children().first().addClass('selected');
		} else {
			selectedIcon.removeClass('selected');
			selectedIcon.next().addClass('selected');
		}
	}

	/**
	 * Resalta el anterior icono en la lista de entre los filtrados. O el último si no hay ninguno.
	 */
	function selectPreviousIcon() {
		var selectedIcon = $iconsBox.find('.icon.selected');
		if (!selectedIcon.length) {
			$iconsPanel.children().last().addClass('selected');
		} else {
			selectedIcon.removeClass('selected');
			selectedIcon.prev().addClass('selected');
		}
	}


	/**
	 * Evento KeyDown:
	 * Controla las teclas que se pueden pulsar y las acciones que hace cada una:
	 *
	 * - Izquierda/Shift + Tab: Seleccionar icono anterior
	 * - Derecha/Tab: Seleccionar icono siguiente
	 * - Enter: Insertar icono seleccionado
	 * - Escape o Espacio: Cerrar popup
	 * - Otro: Se añade al filtro
	 */
	function manageKeyDown(e) {
		var key = e.keyCode;
		if (key === KeyEvent.DOM_VK_LEFT || key === KeyEvent.DOM_VK_UP || (key === KeyEvent.DOM_VK_TAB && e.shiftKey)) {
			selectPreviousIcon();
			e.preventDefault();
		} else if (key === KeyEvent.DOM_VK_RIGHT || key === KeyEvent.DOM_VK_DOWN || key === KeyEvent.DOM_VK_TAB) {
			selectNextIcon();
			e.preventDefault();
		} else if (key === KeyEvent.DOM_VK_ESCAPE || key === KeyEvent.DOM_VK_SPACE) {
			hide();
		} else if (key === KeyEvent.DOM_VK_RETURN) {
			var selectedIcon = getSelectedIcon();
			if (selectedIcon) {
				insertIcon(selectedIcon);
				if (!e.shiftKey) { //Si mantenemos pulsado Shift no se cerrará el popup, pudiendo añadir varios seguidos
					hide();
				}
				e.preventDefault();
			} else {
				hide();
			}
		} else if (!e.shiftKey) {
			//Filtramos. Asincrono, para poder obtener el contenido actualizado del editor
			setTimeout(function () {
				var filter = getCurrentFilter();
				if (!filter) {
					hide();
				} else {
					applyFilter(filter);
				}
			}, 0);
		}
	}

	/**
	 * Devuelve el objeto icon correspondiente al seleccionado actualmente
	 */
	function getSelectedIcon() {
		return $iconsBox.find('.icon.selected').data('icon');
	}

	/**
	 * A partir de lo que el usuario ha introducido filtro, muestra los iconos que coincidan dentro del popup.
	 */
	function applyFilter(filter) {
		var numFiltered = 0;
		$iconsPanel.html("");
		sortedIcons.some(function (icon) {
			//Rellenamos la caja con los iconos según el filtro actual
			if (typeof filter === 'undefined' || filter === ':' || icon.name.indexOf(filter.substr(1)) !== -1) {
				$iconsPanel.append(createFilteredIcon(icon));
				numFiltered++;
			}

			//Mostramos un numero máximo de iconos
			return numFiltered > 10;
		});

		//Seleccionamos la primera ocurrencia si el usuario ha escrito algo después de los dos puntos
		if (filter && filter.length > 1) {
			$iconsPanel.children().first().addClass('selected');
		}

		//Si no hay coincidencias, ocultamos el panel (sin desactivar)
		if (!$iconsPanel.children().length) {
			$iconsBox.hide();
		} else {
			show();
		}
	}

	/**
	 * Crea un icono de los que se mostrarán en el popup y saca un tooltip con el número de veces que se ha usado cada icono
	 */
	function createFilteredIcon(icon) {
		var tooltip = '';
		var uses = mostUsedIcons[icon.name];
		if (uses == 1) {
			tooltip = 'Usado solo una vez';
		} else if (uses > 1) {
			tooltip = 'Usado ' + uses + ' veces';
		}

		var iconElement = $('<span class="icon" title="' + tooltip + '">');
		iconElement.append('<img border="0" class="inlineimg" src="' + icon.src + '" style="cursor: pointer; padding: 5px;">');
		var badge = $('<div class="badge"/>');
		badge.append('<span class="name">' + icon.name + '</div>');
		iconElement.data('icon', icon);
		iconElement.append(badge);
		return iconElement;
	}

	/**
	 * Devuelve todos los iconos del foro
	 * @param callback {function} Llama al callback pasandole dos parametros:
	 *        - Array ordenada por iconos más usados
	 *        - Objeto {iconName: icon} para acceso rapido por nombre
	 */
	function getAllIcons(callback) {
		var sortedIcons = [],
			iconsMap = {};

		$.ajax({
			type: 'GET',
			dataType:'text',
			url: '/foro/misc.php?do=getsmilies&editorid=' + getEditor().editorid
		}).done(function (data) {
			var $rows = $(data).find("tr[valign]");

			var iconParser = function (td1, td2) {
				var iconName = td2.textContent;
				var iconImg = td1.children[0];
				var iconId = iconImg.getAttribute("id").match(/_(\d*)/)[1];
				var iconSrc = iconImg.getAttribute("src");
				return {
					name: iconName,
					id: iconId,
					src: iconSrc
				};
			};

			//Es una tabla con cuatro columnas: [icono1][nombre1][icono2][nombre2]
			$rows.each(function (i, row) {
				var tds = row.children;
				var icon = iconParser(tds[0], tds[1]);
				sortedIcons.push(icon);
				iconsMap[icon.name] = icon;
				//Cada fila tiene dos iconos, menos la última...
				if (tds.length > 2) {
					icon = iconParser(tds[2], tds[3]);
					sortedIcons.push(icon);
					iconsMap[icon.name] = icon;
				}
			});


			mostUsedIcons = JSON.parse(mod.helper.getValue('MOST_USED_ICONS', '{}'));

			//Ordenamos los iconos por más usados
			sortedIcons = sortIconsByMostUsed(sortedIcons);

			callback(sortedIcons, iconsMap);

		});
	}

	/**
	 * Ordena los iconos de la lista de más a usados a menos
	 */
	function sortIconsByMostUsed(icons) {
		if (!_.isEmpty(mostUsedIcons)) {
			return _.sortBy(icons, function (icon) {
				var uses = mostUsedIcons[icon.name];
				return uses ? uses * (-1) : 0;
			});
		}

		return icons;
	}

	/**
	 * Inserta un icono en la posición actual del cursor, eliminando el nombre del icono que había escrito el usuario
	 * @param selectedIcon Icono a insertar
	 */
	function insertIcon(selectedIcon) {
		//Seleccionamos el texto introducido
		selectEntireNode();
		//Lo reemplazamos por el icono
		appendTextToEditor('<img src="' + selectedIcon.src + '" smiliedid="' + selectedIcon.id + '" class="inlineimg" border="0">&nbsp;');

		addToMostUsed(selectedIcon);
	}

	/**
	 * Añade un icono a la lista de los más usados, para luego mostrarlos por delante del resto
	 */
	function addToMostUsed(icon) {
		var uses = mostUsedIcons[icon.name] || 0;
		mostUsedIcons[icon.name] = ++uses;
		mod.helper.setValue('MOST_USED_ICONS', JSON.stringify(mostUsedIcons));
		sortedIcons = sortIconsByMostUsed(sortedIcons);
	}

	/**
	 * Devuelve un objecto con la posición actual del cursor {left, top, absoluteLeft, absoluteTop}
	 */
	function getCurrentCaretPosition() {
		var el = getEditor().editwin.getSelection().anchorNode;
		var range = document.createRange();
		range.selectNodeContents(el);
		range.setStart(el, getEditor().editwin.getSelection().getRangeAt(0).startOffset);
		var rect = range.getClientRects()[0];
		return rect && {
			left: rect.left,
			top: rect.top,
			absoluteLeft: rect.left + $(getEditor().editbox).offset().left,
			absoluteTop: rect.top + $(getEditor().editbox).offset().top
		};
	}

	/**
	 * Selecciona el nodo de texto correspondiente a lo que ha escrito el usuario, para poder reemplazarlo
	 */
	function selectEntireNode() {
		var el = getEditor().editwin.getSelection().anchorNode;
		var range = document.createRange();
		range.selectNodeContents(el);

		var sel = getEditor().editwin.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	}


	/* Añade accesos directos a los iconos favoritos del usuarios en la respuesta rápida */
	function addDefaultIcons() {

		//Añadimos el nuevo fieldset donde iran los iconos
		var fieldset = $('<fieldset class="fieldset" style="margin:3px 0 0 0"><legend>Iconos favoritos</legend></fieldset>');
		$("#" + getEditor().editorid).parent().append(fieldset);

		//Comprobamos que el campo no está en blanco, si lo está, usamos los iconos por defecto
		var favouriteIcons = mod.preferences.favouriteIcons;
		if (!favouriteIcons || !favouriteIcons.trim()) {
			favouriteIcons = mod.initialPreferences.favouriteIcons;
			mod.preferences.favouriteIcons = favouriteIcons;
			mod.storePreferences();
		}

		//Los añadimos al fieldset
		favouriteIcons = favouriteIcons.split(/\ ?,\ ?/);
		favouriteIcons.forEach(function (iconName) {
			var icon = iconsMap[iconName];
			if (icon) {
				fieldset.append('<img border="0" class="inlineimg" src="' + icon.src + '" style="cursor: pointer; padding: 5px;" onclick="vB_Editor.' + getEditor().editorid + '.insert_smilie(undefined, \'' + icon.name + '\', \'' + icon.src + '\', ' + icon.id + ')">');
			}
		});

		//Link para mostrarlos todos (ventana modal por defecto de FC)
		var more = $("<a href='#qrform'>Más...</a>");
		more.click(function () {
			getEditor().open_smilie_window(785, 500);
		});
		fieldset.append(more);
	}

	function getEditor() {
		return mod.helper.environment.page == "/showthread.php" ? unsafeWindow.vB_Editor.vB_Editor_QR : unsafeWindow.vB_Editor.vB_Editor_001;
	}

	function isWYSIWYG() {
		return getEditor().editdoc.body;
	}

	function appendTextToEditor(text) {
		focusEditor();
		getEditor().insert_text(text);
	}

	function focusEditor() {
		getEditor().editdoc.body.focus();
	}

	//Nombres de los keyCode, para Chrome, que no lo implementa nativamente
	if (typeof KeyEvent == "undefined") {
		var KeyEvent = {
			DOM_VK_TAB: 9,
			DOM_VK_RETURN: 13,
			DOM_VK_ESCAPE: 27,
			DOM_VK_SPACE: 32,
			DOM_VK_LEFT: 37,
			DOM_VK_UP: 38,
			DOM_VK_RIGHT: 39,
			DOM_VK_DOWN: 40,
			DOM_VK_COLON: 58,
			DOM_VK_BACK_SPACE: 8
		};
	}

})(jQuery, SHURSCRIPT.moduleManager.createModule);