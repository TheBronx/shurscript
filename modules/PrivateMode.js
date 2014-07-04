function ($, createModule, undefined) {
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
	 * Esconder lo relacionad con el nombre
	 */

	function hideUserName() {
		// Busco donde suele estar mi nick
		var $nick = $('td.alt2 div a');

		//Me aseguro que es un link de member
		$nick.each(function(){
			if($(this).attr('href').indexOf('member') > -1) {
				// Borro enlace y texto manteniendo el diseño
				$(this).attr('href', '#').text('*');
			}
		});

		// Borro el nombre de la portada
		$('.cajascat .cat').first().text('*');
	}

	/**
	 * Sobreescribimos la funcion de ejecucion
	 */
	mod.onNormalStart = function () {
		hideUserName();
	};

})(jQuery, SHURSCRIPT.moduleManager.createModule);