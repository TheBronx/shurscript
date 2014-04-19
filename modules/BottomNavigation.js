function BottomNavigation() {
		
	this.id = arguments.callee.name; //ModuleID
	this.name = "Barra de navegación duplicada debajo";
	this.author = "TheBronx";
	this.version = "0.2";
	this.description = "Copia la tabla con la navegación en la parte inferior del foro.";
	this.enabledByDefault = true;


	var helper = new ScriptHelper(this.id);
	
	this.shouldLoad = function() {
		 return page == "/showthread.php" || page == "/newreply.php";
	}
	
	this.load = function() {
		jQuery('#qrform').before( '<table width="100%" cellspacing="1" cellpadding="5" border="0" align="center" class="tborder navigation-bot">'+
	    jQuery('.page>div>table').html()+'</table><br>' );
		//borramos las notificaciones de la barra de abajo
		jQuery('.navigation-bot .notifications').parent().remove();
		
		//borramos la barra de navegación inferior de ForoCoches [Fritanga]
		var duplicatedBottomBar = jQuery('.fjsel').closest('table.tborder');
		var quickJumpSelect = duplicatedBottomBar.find("div.smallfont").parent(); //Combo que permite saltar rapidamente a los subforos, esto lo mantenemos
		$(".tborder.navigation-bot .alt1").after(quickJumpSelect); //Lo añadimos a nuestra barra
		quickJumpSelect.addClass("alt1"); //Le damos el mismo estilo
		duplicatedBottomBar.remove(); //Y eliminamos la duplicada
	}
		
}
