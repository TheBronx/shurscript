/**
 * Namespace de la aplicacion e informacion basica
 */

var SH = {
//    GreaseMonkey: {
//        registerMenuCommand: GM_registerMenuCommand,
//        addStyle: GM_addStyle,
//        getResourceText: GM_getResourceText,
//        getResourceURL: GM_getResourceURL
//    },
    config: {
        server: "http://cloud.shurscript.org:8080/"
    },
    environment: {
        page: location.pathname.replace("/foro", "")
    }
};
