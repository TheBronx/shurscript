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

	const announcesUrl = 'http://cloud.shurscript.org:8080/announces';
	var announces;
	var readAnnounces;

	mod.normalStartCheck = function () {
		return true;
	};

	/**
	 * Sobreescribimos la funcion de ejecucion
	 */
	mod.onNormalStart = function () {
		readAnnounces = JSON.parse(mod.helper.getValue("READ_ANNOUNCES", '[]'));

		mod.checkAnnounces();
	};

	mod.checkAnnounces = function() {
		if (announcesCheckedRecently()) return;
		console.log('check announces again');
		mod.helper.setLocalValue('lastCheck', (new Date()).toGMTString());

		$.getJSON(announcesUrl, function( data ) {
			announces = data.announces;
		})
			.done(function() {
				mod.showUnreadAnnounces();
			})
			.fail(function() {
				mod.helper.log('Error al recuperar lista de anuncios');
			});
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

		mod.markAnnounceAsRead(announce);
	};

	mod.markAnnounceAsRead = function(announce) {
		readAnnounces.push(announce);
		mod.helper.setValue("READ_ANNOUNCES", JSON.stringify(readAnnounces));
	};

	function announcesCheckedRecently() {
		const MINUTES_BETWEEN_CHECKS = 10;
		var fewMinutesAgo = new Date();
		fewMinutesAgo.setMinutes( fewMinutesAgo.getMinutes() - MINUTES_BETWEEN_CHECKS );

		var lastCheck = mod.helper.getLocalValue('lastCheck', undefined);
		if (!lastCheck) return false;

		lastCheck = new Date(lastCheck);
		return (lastCheck.getTime() > fewMinutesAgo.getTime());
	}

	function isNew(announce) {
		for (var i=0; i<readAnnounces.length; i++) {
			var readAnnounce = readAnnounces[i];
			var areEqual = (announce.title == readAnnounce.title && announce.date == readAnnounce.date);
			if (areEqual) {
				return false;
			}
		}
		return true;
	}

	/*mod.getPreferenceOptions = function () {

	};*/

})(jQuery, SHURSCRIPT.moduleManager.createModule);
