/**
 *
 */
(function ($, SHURSCRIPT, undefined) {
	'use strict';

	var shurbar = SHURSCRIPT.core.createComponent('shurbar');

	var html = '<div id="shurbar" class="shurscript" style="position:fixed;bottom:25px;left:20px;">' +
		'<img id="shurbar-roto2" src="http://cdn.forocoches.com/foro/images/smilies/goofy.gif"/>' +
		'<ul class="shurbar-icons"></ul>' +
		'</div>';
	var icons = [];
	var Icon = function(moduleId, name, description, image, handler) {
		this.moduleId = moduleId;
		this.name = name;
		this.description = description;
		this.image = image;
		this.handler = handler;
	};
	var isHidden = true;

	//called when a module is loading
	shurbar.loadingModule = function(event, module) {
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
					icon = new Icon(module.id, iconData[i].name, iconData[i].description, iconData[i].image, iconData[i].handler);
					icons.push(icon);
				}
			} else { //agregar un unico icono para este modulo
				icon = new Icon(module.id, iconData.name, iconData.description, iconData.image, iconData.handler);
				icons.push(icon);
			}
			shurbar.updateBar();
		}
	};

	shurbar.iconClicked = function() {
		var icon;
		var iconId = $(this).attr('id');
		for(var i=0; i<icons.length; i++) {
			if (icons[i].name == iconId) {
				icon = icons[i];
				//notify module
				icon.handler();
				break;
			}
		}
	};

	shurbar.updateBar = function() {
		$('#shurbar ul.shurbar-icons').html('');

		for(var i=0; i<icons.length; i++) {
			$('#shurbar ul.shurbar-icons').append('<li id="' + icons[i].name + '"><img src="' + icons[i].image + '" /> ' + icons[i].name + '</li>');
		}

		//escuchar evento on click en todos los <li>
		$('#shurbar ul.shurbar-icons li').click(shurbar.iconClicked);
	};

	shurbar.toggle = function() {
		if(isHidden) {
			$('#shurbar ul.shurbar-icons').show('slide',{direction:'right'},1000, function() { isHidden = !isHidden; });
		} else {
			$('#shurbar ul.shurbar-icons').hide('slide',{direction:'left'},1000, function() { isHidden = !isHidden; });
		}
	};

	//punto de entrada
	shurbar.load = function() {
		$(document.body).append(html);
		//escuchar evento on click en roto2
		$('#shurbar-roto2').click(shurbar.toggle);

		SHURSCRIPT.eventbus.on('loadingModule', shurbar.loadingModule);
	};

})(jQuery, SHURSCRIPT);
