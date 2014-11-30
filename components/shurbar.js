/**
 * Barra que contendrá botones personalizables por cada módulo y cada componente
 */
(function ($, SHURSCRIPT, undefined) {
	'use strict';

	var shurbar = SHURSCRIPT.core.createComponent('shurbar');

	var html = '<div id="shurbar" class="shurscript"><div class="pull-right">' +
		'<ul class="nav navbar-nav shurbar-items"></ul>' +
		/*'<img id="shurbar-roto2" src="http://cdn.forocoches.com/foro/images/smilies/goofy.gif" style="display:inline; padding:7px; cursor:pointer;border-left: 1px dashed #dfdfdf;"/>' +*/
		'</div></div>';
	var icons = [];
	var Icon = function (moduleId, name, description, image, handler, href) {
		this.moduleId = moduleId;
		this.name = name;
		this.description = description;
		this.image = image;
		this.handler = handler;
		this.href = href;
	};
	var isHidden = true;

	/**
	 * Se llama cuando un módulo empieza a cargarse
	 */
	function loadingModule(event, module) {
		if (!module.preferences.enabled) {
			return;
		}

		checkAndAddIcons(module);
	}

	/**
	 * Se llama cuando un componente empieza a cargarse
	 */
	function loadingComponent(event, component) {
		checkAndAddIcons(component);
	}

	/**
	 * Comprueba si el módulo o el componente tiene algo que añadir a la shurbar y si es así, lo añade.
	 */
	function checkAndAddIcons(moduleOrComponent) {
		if ('undefined' !== typeof moduleOrComponent.shurbarIcon) {
			addIcons(moduleOrComponent.shurbarIcon(), moduleOrComponent);
		}
	}

	/**
	 * Añadir iconos a la lista que más tarde se añadirá la barra
	 */
	function addIcons(iconData, module) {
		
		if (!$.isEmptyObject(iconData)) {
			
			if (!$.isArray(iconData)) { //Convertirlo en array para reutilizar el bucle
				iconData = [iconData];
			}

			iconData.forEach(function (data) {
				icons.push(new Icon(module && module.id, data.name, data.description, data.image, data.handler, data.href));
			});
			
		}
	}

	/**
	 * Añade todos los iconos a la barra definitivamente (cuando ya se han cargado todos los módulos)
	 */
	function updateBar() {
		icons.forEach(function (icon) {
			$('<li class="shurbar-item" id="' + icon.name + '" data-placement="top" ' + (icon.description ? 'data-toggle="tooltip" title="' + icon.description + '"' : '') + '><img src="' + icon.image + '"/><a ' + (icon.href ? 'href="' + (icon.href) + '" ' : '') + '>' + icon.name + '</a></li>')
				.prependTo($('#shurbar ul.shurbar-items'))
				.click(icon.handler).tooltip({delay: 300});
		});
	}

	/**
	 * Punto de entrada del componente
	 */
	shurbar.load = function () {

		shurbar.helper.addStyle('shurbarcss');

		//Reducir padding de la cabecera
		$('#AutoNumber9').attr('cellpadding', 0);

		//Reutilizamos la barra dónde está el buscador para poner la nuestra
		var $oldbar;
		if (SHURSCRIPT.environment.page == 'frontpage') {
			$oldbar = $('.cajastip');
			//Movemos de sitio las estadísticas para no perderlas
			var stats = $oldbar.find('.texto:nth-child(2)').html();
			$('#AutoNumber8').html(stats.replace('|', '<br/>'));
			$('#AutoNumber8').addClass('texto');
			$('#AutoNumber8').css('margin', '7px 0 0 7px');
		} else {
			$oldbar = $('#AutoNumber7').parents('.cajasprin');
		}

		var $buscador = $('<div id="quick-search-form" class="pull-left">' + $oldbar.find('form').parent().html() + '</div>');
		// Cambiar estilos del buscador
		$buscador.find('.cbutton').addClass('btn btn-default');
		// $buscador.find('.cbutton[type=submit]').addClass('btn-primary');
		$buscador.find('.cfield').addClass('form-control');

		//Metemos todos los inputs dentro del formulario
		$buscador.find('form').append($buscador.find('input'));

		var $shurbar = $(html);
		$shurbar.append($buscador);

		//Hacemos el cambiazo
		$oldbar.replaceWith($shurbar);

		//Cada componente que se cargue, podrá añadir si quiere un botón a la barra
		SHURSCRIPT.eventbus.on('loadingComponent', loadingComponent);

		//Lo mismo con los módulos
		SHURSCRIPT.eventbus.on('loadingModule', loadingModule);

		//Cuando se carguen todos los módulos, pintamos la barra
		SHURSCRIPT.eventbus.on('allModulesLoaded', function () {
			updateBar();
		});
	};

})(jQuery, SHURSCRIPT);
