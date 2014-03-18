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
	var seconds, totalSeconds;
	var cancelar = false;

	mod.onNormalStart = function () {
		if (location.href.indexOf("/search.php?do=") === -1) return;

		// Obtener el elemento que contiene el tiempo que se ha de esperar
		if (document.title === "ForoCoches") {
			elementCountDown = document.getElementsByClassName('panel')[0].childNodes[1].childNodes[3];
		} else {
			elementCountDown = document.querySelectorAll("td.alt1 ol li")[0];
		}

		// Obtener los segundos a partir del elemento
		var str = elementCountDown.innerHTML;

		if (str) {
			var n = str.length;
			seconds = parseInt(str.substring(n - 12, n - 9));

			if (!isNaN(seconds)) {
				totalSeconds = parseInt(str.substring(23, 26));

				setTimeout(updateCountDown, 967);
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
			location.href += "&ts=" + new Date().getTime();
		}
	}

	function cancel() {
		elementCountDown.innerHTML = "Debes esperar al menos " + totalSeconds + " segundos entre cada búsqueda. Faltan aún " + seconds + " segundos. [ Recarga automática desactivada ]";

		seconds = 288;
		cancelar = true;
	}

	function updateCountDown() {
		if (cancelar) return;

		seconds--;

		if (seconds > 0) {
			var enlace = $("<a href='#'>Cancelar</a>").click(function () {
				cancel();
				return false;
			});

			elementCountDown.innerHTML = "Debes esperar al menos " + totalSeconds + " segundos entre cada búsqueda. Faltan aún " + seconds + " segundos. &mdash; ";
			$(elementCountDown).append(enlace);

			setTimeout(updateCountDown, 967);
		} else {
			var enlace = $("<a href='#'>Refrescar</a>").click(function () {
				refresh();
				return false;
			});

			elementCountDown.innerHTML = "Cargando… &mdash; ";
			$(elementCountDown).append(enlace);

			refresh();
		}
	}
})(jQuery, SHURSCRIPT.moduleManager.createModule);
