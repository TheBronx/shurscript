(function ($, createModule, undefined) {
	'use strict';

	var mod = createModule({
		id: 'imagehack',
		name: 'Hack imágenes',
		author: 'RubDev',
		version: '0.1',
		description: 'Permite que las imagenes no desajusten el foro en su totalidad adaptándose a la anchura del navegador.',
		domain: 'ALL',
		initialPreferences: {
			enabled: true
		},
		preferences: {}
	});
GM.addStyle('img {max-width:99%} ');
)(jQuery, SHURSCRIPT.moduleManager.createModule);