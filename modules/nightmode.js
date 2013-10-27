(function ($, createModule, createOption, undefined) {
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

    mod.onEagerStart = function () {
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
     * Este modulo debe cargar prematuramente
     */
    mod.eagerStartCheck = function () {return true;};

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
     * Guarda estado (encendido/apagado) en el navegador
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

    mod.getOptions = function () {
        return [
            createOption({type: 'checkbox', mapsTo: 'someAttribute', caption: 'caption', subCaption: 'jjiji'}),
            createOption({
                type: 'radio',
                elements: [
                    {value: 'value1', caption: 'Yo que se premoh'},
                    {value: 'value2', caption: 'aUUUUU', subCaption: 'au au au UUUUU'}
                ],
                caption: 'JOJOJOOJ',
                mapsTo: 'someAttribute[radio!]'
            }),
            createOption({type: 'text', caption: 'por usuarios', subCaption: 'separados por comas', mapsTo: 'ijijiji'}),
            createOption({type: 'header', caption: 'SOY UN PUTO HEADER', subCaption: 'blalblablalbalbalblablala'})
        ];
    };

})(jQuery, SHURSCRIPT.moduleManager.createModule, SHURSCRIPT.preferences.createOption);
