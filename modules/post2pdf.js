/**
* Post2PDF para ShurScript permite exportar cualquier tema de FC a un archivo PDF gracias a las librerías jsPDF
*/
(function ($, createModule, undefined) {
'use strict';
	var mod = createModule({
		id: 'post2pdf',
		name: 'Post2PDF',
		author: 'RubDev',
		version: '0.1',
		description: 'Permite exportar el contenido de un tema en ForoCoches a PDF para descargarlo posteriormente',
		domain: ['/showthread.php'],
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

	//Inicializamos el módulo jsPDF

	var doc = new jsPDF();

	//Creamos un pequeño botón para exportar a PDF justo al lado del contador de citas

	$(".page table td.alt2[nowrap]").first().parent().append('<td style="padding: 0px;" class="alt2"><div class="pdfbox">Exportar PDF</div></td>');

	$('.pdfbox').click(function () {

	//Excluimos objetos que no interesa exportar

		var specialElementHandlers = {
			'#div-970x90': function(element, renderer){
			return true;
			}
		};

	//Generamos el archivo PDF

		doc.fromHTML($('body').get(0), 15, 15, {
			'width': 170, 
			'elementHandlers': specialElementHandlers
		});
		
		doc.output('dataurlnewwindow');     //Abrimos el PDF en una nueva ventana ya renderizado
	}
})(jQuery, SHURSCRIPT.moduleManager.createModule);