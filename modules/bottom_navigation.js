/*
Modulo Shurscript
@id: BottomNavigation
@name: Barra de navegación duplicada debajo
@author: TheBronx
@version: 0.1
@description: Copia la tabla con la navegación en la parte inferior del foro
*/

function BottomNavigation() {
		
	var helper = new ScriptHelper("BottomNavigation");
	
	this.shouldLoad = function() {
		 return page == "/showthread.php" || page == "/newreply.php";
	}
	
	this.load = function() {
		jQuery('#qrform').before( '<table width="100%" cellspacing="1" cellpadding="5" border="0" align="center" class="tborder navigation-bot">'+
	    jQuery('.page>div>table').html()+'</table><br>' );
		//borramos las notificaciones de la barra de abajo
		jQuery('.navigation-bot .notifications').parent().remove();
	}
		
}