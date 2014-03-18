/*
 * Plantilla para la creación de módulos del Shurscript
 *
 * Notas:
 *	- El nombre del fichero .js debe ser IGUAL al nombre de la clase de este modulo (ModuleTemplate)
 *	- Usar el helper para los setValue/getValue en vez de los GM_setValue/GM_getValue
 */

function ModuleTemplate() {

	this.id = arguments.callee.name; //ModuleTemplate
	this.name = "Plantilla";
	this.author = "";
	this.version = "0.1";
	this.description = "";
	this.enabledByDefault = true; //Define si el modulo vendrá activado por defecto o no
	this.worksInFrontPage = false; // Modulo carga en portada

	var helper = new ScriptHelper(this.id);

	/* Declarar variables globales del módulo (var) */
	var foo = "bar";

	/* Define una condición a la carga del módulo. Si no se quiere condición, eliminar este metodo o devolver true. */
	this.shouldLoad = function () {
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
	this.load = function () {
		test();
	}

	this.getPreferences = function () {
		/*
		 * Definir los ajustes que serán configurables desde el panel de preferencias.
		 * Para más información, GitHub o leer el fichero ../preferences.js
		 */

		var preferences = [];
		var currentValue1 = helper.getValue("SETTING_KEY", "defaultValue");
		preferences.push(new TextPreference("SETTING_KEY", currentValue, "Title", "Description"));
		var radioOptions = [new RadioOption("option1", "First option title"), new RadioOption("option2", "Second option title"), new RadioOption("option3", "Third option title")];
		var currentValue2 = helper.getValue("SETTING_KEY_2", "option1");
		preferences.push(new RadioPreference("SETTING_KEY_2", currentValue2, radioOptions, "Title", "Description"));
		return preferences;

		/* No devolver nada o eliminar este método si no se quiere ninguna propiedad configurable */
	}

	/* Resto de métodos privados */
	function test() {
		helper.log("Cargado!");
	}

}

/* NO DECLARAR NADA FUERA DEL MODULO PARA EVITAR COLISIONES DE VARIABLES Y MÉTODOS */
