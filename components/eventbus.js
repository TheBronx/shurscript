/**
 * Crear el Event Bus que compartirán todos los componentes y módulos para lanzar y escuchar eventos.
 * Uso, como los eventos de jQuery: eventbus.on('myevent', function) se llamará cuando alguien ejecute eventbus.trigger('myevent')
 */
(function ($, SHURSCRIPT, undefined) {
	'use strict';

	var eventbus = SHURSCRIPT.core.createComponent('eventbus');

	/**
	 * Objeto jQuery que actuará de bus para los eventos
	 */
	var _bus = $({});

	/**
	 * Escuchar un nuevo evento
	 * @param {string} eventName: Nombre de nuestro evento
	 * @param {function} handler: Función a ejecutar cuando se lance nuestro evento
	 */
	eventbus.on = function (eventName, handler) {
		_bus.on(eventName, handler);
	};

	/**
	 * Escuchar un evento, pero solo ejecutarlo una vez, luego se desenganchará automáticamente
	 * @param {string} eventName: Nombre de nuestro evento
	 * @param {function} handler: Función a ejecutar cuando se lance nuestro evento
	 */
	eventbus.one = function (eventName, handler) {
		_bus.one(eventName, handler);
	};

	/**
	 * Dejar de escuchar cierto evento
	 * @param {string} eventName: Nombre del evento
	 * @param {function} handler: Manejador en concreto que se quiere desenganchar
	 * Importante, si no se pasa ningún handler, se desactivaran todos los manejadores que escuchaban este evento
	 */
	eventbus.off = function (eventName, handler) {
		_bus.off(eventName, handler);
	};

	/**
	 * Lanza un evento para que todos los que esten escuchando lo reciban
	 * @param {string} eventName: Nombre del evento
	 * @param {string, array}: Parámetros extra que recibirán los manejadores enganchados a este evento
	 * Si se usan parámetros exta, se deberá, además del evento, esperar recibir en la función cada uno de
	 * los parámetros que se pasen al trigger. Por ejemplo:
	 * Escuchar: on('myevent', function (event, code, message) {...});
	 * Lanzar:   trigger('myevent', [200, 'OK']);
	 */
	eventbus.trigger = function (eventName, extraParams) {
		_bus.trigger(eventName, extraParams);
	};

})(jQuery, SHURSCRIPT);
