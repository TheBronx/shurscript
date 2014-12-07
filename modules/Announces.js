(function ($, createModule, undefined) {
	'use strict';

	var mod = createModule({
		id: 'Announces',
		name: 'Notificaciones de Shurscript',
		author: 'TheBronx',
		version: '0.1',
		description: 'Mensajes y anuncios oficiales del equipo de Shurscript',
		domain: 'ALL',
		initialPreferences: {
			enabled: true
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
		var notification = {
			'title': 'Test notification',
			'type': 'tip',
			'date': new Date()
		};
		SHURSCRIPT.eventbus.trigger('notification', notification);
	};

	/*mod.getPreferenceOptions = function () {

	};*/

})(jQuery, SHURSCRIPT.moduleManager.createModule);
