/**
 * Gestor de notificaciones
 */
(function ($, SHURSCRIPT, undefined) {
	'use strict';

	var notifications = SHURSCRIPT.core.createComponent('notifications');

	/**
	 * Punto de entrada del componente
	 */
	notifications.load = function () {

		//shurbar.helper.addStyle('notifications');

		//Cada componente que se cargue, podrá añadir si quiere un botón a la barra
		//SHURSCRIPT.eventbus.on('loadingComponent', loadingComponent);

		//Lo mismo con los módulos
		//SHURSCRIPT.eventbus.on('loadingModule', loadingModule);

	};

	notifications.shurbarIcon = function () {
		console.log("no rula");
		return {
			name: 'Notificaciones',
			description: 'Avisos y mensajes',
			image: 'http://i.imgur.com/wLtDpAp.png',
			handler: notifications.openNotifications,
			href: "#"
		};
	};

	notifications.openNotifications = function() {

	};

})(jQuery, SHURSCRIPT);
