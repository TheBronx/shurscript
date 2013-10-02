function NightMode() {

    this.id = arguments.callee.name;
    this.name = 'NightMode';
    this.author = 'ikaros45 / Juno';
    this.version = '0.11';
    this.description = 'Cambia tema a colores oscuros';
    this.enabledByDefault = true; //Define si el modulo vendrá activado por defecto o no
    this.worksInFrontPage = true; // Modulo carga en portada

    var helper = new ScriptHelper(this.id);

    /* Método obligatorio y punto de entrada a la lógica del módulo */
    this.load = function() {

        // Carga CSS
        var css = GM_getResourceText('nightmodecss');

        // Incluyelo en head
        $('<style id="nightmode-style">' + css + '</style>').appendTo('head');

    };
}