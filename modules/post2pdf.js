function ($, createModule, undefined) {
	'use strict';

	var mod = createModule({
		id: 'Post2Pdf',
		name: 'Convertir tema a PDF',
		author: 'RubDev',
		version: '0.2',
		description: 'Permite convertir el post en un PDF.',
		domain: ['/showthread.php'],
		initialPreferences: {
			enabled: true
		},
		preferences: {}
	});

var doc = new jsPDF();
//Creamos un pequeño botón para exportar a PDF
$(".page table td.alt2[nowrap]").first().parent().append('<td style="padding: 0px;" class="alt2"><div class="pdfbox">Exportar PDF</div></td>');
$('.pdfbox').click(function () {
/*Este código lo podemos usar para obviar ciertas secciones del foro que no queremos que salgan en el renderizado del HTML
// We'll make our own renderer to skip this editor
var specialElementHandlers = {
	'#editor': function(element, renderer){
		return true;
	}
};
*/
//Generamos
doc.fromHTML($('body').get(0), 15, 15, {
	'width': 170, 
	'elementHandlers': specialElementHandlers
});
doc.output('dataurlnewwindow');     //Abrimos el PDF en una nueva ventana ya renderizado
}