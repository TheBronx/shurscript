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
		mod.showUnreadAnnounces();
	};

	mod.showUnreadAnnounces = function() {

		var announce = null;
		for (var i=0; i<announces.length; i++) {
			announce = announces[i];

			mod.showAnnounceNotification(announce);
		}

	};

	mod.showAnnounceNotification = function(announce) {
		if (!isNew(announce)) return;

		var notification = {
			'type': 'message',
			'title': announce.title,
			'content': announce.content,
			'date': announce.date
		};

		SHURSCRIPT.eventbus.trigger('notification', notification);
	};

	function isNew(announce) {
		return true;
	}

	/*mod.getPreferenceOptions = function () {

	};*/

})(jQuery, SHURSCRIPT.moduleManager.createModule);
