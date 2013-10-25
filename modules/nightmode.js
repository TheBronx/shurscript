(function ($, SHURSCRIPT, undefined) {
    'use strict';
    var mod = SHURSCRIPT.moduleManager.createModule({
        id: 'NightMode',
        name: 'Modo Noche',
        author: 'Juno / ikaros45',
        version: '0.1',
        description: 'Cambia la apariencia del foro a colores más oscuros. Perfecto para leer el foro por la noche sin cansar la vista. <b>BETA</b>'
    });

    mod.domain = 'ALL';
    mod.enabledByDefault = false;

    mod.load = function () {
        // Crea tag style y guardalo para luego
        var css = mod.helper.GM.getResourceText('nightmodecss');
        mod.styleTag = $('<style>' + css + '</style>');

        // Crea tag imagen y guarda
        mod.lightImg = $('<img width="24px" style="position: fixed; top: 2px; right: 0px; cursor: pointer;">');
        $('body').append(mod.lightImg);

        // Asigna eventos
        mod.lightImg.click(mod.toggle);

        // Enciende si la ultima vez estaba encendido
        if (mod.stateIsOn()) {
            mod.turnOn();
        } else {
            mod.turnOff();
        }

    };

    mod.toggle = function () {
        /*
         * Invierte estado
         */
        if (mod.stateIsOn()) {
            mod.turnOff();
        } else {
            mod.turnOn();
        }
    };

    mod.stateIsOn = function () {
        /*
         * Lee el ultimo estado guardado en el navegador
         */
        return mod.helper.getValue('ENABLED', false);
    };

    mod.setState = function (value) {
        /*
         * Guarda estado en el navegador
         */
        mod.helper.setValue('ENABLED', !!value);
    };

    mod.turnOn = function () {
        $('head').append(mod.styleTag);
        mod.lightImg.attr('src', 'https://github.com/TheBronx/shurscript/raw/experimental/img/light-on.png');
        mod.setState(true);
    };

    mod.turnOff = function () {
        mod.styleTag.remove();
        mod.lightImg.attr('src', 'https://github.com/TheBronx/shurscript/raw/experimental/img/light-off.png');
        mod.setState(false);
    };

})(jQuery, SHURSCRIPT);
