/**
* ImageHack es un pequeño módulo que adapta el máximo de anchura de la imagen al 99% del visor de tu navegador
*/
(function ($, createModule, undefined) {
'use strict';
	var mod = createModule({
		id: 'imagehack',
		name: 'Hack para imágenes',
		author: 'RubDev',
		version: '0.1',
		description: 'Permite adaptar las imágenes excepcionalmente grandes al tamaño máximo del navegador del usuario, sin descuadrar el foro.',
		domain: 'ALL',
		initialPreferences: {
			enabled: true, // Esta es opcional - por defecto true

							}
	});
	mod.normalStartCheck = function () {return true;};
	/**
	* Funcion a la que se llama en si .normalStartCheck ha dado true
	*
	* Principal puerta al modulo. Normalmente toda la logica empieza aqui
	*/
	mod.onNormalStart = function () {};

	//MiniHack CSS activado

		addStyle('img {max-width:99%} ');

)(jQuery, SHURSCRIPT.moduleManager.createModule);