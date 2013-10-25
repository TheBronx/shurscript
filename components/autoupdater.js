//
//function AutoUpdater() {
//	var hours = 1, //Buscar actualizaciones cada hora
//      time = new Date().getTime();
//
//	this.check = function(force) {
//    	if (force) {
//        	call(true);
//        } else if (+time > (+helper.getValue('AUTO_UPDATE', 0) + 1000*60*60*hours)) {
//        	helper.setValue('AUTO_UPDATE', time+'');
//        	call(false);
//        }
//    }
//
//    function call(response) {
//        GM_xmlhttpRequest({
//            method: 'GET',
//            url: 'https://github.com/TheBronx/shurscript/raw/master/shurscript.user.js',
//            onload: function(xpr) {compare(xpr, response);}
//        });
//    }
//
//    function compare(xpr,response) {
//        var xversion=/\/\/\s*@version\s+(.+)\s*\n/i.exec(xpr.responseText);
//        var xname=/\/\/\s*@name\s+(.+)\s*\n/i.exec(xpr.responseText);
//
//        if (xversion) {
//            xversion = xversion[1];
//            xname = xname[1];
//        } else {
//            if (xpr.responseText.match('the page you requested doesn\'t exist'))
//            	helper.setValue('AUTO_UPDATE', 'off');
//            return false;
//        }
//
//
//        if (scriptVersion.indexOf("-dev") != -1) { //Si estamos en una version de desarrollo, actualizamos si es igual (0.09-dev -> 0.09) o superior.
//        	updated = xversion >= scriptVersion.replace("-dev", "");
//        } else {
//        	updated = xversion > scriptVersion;
//        }
//
//        if ( updated ) {
//        	var url = 'https://github.com/TheBronx/shurscript/raw/master/CHANGELOG.md';
//	        GM_xmlhttpRequest({ //Obtenemos el changelog
//	            method: 'GET',
//	            url: url,
//	            onload: function(resp) {
//	            	changelog = parseChangelog(resp.responseText, xversion, url.replace('raw', 'blob'));
//	            	bootbox.dialog({
//	            			message:'<h4>Hay disponible una nueva versión (' + xversion + ') del Shurscript.</h4><p><br></p>' + changelog,
//	            			buttons:[{
//								"label" : "Más tarde",
//								"className" : "btn-default"
//								}, {
//								"label" : "Actualizar",
//								"className" : "btn-primary",
//								"callback": function() {
//										bootbox.hideAll();
//										location.href = 'https://github.com/TheBronx/shurscript/raw/master/shurscript.user.js';
//									}
//								}]
//							}
//					);
//				}
//
//	        });
//        } else if (!updated && response) {
//            bootbox.alert('No hay actualizaciones disponibles del Shurscript');
//        }
//
//    }
//
//    function parseChangelog(changelog, version, fallbackURL) {
//    	try {
//	    	version = version.replace(".", "\\.");
//
//	    	changelog = changelog.match(RegExp("##[#]? v" + version + ".*([\\s\\S]*?(?=---))"))[1].trim(); //Obtenemos el trozo correspondiente a la version que buscamos
//
//	    	changelog = new Markdown.Converter().makeHtml(changelog); //Convertimos de Markdown a HTML
//
//	    	return changelog;
//	    } catch (e) {
//		    return "Haz clic <a target='_blank' href='" + fallbackURL + "'>aquí</a> para ver los cambios de esta versión.";
//	    }
//    }
//
//}
