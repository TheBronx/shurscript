/**
 * Notification manager
 * ! must load afer components:
 *      + sync.js
 *      + shurbar.js
 */
(function ($, SHURSCRIPT, undefined) {
	'use strict';

	var comp = SHURSCRIPT.core.createComponent('notifications');

	var Notification = function() {
		this.id = new Date().getTime();
		this.date = null;
		this.read = false;
		this.type = ''; // bubble | link | message
		this.title = '';
		this.content = '';
		this.link = '';
	};

	/**
	 * Punto de entrada del componente
	 */
	comp.load = function () {

		//shurbar.helper.addStyle('notifications');

		SHURSCRIPT.eventbus.on('notification', comp.notify);
	};

	comp.notify = function (event, notification) {
		console.log('new notification: ');
		console.log(notification);
	};

	comp.shurbarIcon = function () {
		return {
			name: 'Notificaciones',
			description: 'Avisos y mensajes',
			image: 'http://i.imgur.com/wLtDpAp.png',
			handler: comp.openNotifications,
			href: "#"
		};
	};

	comp.openNotifications = function() {

	};

})(jQuery, SHURSCRIPT);
