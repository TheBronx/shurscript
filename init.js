/**
 * Namespace de la aplicacion e informacion basica
 */
var SH = (function ($, undefined) {
    'use strict';

    var SH = {
    //    GreaseMonkey: {
    //        registerMenuCommand: GM_registerMenuCommand,
    //        addStyle: GM_addStyle,
    //        getResourceText: GM_getResourceText,
    //        getResourceURL: GM_getResourceURL
    //    },
        config: {
            server: "http://cloud.shurscript.org:8081/"
        },
        environment: {
            page: location.pathname.indexOf("/foro") !== -1 ? location.pathname.replace("/foro", "") : "frontpage",
            browser: {
                name: navigator.userAgent
            }
        }
    };

    // Saca por regexps id
    var id_regex_results = /userid=(\d*)/.exec($('body').html());

    // Si el usuario no está logueado, aborta.
    if (!id_regex_results) {throw 'Usuario no logueado';}

    var userid = id_regex_results[1];

    var username;
    if (SH.environment.page === "frontpage") {
        username = $(".cajascat td.cat:nth-child(1)").text().substr(3);
    } else {
        username = $(".smallfont a[href='member.php?u=" + userid + "']").first().text();
    }

    SH.environment.user = {
        owner: userid,
        name: username
    };

    return SH;

})(jQuery);
