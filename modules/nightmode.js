(function ($, createModule, environment, undefined) {
    'use strict';

    var mod = createModule({
        id: 'nightMode',
        name: 'Modo Noche',
        author: 'Juno / ikaros45',
        version: '0.2',
        description: 'Cambia la apariencia del foro a colores más oscuros. ' +
                     'Perfecto para leer el foro por la noche sin cansar la' +
                     ' vista. <b>BETA</b>'
    });

    mod.domain = 'ALL';
    mod.enabledByDefault = false;

    mod.onStart = function () {
        // Crea tag style y guardalo para luego
        var css = mod.helper.getResourceText('nightmodecss');
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

    /**
     * Invierte estado
     */
    mod.toggle = function () {
        if (mod.stateIsOn()) {
            mod.turnOff();
        } else {
            mod.turnOn();
        }
    };

    /**
     * Lee el ultimo estado guardado en el navegador
     */
    mod.stateIsOn = function () {
        return mod.helper.getValue('ENABLED', false);
    };

    /**
     * Guarda estado en el navegador
     */
    mod.setState = function (value) {
        mod.helper.setValue('ENABLED', value);
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

})(jQuery, SHURSCRIPT.moduleManager.createModule, SHURSCRIPT.env);
