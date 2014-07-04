(function ($, createModule, undefined) {
	'use strict';

	var mod = createModule({
		id: 'PrivateMode',
		name: 'Modo privado',
		author: 'CKGrafico',
		version: '1.0',
		description: 'Si estás en casa o en el trabajo y no quieres que vean algunas cosas de FC podrás ocultarlo sin problema',
		domain: 'ALL'
	});

	/**
	 * Genera un string aleatorio
	 */
	function getRandom() {
		return Math.random().toString(36).substring(2);
	}

	/**
	 * Esconder lo relacionad con el nombre
	 */
	function hideUserName() {
		// Busco donde suele estar mi nick
		var $nick = $('td.alt2 div a');
		var myName = null;

		_.each($nick, function(nick){
			// Me guardo mi nick para siempre
			// Esto se podría globalizar si lo queréis
			if(!myName) {
				myName = $(nick).text();
			}

			// Me aseguro que aparece mi nick
			if($(nick).text().indexOf(myName) > -1) {
				// Borro enlace y texto manteniendo el diseño
				$(nick).attr('href', '#').text('*');
			}
		});

		// Borro el nombre de la portada
		$('.cajascat .cat').first().text('*');
	}

	/**
	 * Esconder cualquier imagen + click para mostrarla
	 */
	function hideImages() {
		var $imgs = $('#posts img, #posts iframe, #posts embed');

		//Me aseguro que es un link de member
		_.each($imgs, function(img){

			var $img = $(img);

			// Si no es un icono chapuza inside
			if($img.parent().attr('rel') != 'nofollow'){
				var className = 'hide-img-' + getRandom();

				// Creo un botón para hacer toggle
				var $button = $('<a/>').text('Mostrar/Esconder').attr('href', '#');

				// La escondo, le pongo una clase random y añado el botón
				$img
					.hide()
					.addClass(className)
					.after($button);

				// Evento
				$button.on('click', function(e) {
					e.preventDefault();
					$('.' + className).toggle();
				});
			}
		});
	}

	/**
	 * Sobreescribimos la funcion de ejecucion
	 */
	mod.onNormalStart = function () {
		hideUserName();
		hideImages();
	};

})(jQuery, SHURSCRIPT.moduleManager.createModule);