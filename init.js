/*
Inicializa el objeto que contiene la aplicacion.
Lanza aplicacion cuando la página está cargada
*/

var SHURSCRIPT = {
    scriptVersion: '10.5'
};

jQuery(document).ready(function(){
    if (window.top === window) { // [xusoO] Evitar que se ejecute dentro de los iframes WYSIWYG
        SHURSCRIPT.initialize();
    }
});
