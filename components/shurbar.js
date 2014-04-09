/**
 *
 */
(function ($, SHURSCRIPT, undefined) {
	'use strict';

	var shurbar = SHURSCRIPT.core.createComponent('shurbar');

	var html = '<div id="shurbar" class="shurscript" style="visibility:hidden; position:fixed; bottom:25px; left:0px; background-color:#fefefe; box-shadow:1px 0 5px #000000; border-radius:0 4px 4px 0;">' +
		'<ul class="shurbar-icons" style="list-style:none; display:inline-block; margin:0; padding:5px; transition: width 1s ease 0s;"></ul>' +
		'<img id="shurbar-roto2" src="http://cdn.forocoches.com/foro/images/smilies/goofy.gif" style="display:inline; padding:5px; cursor:pointer;"/>' +
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
			$('#shurbar ul.shurbar-icons').append('<li id="' + icons[i].name + '" style="display:inline;"><img src="' + icons[i].image + '" /> ' + icons[i].name + '</li>');
		}

		//escuchar evento on click en todos los <li>
		$('#shurbar ul.shurbar-icons li').click(shurbar.iconClicked);

		//hide bar
		shurbar.hide();
	};

	shurbar.toggle = function() {
		if(isHidden) {
			shurbar.show();
		} else {
			shurbar.hide();
		}
	};

	shurbar.show = function() {
		$('#shurbar ul.shurbar-icons').animate({'margin-left':'0px'});
		isHidden = false;
	};
	shurbar.hide = function() {
		var width = $('#shurbar ul.shurbar-icons').outerWidth();
		$('#shurbar ul.shurbar-icons').animate({'margin-left':'-'+width+'px'}, function() {
			$('#shurbar').css({'visibility':'visible'}); //la shurbar esta oculta al cargar, con esto la mostramos una vez replegada
		});
		isHidden = true;
	};

	//punto de entrada
	shurbar.load = function() {
		$(document.body).append(html);
		//escuchar evento on click en roto2
		$('#shurbar-roto2').click(shurbar.toggle);

		SHURSCRIPT.eventbus.on('loadingModule', shurbar.loadingModule);
	};

})(jQuery, SHURSCRIPT);
