(function ($, SHURSCRIPT, undefined) {
	'use strict';

	var templater = SHURSCRIPT.core.createComponent('templater'),
		store = {};

	templater.storeTemplate = function (tempName, tempText) {
		store[tempName] = {
			tempName: tempName,
			tempText: tempText,
			compiled: false
		};
	};

	/**
	 * Devuelve la plantilla con los valores insertados
	 */
	templater.fillOut = function (tempName, data) {

		var template = store[tempName];

		// Asegurate de que esta compilado
		if (!template.compiled) {
			templater.compile(tempName);
		}

		try {
			return store[tempName].tempFn(data);
		} catch (e) {
			templater.helper.throw('Error insertando valores en la plantilla:', e);
		}
	};

	/**
	 * Compila un template ya guardado
	 * @param {string} tempName
	 */
	templater.compile = function (tempName) {

		var template = store[tempName];

		if (template.compiled) {
			return;
		}

		try {
			template.tempFn = new Function("obj",
				"var p=[],print=function(){p.push.apply(p,arguments);};" +

					// Introduce the data as local variables using with(){}
					"with(obj){p.push('" +

					// Convert the template into pure JavaScript
					template.tempText
						.replace(/[\r\t\n]/g, " ")
						.split("<%").join("\t")
						.replace(/((^|%>)[^\t]*)'/g, "$1\r")
						.replace(/\t=(.*?)%>/g, "',$1,'")
						.split("\t").join("');")
						.split("%>").join("p.push('")
						.split("\r").join("\\'") + "');}return p.join('');");

			template.compiled = true;
		} catch (e) {
			templater.helper.throw('Error compilando template [' + tempName + ']: ', e);
		}
	};

})(jQuery, SHURSCRIPT);
