(function ($, SHURSCRIPT, undefined) {
    'use strict';

    var module = SHURSCRIPT.createModule({
        id: 'NightMode',
        name: 'Modo Noche',
        author: 'Juno / ikaros45',
        version: '0.1',
        description: 'Cambia la apariencia del foro a colores más oscuros. Perfecto para leer el foro por la noche sin cansar la vista. <b>BETA</b>'
    });

    module.domain = 'ALL';
    module.enabledByDefault = false;

    module.load = function () {
        module.helper.addStyle('nightmodecss');
        alert('mod night mode loaded');
    };


})(jQuery, SHURSCRIPT);
