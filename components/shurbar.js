/**
 *
 */
(function ($, SHURSCRIPT, undefined) {
	'use strict';

	var shurbar = SHURSCRIPT.core.createComponent('shurbar');
	var html = '<div id="shurbar" style="position:fixed;bottom:25px;left:20px;">' +
		'<img src="http://cdn.forocoches.com/foro/images/smilies/goofy.gif"/>' +
		'<ul class="shurbar-icons"></ul>' +
		'</div>';
	var icons = [];
	var Icon = function(moduleId, name, description, image) {
		this.moduleId = moduleId;
		this.name = name;
		this.description = description;
		this.image = image;
	};

	shurbar.loadingModule = function(event, module) {
		console.log("Loading module "+module.id);
		//comprobar si el modulo esta habilitado
		if (!module.preferences.enabled) {
			return;
		}

		//comprobar si el modulo quiere agregar algo a la shurbar
		if('undefined' !== typeof module.shurbarIcon) {
			var iconData = module.shurbarIcon();
			var icon;
			if ($.isArray(iconData)) { //agregar multiples iconos
				for(var i=0; i<iconData.length; i++) {
					icon = new Icon(module.id, iconData[i].name, iconData[i].description, iconData[i].image);
					icons.push(icon);
				}
			} else { //agregar un unico icono para este modulo
				icon = new Icon(module.id, iconData.name, iconData.description, iconData.image);
				icons.push(icon);
			}
			shurbar.updateBar();
		}
	};

	shurbar.updateBar = function() {
		$('#shurbar ul.shurbar-icons').html('');
		for(var i=0; i<icons.length; i++) {
			$('#shurbar ul.shurbar-icons').append('<li id="'+icons[i].name+'"><img src="'+icons[i].image+'" /> '+icons[i].name+'</li>');
			//TODO agregar eventos onclick y notificar al modulo de turno via trigger() o directamente...
		}
	};

	//punto de entrada
	shurbar.load = function() {
		$(document.body).append(html);
		SHURSCRIPT.eventbus.on('loadingModule', shurbar.loadingModule);
	};

})(jQuery, SHURSCRIPT);
