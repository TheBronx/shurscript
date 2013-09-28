function NightMode() {

    this.id = arguments.callee.name; //ModuleTemplate
    this.name = 'NightMode';
    this.author = 'ikaros45 / Juno';
    this.version = '0.1';
    this.description = 'Cambia tema a colores oscuros';
    this.enabledByDefault = false; //Define si el modulo vendrá activado por defecto o no
    this.worksInFrontPage = true; // Modulo carga en portada

    var helper = new ScriptHelper(this.id);

    /* Define una condición a la carga del módulo. Si no se quiere condición, eliminar este metodo o devolver true. */
    this.shouldLoad = function() {
        return true;
    };

    /* Método obligatorio y punto de entrada a la lógica del módulo */
    this.load = function() {

        // Carga CSS
        var css = GM_getResourceText('nightmodecss');

        // Incluyelo en head
        $('<style id="nightmode-style">' + css + '</style>').appendTo('head');

    };
}