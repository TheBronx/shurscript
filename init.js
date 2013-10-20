/*
Inicializa el objeto que contiene la aplicacion.
Lanza aplicacion cuando la página está cargada
*/

var SHURSCRIPT = {
    scriptVersion: '10.5',
    GreaseMonkey: {
        log: GM_log,
        getValue: GM_getValue,
        setValue: GM_setValue,
        deleteValue: GM_deleteValue,
        xmlhttpRequest: GM_xmlhttpRequest,
        registerMenuCommand: GM_registerMenuCommand,
        addStyle: GM_addStyle,
        getResourceText: GM_getResourceText,
        getResourceURL: GM_getResourceURL
    },
    /**
     * Crea un namespace dentro de SHURSCRIPT pasandole un string de forma 'SHURSCRIPT.nombreNameSpace'
     * o simplemente 'nombreNameSpace'
     */
    createNameSpace: function (ns) {
        var segments = ns.split('.'),
            parent = SHURSCRIPT,
            nameNS;

        // Si se ha pasado SHURSCRIPT, quitalo del medio
        if (segments[0] === 'SHURSCRIPT') {
            segments = segments.slice(1);
        }

        $.each(segments, function (index, nameNS) {
            // Inicializa si no existe
            parent[nameNS] = parent[nameNS] || {};

            // Referencia para el siguiente ciclo (pseudorecursividad)
            parent = parent[nameNS];
        });

        return parent;
    }
};

jQuery(document).ready(function(){
    if (window.top === window) { // [xusoO] Evitar que se ejecute dentro de los iframes WYSIWYG
        SHURSCRIPT.core.initialize();
    }
});
