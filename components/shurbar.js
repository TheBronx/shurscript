/**
 *
 */
(function ($, SHURSCRIPT, undefined) {
	'use strict';

	var shurbar = SHURSCRIPT.core.createComponent('shurbar');

	var html = '<div id="shurbar" class="shurscript" style="position:fixed;bottom:25px;left:20px;">' +
		'<img src="http://cdn.forocoches.com/foro/images/smilies/goofy.gif"/>' +
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

		function buildPopoverContent() {
			var popover = $("<div class='shurscript'/>");
			var ul = $('<ul class="shurbar-icons"/>');

			for(var i=0; i<icons.length; i++) {
				ul.append('<li id="'+icons[i].name+'"><img src="'+icons[i].image+'" data-toggle="tooltip" data-placement="bottom" title="'+icons[i].name+'" /></li>');
				//TODO agregar eventos onclick y notificar al modulo de turno via trigger() o directamente...
			}

			popover.append(ul);
			return popover;
		}

		$('#shurpop').popover({content: buildPopoverContent(), container: '#shurbar', placement: 'right', html: true, trigger: 'manual'});

		$('#shurpop').click(function (e) {
			$(".popover").remove();
			$(this).popover('show');
			$(".popover .popover-content").html(buildPopoverContent());
		});

		//escuchar evento on click en todos los <li>
		$('#shurbar ul.shurbar-icons li').click(shurbar.iconClicked);
	};

	//punto de entrada
	shurbar.load = function() {
		$(document.body).append(html);
		SHURSCRIPT.eventbus.on('loadingModule', shurbar.loadingModule);
	};

})(jQuery, SHURSCRIPT);
