(function ($, createModule, undefined) {
	'use strict';

	var mod = createModule({
		id: 'RefreshSearch',
		name: 'Actualizar búsquedas en espera',
		author: 'Electrosa',
		version: '0.2',
		description: 'Recarga automáticamente las búsquedas en las que el sistema obliga a esperar varios segundos, evitando así tener que actualizar manualmente la página.',
		domain: ['/search.php'],
		initialPreferences: {
			enabled: true
		},
		preferences: {}
	});

	mod.normalStartCheck = function () {
		return true;
	};

	var elementCountDown;// objeto de tipo HTML_LI_Element
	var seconds, totalSeconds;// tiempo restante y tiempo a esperar total
	var timeoutId;// identificador del timeout que realiza la cuenta atrás

	mod.onNormalStart = function () {
		if (location.href.indexOf("/search.php?do=") !== -1) {
			// Obtener el elemento que contiene el tiempo que se ha de esperar
			if (document.title === "ForoCoches") {
				elementCountDown = document.getElementsByClassName('panel')[0].childNodes[1].childNodes[3];
			} else {
				elementCountDown = document.querySelector("td.alt1 ol li");
			}

			// Obtener los segundos a partir del elemento
			var str = elementCountDown.textContent;
			var index = str.indexOf("segundos");

			if (index !== -1) {
				totalSeconds = ~~(str.substring(index - 3, index));// ~~: to int

				index = str.indexOf("segundos", index + 1);
				seconds = ~~(str.substring(index - 3, index));

				var timePageLoaded = performance.timing.responseStart;// tiempo en el que el servidor comenzó a enviar la página
				var timeNextRefresh = timePageLoaded + 1000 * seconds;
				var msRestantes = timeNextRefresh - new Date();

				timeoutId = setTimeout(updateCountDown, msRestantes % 1000);
				seconds = ~~(msRestantes / 1000);
			}
		} else {
			var inputs = document.getElementsByName('query');
			if (inputs.length === 4) {
				inputs[2].focus();
			}
		}
	};

	function refresh() {
		if (location.href === "http://www.forocoches.com/foro/search.php?do=process") {
			// Reenviar el formulario (actualizar la página causa que el navegador muestre el típico mensaje al reenviar un formulario por POST)
			document.getElementById("searchform").submit();
		} else {
			//window.location.reload(true);
			// A veces el navegador recoge la página de caché, con esto se consigue que la URL sea distinta
			location.replace(location.href + "&ts=" + new Date().getTime());
		}
	}

	function cancel() {
		elementCountDown.textContent = "Debes esperar al menos " + totalSeconds + " segundos entre cada búsqueda. Faltan aún " + seconds + " segundos. [ Recarga automática desactivada ]";

		if (timeoutId) {
			clearTimeout(timeoutId);
		}
	}

	function updateCountDown() {
		seconds--;

		var enlace;

		if (seconds > 0) {
			enlace = document.createElement("a");
			enlace.href = "#";
			enlace.textContent = "Cancelar";
			enlace.onclick = function () {
				cancel();
				return false;
			};

			elementCountDown.textContent = "Debes esperar al menos " + totalSeconds + " segundos entre cada búsqueda. Faltan aún " + seconds + " segundos. — ";
			elementCountDown.appendChild(enlace);

			timeoutId = setTimeout(updateCountDown, 1000);
		} else {
			enlace = document.createElement("a");
			enlace.href = "#";
			enlace.textContent = "Refrescar";
			enlace.onclick = function () {
				refresh();
				return false;
			};

			elementCountDown.textContent = "Cargando… — ";
			elementCountDown.appendChild(enlace);

			refresh();
		}
	}
})(jQuery, SHURSCRIPT.moduleManager.createModule);
