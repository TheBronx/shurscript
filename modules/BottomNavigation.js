(function ($, createModule, undefined) {
	'use strict';

	var mod = createModule({
		id: 'bottomNavigation',
		name: 'Barra de navegación duplicada debajo',
		author: 'TheBronx & Fritanga',
		version: '1.0',
		description: 'Copia la tabla con la navegación a la parte inferior del foro.',
		domain: ['/showthread.php','/newreply.php']
	});

	/**
	* Activamos modo de carga normal (aunque viene activo por defecto)
	* aqui se podrian hacer comprobaciones adicionales. No es nuestro caso
	*/
	mod.normalStartCheck = function () {return true;};


	/**
	* Sobreescribimos la funcion de ejecucion
	*/
	mod.onNormalStart: function () {
		$('#qrform').before( '<table width="100%" cellspacing="1" cellpadding="5" border="0" align="center" class="tborder navigation-bot">'+
		$('.page>div>table').html()+'</table><br>' );
		//borramos las notificaciones de la barra de abajo
		$('.navigation-bot .notifications').parent().remove();
		
		//borramos la barra de navegación inferior de ForoCoches [Fritanga]
		var duplicatedBottomBar = $('.fjsel').closest('table.tborder');
		var quickJumpSelect = duplicatedBottomBar.find("div.smallfont").parent(); //Combo que permite saltar rapidamente a los subforos, esto lo mantenemos
		$(".tborder.navigation-bot .alt1").after(quickJumpSelect); //Lo añadimos a nuestra barra
		quickJumpSelect.addClass("alt1"); //Le damos el mismo estilo
		duplicatedBottomBar.remove(); //Y eliminamos la duplicada
	};

})(jQuery, SHURSCRIPT.moduleManager.createModule);
