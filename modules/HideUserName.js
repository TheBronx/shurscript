function ($, createModule, undefined) {
	'use strict';

	var mod = createModule({
		id: 'HideUserNAme',
		name: 'Esconde tu nombre de usuario',
		author: 'CKGrafico',
		version: '1.0',
		description: 'Si estás en casa o en el trabajo y no quieres que vean tu nick de FC podrás ocultarlo sin problema',
		domain: 'ALL'
	});

	/**
	 * Sobreescribimos la funcion de ejecucion
	 */
	mod.onNormalStart = function () {
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
	};

})(jQuery, SHURSCRIPT.moduleManager.createModule);