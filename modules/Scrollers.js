(function ($, createModule, undefined) {
	'use strict';

	var mod = createModule({
		id: 'Scrollers',
		name: 'Scroll arriba y abajo',
		author: 'xusoO',
		version: '0.1',
		description: 'Aparecerán dos flechas en la parte inferior del foro; una para volver al principio de la página y la otra para ir al final.',
		domain: 'ALL',
		initialPreferences: {
			enabled: false,
			upOrDown: 'both',
			side: 'center'
		}
	});

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
		if (mod.preferences.side != "center") {
			GM_addStyle('#scrollers {opacity: 0.5;bottom: 5px;' + mod.preferences.side + ': 13px;position: fixed;}');
		} else {
			GM_addStyle('#scrollers {opacity: 0.5;bottom: 5px;left: calc(50% - 55px);position: fixed;}');
		}

		GM_addStyle('#scrollers:hover {opacity: 0.9;}');
		GM_addStyle('.scrollerArrow {background: url("' + SHURSCRIPT.config.imagesURL + 'scroller.png") no-repeat scroll 0 0 transparent;background-size: 50px;cursor: pointer;height: 50px;width: 50px;display: inline-block;margin: 5px;opacity: 0.4;}');
		GM_addStyle('.scrollerArrow:hover {opacity: 0.7;}');

		GM_addStyle('.scrollerArrow#scrollToBottomArrow {transform: rotate(180deg);-webkit-transform: rotate(180deg);}');

		var container = $("<div id='scrollers'></div>");
		var topArrow = $("<div class='scrollerArrow' id='scrollToTopArrow'></div>");
		topArrow.click(function () {
			$('html, body').stop().animate({scrollTop: '0px'}, 800)
		});
		var bottomArrow = $("<div class='scrollerArrow' id='scrollToBottomArrow'></div>");
		bottomArrow.click(function () {
			$('html, body').stop().animate({scrollTop: ($("#qrform").length > 0 ? $("#qrform").offset().top : $("html").height()) + 'px'}, 800)
		});

		if (mod.preferences.upOrDown == 'up') {
			container.append(topArrow);
		} else if (mod.preferences.upOrDown == 'down') {
			container.append(bottomArrow);
		} else {
			container.append(topArrow).append(bottomArrow);
		}

		$(document.body).append(container);
	};

	mod.getPreferenceOptions = function () {
		var createPref = mod.helper.createPreferenceOption;

		return [
			createPref({
				type: 'radio',
				elements: [
					{value: 'both', caption: 'Ambas fechas'},
					{value: 'up', caption: 'Solo la de ir al principio'},
					{value: 'down', caption: 'Solo la de ir al final'}
				],
				caption: 'Mostrar:',
				mapsTo: 'upOrDown'
			}),
			createPref({
				type: 'radio',
				elements: [
					{value: 'left', caption: 'A la izquierda'},
					{value: 'right', caption: 'A la derecha'},
					{value: 'center', caption: 'Centradas'}
				],
				caption: 'Alinear:',
				mapsTo: 'side'
			})
		];
	};

})(jQuery, SHURSCRIPT.moduleManager.createModule);
