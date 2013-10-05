(function ($, SHURSCRIPT, self, undefined) {
    'use strict';

    /*
    Utiliza el objecto self para escribir tu módulo

    Propiedades por definir
    =====================
    - self.id
    - self.name
    - self.author
    - self.version
    - self.description

    Propiedades heredadas que puedes querer sobreescribir
    =====================================================
    - self.enabledByDefault: true por defecto
    - self.additionalLoadCheck(): devuelve true por defecto. Sobreescribe si necesitas alguna condicion especial de carga
    - self.validPages: array con identificadores de pagina sin el "/foro":
        /!\ Si el modulo funciona en todas las páginas, no toques esta propiedad
        - "/": portada
        - "/search.php": si estamos en www.forocoches.com/foro/search.php...
        - "/showthread.php:" si estamos viendo un hilo


    Elementos utiles del closure, heredados o generados en el objeto
    ================================================================
    - $: jQuery local
    - SHURSCRIPT: nucleo aplicacion
    - self._helper: objeto helper personalizado para el módulo. Tiene una referencia
      a GM, el objeto con los metodos de greasemonkey
    - undefined: undefined fiable, puedes comparar con él sin hacer un typeof
    */

    // self.id = 'NightMode';
    self.name = 'Modo noche';
    self.author = 'ikaros45 / juno';
    self.version = '0.1';
    self.description = 'Cambia la apariencia del foro a colores más oscuros. Perfecto para leer el foro por la noche sin cansar la vista. <b>BETA</b>';

    // Guarda en aplicacion
    SHURSCRIPT.modules[self.id] = self;

})(jQuery, SHURSCRIPT, Object.create(SHURSCRIPT.protoModule));

/*
function NightMode() {

    this.id = arguments.callee.name; //ModuleTemplate
    alert(this.id);
    this.name = 'Modo noche';
    this.author = 'ikaros45 / Juno';
    this.version = '0.1';
    this.description = 'Cambia la apariencia del foro a colores más oscuros. Perfecto para leer el foro por la noche sin cansar la vista. <b>BETA</b>';
    this.enabledByDefault = true; //Define si el modulo vendrá activado por defecto o no
    this.worksInFrontPage = true; // Modulo carga en portada

    var helper = new ScriptHelper(this.id);
    var css, icon;

    this.load = function() {

        // Carga CSS
        css = GM_getResourceText('nightmodecss');

        // Incluyelo en head
        if (helper.getValue('SHOW_ICON', true)) {
            icon = $("<img width='24px' style='position: fixed; top: 2px; right: 0px; cursor: pointer;'>");

            if (helper.getValue('ENABLED', false)) {
                enableNightMode();
            } else {
                disableNightMode();
            }

            icon.click(function(){
                if (helper.getValue('ENABLED', false)) {
                    disableNightMode();
                } else {
                    enableNightMode();
                }
            });
            $(document.body).append(icon);

        } else {
            enableNightMode();
        }

    };

    var enableNightMode = function() {
        if (icon) {
            helper.setValue('ENABLED', true);
            icon.attr('src', GM_getResourceURL('nightmode-off'));
            icon.attr('title', 'Desactivar modo noche');
        }
        $('<style id="nightmode-style">' + css + '</style>').appendTo('head');
    };

    var disableNightMode = function() {
        if (icon) {
            helper.setValue('ENABLED', false);
            icon.attr('src', GM_getResourceURL('nightmode-on'));
            icon.attr('title', 'Activar modo noche');
        }
        $("#nightmode-style").remove();
    };

    this.getPreferences = function() {
        var preferences = [];

        preferences.push(new BooleanPreference("SHOW_ICON", true, "<b>Mostrar un icono pequeño arriba a la derecha del foro para activar/desactivar el modo noche rápidamente.</b> Si desmarcas esta opción, tendrás que venir aquí cada vez para activar o desactivar el modo noche."));

        return preferences;
    };
}
*/