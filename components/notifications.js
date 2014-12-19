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
		this.id = null;
		this.date = null;
		this.read = false;
		this.type = ''; // bubble | link | message
		this.title = '';
		this.content = '';
		this.link = '';

		this.parse = function(params) {
			this.id = params.id;
			this.date = params.date || new Date().getTime();
			this.type = params.type;
			this.title = params.title;
			this.content = params.content ? params.content : '';
			this.link = params.link ? params.link : '';

			return this;
		}
	};

	var NotificationsList = function() {
		var _this = this;
		this.notifications = [];

		this.add = function(notification) {
			_this.notifications.push(notification);
			_this.saveNotifications();
		};

		this.saveNotifications = function() {
			comp.helper.setValue("NOTIFICATIONS", JSON.stringify(_this.notifications));
		};

		this.loadNotifications = function() {
			_this.notifications = JSON.parse(comp.helper.getValue("NOTIFICATIONS", '[]'));

			return this;
		};

		this.markAsRead = function(notification) {
			for(var i=0; i<_this.notifications.length; i++) {
				if (_this.notifications[i].id === notification.id) {
					notification.read = true;
					break;
				}
			}
		};

		this.getUnreadNotifications = function() {
			var unreadNotifications = [];
			for(var i=0; i<_this.notifications.length; i++) {
				if (!_this.notifications[i].read) {
					unreadNotifications.push(_this.notifications[i]);
				}
			}

			return unreadNotifications;
		};

		this.getNextUnreadNotification = function() {
			if (_this.notifications.length>0) {
				var unreadNotifications = _this.getUnreadNotifications();
				return unreadNotifications[0];
			} else {
				return null;
			}
		};
	};

	var notifications = new NotificationsList();
	var showingNotification = false;

	/**
	 * Punto de entrada del componente
	 */
	comp.load = function () {

		comp.helper.addStyle('notificationscss');

		SHURSCRIPT.eventbus.on('notification', comp.enqueNotification);

		comp.loadNotifications();
		if (!showingNotification) {
			comp.showNextUnreadNotification();
		}
	};

	comp.loadNotifications = function() {
		notifications = notifications.loadNotifications();
	};

	comp.enqueNotification = function (event, notificationParams) {
		var notification = new Notification().parse(notificationParams);
		notifications.add(notification);

		if (!showingNotification) {
			comp.showNextUnreadNotification();
		}
	};

	/*comp.shurbarIcon = function () {
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
	*/

	comp.showNextUnreadNotification = function() {
		var notification = notifications.getNextUnreadNotification();
		if (notification) {
			comp.displayNotification(notification);
		}
	};

	comp.markNotificationRead = function(notification) {
		notifications.markAsRead(notification);
		notifications.saveNotifications();
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
		showingNotification = true;
		var notificationHtml = '<div id="shurscript-notification-{id}"><h2>{title}</h2><p>{content}</p></div>';
		notificationHtml = notificationHtml.replace('{id}', notification.id);
		notificationHtml = notificationHtml.replace('{title}', notification.title);
		notificationHtml = notificationHtml.replace('{content}', notification.content);
		bootbox.alert(notificationHtml, function() {
			showingNotification = false;
			comp.markNotificationRead(notification);
			comp.showNextUnreadNotification();
		});
	};

})(jQuery, SHURSCRIPT);
