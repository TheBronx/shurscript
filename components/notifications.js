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

	var NotificationsList = function() {
		var _this = this;
		this.notifications = [];

		this.getUnreadNotifications = function() {
			var unreadNotifications = [];
			for(var i=0; i<notifications.length; i++) {
				if (_this.notifications[i].unread) {
					unreadNotifications.push(_this.notifications[i]);
				}
			}

			return unreadNotifications;
		};
	};

	/**
	 * Punto de entrada del componente
	 */
	comp.load = function () {

		comp.helper.addStyle('notificationscss');

		SHURSCRIPT.eventbus.on('notification', comp.notify);
	};

	comp.notify = function (event, notificationParams) {
		console.log('new notification: ');
		console.log(notificationParams);

		var notification = new Notification();
		notification.type = notificationParams.type;
		notification.title = notificationParams.title;

		comp.displayNotification(notification);
	};

	comp.shurbarIcon = function () {
		return {
			name: 'Notificaciones',
			description: 'Avisos y mensajes',
			image: 'http://i.imgur.com/wLtDpAp.png',
			handler: comp.showNotificationsList,
			href: "#"
		};
	};

	comp.showNotificationsList = function() {

	};

	comp.markNotificationRead = function(notification) {

	};

	comp.displayNotification = function(notification) {
		if (notification.type === 'bubble') {
			comp.displayBubbleNotification(notification);
		}

		if (notification.type === 'link') {
			comp.displayLinkNotification(notification);
		}

		if (notification.type === 'message') {
			comp.displayMessageNotification(notification);
		}
	};

	comp.displayBubbleNotification = function(notification) {
		var notificationDiv = '<div id="shurscript-notification-{id}" class="shurscript-notification notification-bubble"><a class="shurscript-notification-close"></a><h1>{title}</h1></div>';
		notificationDiv = notificationDiv.replace('{id}', notification.id);
		notificationDiv = notificationDiv.replace('{title}', notification.title);
		//TODO add listener
		$('body').append(notificationDiv);
	};

	comp.displayLinkNotification = function(notification) {
		//TODO
		comp.displayBubbleNotification(notification);
	};

	comp.displayMessageNotification = function(notification) {
		//TODO
		comp.displayBubbleNotification(notification);
	};

})(jQuery, SHURSCRIPT);
