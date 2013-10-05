(function ($, SHURSCRIPT, undefined) {
    'use strict';

    /*
    Crea un módulo llamando a SHURSCRIPT.createModule(), pasandole un objeto
    con los parámetros necesarios.
    */
    var module = SHURSCRIPT.createModule({
        id: 'ID modulo',
        name: 'Nombre modulo',
        author: 'Autor',
        version: 'Version',
        description: 'Descripcion'
    });

    /*
    Propiedades heredadas que puedes querer sobreescribir
    =====================================================
    - .enabledByDefault: true por defecto
    - .additionalLoadCheck(): devuelve true por defecto. Sobreescribe si necesitas alguna condicion especial de carga
    - .moduleDomain: string o array de strings con identificadores de pagina sin el "/foro":
        - 'NOT_FRONTPAGE': el modulo funciona en todo forocoches salvo la portada (VALOR POR DEFECTO)
        - 'ALL': el modulo funciona en todo forocoches
        - '/': Sólo portada
        - '/search.php': Sólo si estamos en www.forocoches.com/foro/search.php...
        - ['/showthread.php', '/'] Vista de un hilo y portada
    - getPreferences()

    Elementos utiles del closure y del objeto modulo
    ================================================
    - $: jQuery local
    - SHURSCRIPT: nucleo aplicacion
    - SHURSCRIPT.env: informacion sobre el entorno (pagina, usuario, etc)
    - self.helper: objeto helper personalizado para el módulo. Tiene una referencia
      a GM, el objeto con los metodos de greasemonkey
    - undefined: undefined fiable, puedes comparar con el sin hacer un typeof



    Define todas las propiedades y métodos que necesites. Variables/funciones
    declarados en este scope serán visibles desde cualquier metodo del modulo.
    */

    // Metodo obligatorio. Puerta de entrada logica al modulo.
    module.load = function () {

    };


})(jQuery, SHURSCRIPT);
