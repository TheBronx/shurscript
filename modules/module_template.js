/*
Modulo Shurscript
@id: ModuleID
@name:
@author:
@version: 
@description:
*/

function ModuleID() {
		
	var helper = new ScriptHelper("ModuleID");
	
	/* Declarar variables globales del módulo (var) */
	var foo = "bar";

	/* Define una condición a la carga del módulo. Si no se quiere condición, eliminar este metodo.*/
	this.shouldLoad = function() {
		/*
			Ejemplos:
			
			return page == "/showthread.php"; //Cargar solo el modulo cuando estemos en /showthread.php?...
			
			o
			
			return (Date.now() - myLastLoadTime) > 60000 //Cargar solo si hace más de un minuto desde la última carga
			
			Si este metodo devuelve false no se llamara al metodo load()
		*/
		 
		 return true;
	}
	
	/* Método obligatorio y punto de entrada a la lógica del módulo */
	this.load = function() {
		stuff();
	}
	
	/* Resto de métodos privados */
	function stuff() {
		helper.log("Cargado!");
	}
	
}


/* NO DECLARAR NADA FUERA DEL MODULO PARA EVITAR COLISIONES DE VARIABLES Y MÉTODOS */