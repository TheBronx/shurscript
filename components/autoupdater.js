/**
 * Se encarga de comprobar en el arranque del script si existe una nueva versión del mismo
 */
(function ($, SHURSCRIPT, undefined) {
	'use strict';

	var autoupdater = SHURSCRIPT.core.createComponent('autoupdater');

	var updateInterval = 1000 * 60 * 60, //Buscar actualizaciones cada hora
	    currentTime,
	    url = 'https://github.com/TheBronx/shurscript/raw/master/';

	/**
    * Lanza la comprobación de actualizaciones si ha pasado una hora desde la última comprobación
    * @param {bool} force: Forzar comprobar actualizaciones aunque no haya pasado el tiempo necesario desde la última actualización
    * @param {function} callback: Se ejecutará cuando termine de comprobar actualizaciones (si ha pasado el tiempo denecesario o si se pasa el parametro force)
    */
	autoupdater.check = function(force, callback) {
		currentTime = new Date().getTime();
		var lastUpdate = parseInt(autoupdater.helper.getLocalValue('LAST_SCRIPT_UPDATE', 0), 10);
		if (force || currentTime > (lastUpdate + updateInterval)) {
			autoupdater.helper.setLocalValue('LAST_SCRIPT_UPDATE', currentTime.toString());
			checkUpdates(function(updated) {
				if (updated) {
					showChangelog(version);
				}
				if (typeof callback === "function") {
					callback(updated);
				}
			});
		}
		
	};

	/**
	* Punto de entrada
	*/
	autoupdater.load = function() {
		autoupdater.check(false);
	}

	/**
	* Descarga la última versión estable liberada y comprueba contra la versión actual instalada
	*/
	function checkUpdates(callback) {
		SHURSCRIPT.GreaseMonkey.xmlhttpRequest({
			method: 'GET',
			url: url + 'shurscript.user.js?' + currentTime,
			onload: function(xpr) {
				var version = /\/\/\s*@version\s+(.+)\s*\n/i.exec(xpr.responseText)[1];
				var updated = compare(SHURSCRIPT.scriptVersion, version);
				callback(updated, version);
			}
		});
	}

	/**
	* Compara una versión con otra.
	* Si estamos en una rama dev/exp, y encontramos la misma versión ya liberada también cuenta como actualización (0.09-dev -> 0.09)
	*/
	function compare(currentVersion, newVersion) {
		var updated;
		if (SHURSCRIPT.scriptBranch !== "master") {
			updated = newVersion >= currentVersion;
		} else {
			updated = newVersion > currentVersion;
		}
		return updated;
	}

	/**
	* Recupera el changelog de la nueva versión y lo muestra en una ventana con botones para actualizar o cancelar
	*/
	function showChangelog(version) {
		var changelogUrl = url + 'CHANGELOG.md?' + currentTime;
		SHURSCRIPT.GreaseMonkey.xmlhttpRequest({
			method: 'GET',
			url: changelogUrl,
			onload: function(resp) {
				var changelog = parseChangelog(resp.responseText, version, changelogUrl.replace('raw', 'blob'));
				bootbox.dialog({
					message: '<h4>Hay disponible una nueva versión (' + version + ') del Shurscript.</h4><p><br></p>' + changelog,
					buttons: [{
							label : "Más tarde",
							className : "btn-default"
						}, {
							label : "Actualizar",
							className : "btn-primary",
							callback: function() {
								bootbox.hideAll();
								location.href = url + 'shurscript.user.js?' + currentTime;
							}
						}]
					}
				);
			}

		});
	}

	/**
	* Coge solo el changelog de la versión que nos interesa y transforma el Markdown a HTML
	* @param changelog: Fichero de changelog completo (todas las versiones)
	* @param version: Versión de la que queremos sacar el changelog
	* @param fallbackURL: Si algo falla, URL en la que podrá ver el usuario los cambios de esta versión
	*/
	function parseChangelog(changelog, version, fallbackURL) {
		try {
			version = version.replace(/\./g, "\\.");
			changelog = changelog.match(RegExp("##[#]? v" + version + ".*([\\s\\S]*?(?=---))"))[1].trim(); //Obtenemos el trozo correspondiente a la version que buscamos
			changelog = new Markdown.Converter().makeHtml(changelog); //Convertimos de Markdown a HTML
			return changelog;
		} catch (e) {
			return "Haz clic <a target='_blank' href='" + fallbackURL + "'>aquí</a> para ver los cambios de esta versión.";
		}
	}

})(jQuery, SHURSCRIPT);