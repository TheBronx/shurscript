/**
 * Aqui la descripcion de tu modulo
 */
(function ($, createModule, undefined) {
	'use strict';

	/**
	 * Genera tu modulo llamando a createModule y pasandole un objeto de especificaciones (specs)
	 *
	 * @param {string} specs.id
	 * @param {string} specs.name
	 * @param {string} specs.author
	 * @param {string} specs.version
	 * @param {string} specs.description
	 * @param {string} [specs.domain] - dominio en el que el modulo arranca. Posibles valores:
	 * - 'NO_FRONTPAGE' - carga en todo FC salvo la portada [valor por defecto]
	 * - 'ALL' - carga en todo FC
	 * - string con nombre del recurso tal y como esta en helper.environment.page
	 * - array de strings como en el punto anterior
	 * @param {object} [specs.initialPreferences] - preferencias iniciales del modulo.
	 * Las preferencias guardadas por el usuario tienen prioridad.
	 * @param {bool} [specs.initialPreferences.enabled] - bool para modulo cargado por defecto. Por defecto es true
	 */
	var mod = createModule({
		id: 'moduloID',
		name: 'nombre de mi modulo',
		author: 'panikero',
		version: '0.1',
		description: 'Descripcion de tu modulo que saldrá en la ventana de configuracion',
		domain: 'ALL',
		initialPreferences: {
			enabled: true, // Esta es opcional - por defecto true
			unaPreferencia: true,
			otraPreferencia: 55
		}
	});

	/****************************************************************************
	 * Elementos utiles del closure y del objeto modulo (mod)
	 * ======================================================
	 * - $: jQuery local
	 * - createModule: funcion para crear modulo
	 * - mod.helper: objeto helper personalizado para el módulo.
	 *     - .log: hace un log a la consola con informacion
	 *       util extra como el nombre del modulo, la hora, etc.
	 *     - .setValue(key, value, withId=false): guarda key-value en el navegador.
	 *       Pasa withId=true si quieres que la llave contenga el id del usuario
	 *     - .getValue(key, defaultValue, withId): extrae value para key.
	 *       Devuelve defaultValue si no se ha encontrado. (withId igual que antes)
	 *     - .deleteValue(key, withId): elimina key (withId igual que hantes)
	 *     - .throw(message): lanza excepcion
	 *     - addStyle(styleResource): mete css a la pagina. El css tiene que haber
	 *       sido cargado previamente en shurscript.user.js
	 *     - getResourceText(textResource): devuelve texto previamente definido como
	 *       resource en shurscript.user.js
	 *     - getResourceURL(urlResourceName): devuelve url de un recurso previamente
	 *       definido en shurscript.user.js
	 *     - .templater: objeto con motor de plantillas. Lee templater.js para
	 *       saber como funciona
	 *     - .environment: objeto con informacion de la pagina y del usuario
	 *     - .createPreferenceOption(specs): funcion para crear preferencias que
	 *       apareceran en el dialogo de configuracion. Mas informacion adelante
	 *
	 *  Como organizar tu codigo
	 *  ========================
	 *  Lo mas normal es utilizar solo variables locales a este scope para tus variables
	 *  y metodos (privados). Si quieres puedes registrar propiedades en el objeto modulo
	 *  y quedaran expuestos, pero SHURSCRIPT no utiliza estas propiedades asi que
	 *  en principio no tiene ventajas sobre una variable local.
	 *
	 *****************************************************************************/

	/******************************************************************************
	 * METODOS A SOBREESCRIBIR - IMPORTANTE:
	 *
	 * Lee la descripcion de cada metodo y si te interesa descomentalo y sobreescribe
	 * con tu codigo.
	 *
	 * La version comentada es la que el modulo hereda automaticamente.
	 *******************************************************************************/

	/*************
	 * MODO CARGA NORMAL
	 *
	 * - El modo habitual de carga. Los metodos se ejecutaran cuando el DOM este listo
	 ************/

	/**
	 * Funcion de control a la que se llama para saber si el modulo
	 * se tiene que ejecutar. Normalmente es suficiente con la propiedad
	 * .domain, pero puedes usar esto si necesitas algun control adicional
	 *
	 * @returns {bool}
	 */
	// mod.normalStartCheck = function () {return true;};

	/**
	 * Funcion a la que se llama en si .normalStartCheck ha dado true
	 *
	 * Principal puerta al modulo. Normalmente toda la logica empieza aqui
	 */
	// mod.onNormalStart = function () {};

	/*************
	 * MODO CARGA PREMATURO - /!\ SOLO PARA TROLLES AVANZADOS
	 *
	 * - Modo especial de carga. Los metodos se ejecutaran antes de que el DOM este listo.
	 ************/

	/**
	 * Funcion de control para acceso a modo de carga prematuro.
	 * El modo de carga prematuro consiste en ejecutar codigo antes de que se cargue el DOM.
	 * Es bastante mas de utilizar que el modo de carga normal.
	 *
	 * No tienes porque devolver un booleano directamente, puedes hacer tus comprobaciones.
	 * @returns {bool}
	 */
	// mod.eagerStartCheck = function () {return false;};

	/**
	 * Funcion a la que se llama en si .eagerStartCheck ha dado true
	 *
	 * Recuerda que no hay ninguna garantia de que los elementos del DOM esten cargados,
	 * si necesitas meter de forma segura algun elemento en el DOM, puedes registar una
	 * funcion con $(document).ready(...) que se ejecutara de forma segura cuando todo este
	 * cargado
	 */
	// mod.onEagerStart = function () {};

	/*************
	 * PREFERENCIAS-OPCIONES
	 *
	 * Las preferencias sincronizan el objeto de tu modulo mod.preferences
	 * con lo que el usuario guarde en la ventana de configuracion.
	 *
	 * Por defecto, el objeto tiene definida una preferencia mod.preferences.enabled
	 * y esta aparecera siempre en la ventana de configuracion. No es una opcion y
	 * no hay que definirla.
	 *
	 * Aparte de la preferencia .enabled, puedes definir tantas otras preferencias
	 * como quieras, las llamaremos opciones. Para crear opciones se debe usar
	 * la funcion mod.helper.createPreferenceOption.
	 *
	 * Se pueden crear los siguientes tipos de opciones:
	 *
	 * - checkbox: la preferencia es de tipo booleano
	 * - radio: preferencia a escoger entre ciertos valores definidos
	 * - text: campo de texto donde se puede escribir cualquier cosa
	 * - header: realmente no es una preferencia-opcion, pero resulta comodo meterlo
	 * en el saco. Util para crear diferentes secciones entre tus preferencias
	 *
	 * /!\ Importante de cojones /!\
	 * -----------------------------
	 * Cualquier preferencia aqui creada tiene que tener su correspondiente key
	 * en .initialPreferences al crear el modulo.
	 *
	 * Signatura de mod.helper.createPreferenceOption
	 *
	 * @param {string} specs.type - puede ser 'checkbox', 'radio', 'text' o 'header'
	 * @param {string} specs.caption - descripcion de la opcion
	 * @param {string} [specs.subCaption] - descripcion opcional adicional
	 * @param {array} [specs.elements] - obligatorio para 'radio'. Array de objetos
	 * que definen la opcion para el radiobutton. Formato:  {value: '...', caption: '...' [, subCaption: '...']}
	 * @param {string} [specs.mapsTo] - obligatorio excepto para 'header'
	 *************/

	/**
	 * Funcion que devuelve preferencias. Las preferencias son objetos creados con
	 * la funcion mod.helper.createPreferenceOption()
	 *
	 * @return {Array} - Array con los objetos preferencias
	 */
	// mod.getPreferenceOptions = function () {[]};

	/*
	 Ejemplo de uso
	 mod.getPreferenceOptions = function () {

	 // Para no repetir la ristra 15 veces, hacemos una referencia
	 var creOpt = mod.helper.createPreferenceOption;

	 // Esto configurara el modal con 2 secciones, la primera con un group radio button,
	 // la segunda con un checkbox y un input text
	 return [
	 // Hacemos un header
	 creOpt({type: 'header', caption: 'Grupo de preferencias 1', subCaption: 'Preferencias de frecuencia'}),

	 // Metemos un par de radios
	 creOpt({
	 type: 'radio',
	 elements: [
	 {value: 10, caption: 'Cada 10 minutos'},
	 {value: 20, caption: 'Cada 20 minutos'},
	 {value: -1, caption: 'Manual', subCaption: 'Cuando se haga click en el boton'}
	 ],
	 caption: 'Frecuencia de actualizacion',
	 mapsTo: 'refreshFrequency'
	 }),

	 // Hacemos otro header para las preferencias personales
	 creOpt({type: 'header', caption: 'Preferencias personales', subCaption:'Porque a todos nos gusta sentirnos especiales'}),

	 // Metemos un checkbox
	 creOpt({type: 'checkbox', mapsTo: 'popUpEnabled', caption: 'Molestar con pop up'}),
	 // Y un text
	 creOpt({type: 'text', caption: 'Clave de tarjeta de credito', subCaption: 'Tranquilo, no se lo diremos a mucha gente', mapsTo: 'creditCard'})
	 ];
	 };
	 */

})(jQuery, SHURSCRIPT.moduleManager.createModule);
