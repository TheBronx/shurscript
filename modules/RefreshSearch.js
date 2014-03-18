function RefreshSearch() {
	this.id = arguments.callee.name;
	this.name = "Actualizar búsquedas en espera";
	this.author = "Electrosa";
	this.version = "1.0";
	this.description = "Recarga automáticamente las búsquedas en las que el sistema obliga a esperar varios segundos, evitando así tener que actualizar manualmente la página.";
	this.enabledByDefault = true;

	var helper = new ScriptHelper(this.id);

	var elementCountDown;// objeto de tipo HTML DOM Text
	var seconds, totalSeconds;

	this.shouldLoad = function () {
		return location.toString().indexOf("/search.php?do=") !== -1;// page == "/search.php?do=process"
	}

	this.load = function () {
		// Obtener el elemento que contiene el tiempo que se ha de esperar
		if (document.title == "ForoCoches") {
			elementCountDown = document.getElementsByClassName('panel')[0].childNodes[1].childNodes[3].childNodes[0];
		} else {
			elementCountDown = document.querySelectorAll("td.alt1 ol li")[0].childNodes[0];
		}

		// Obtener los segundos a partir del elemento
		var str = elementCountDown.textContent;

		if (str) {
			var n = str.length;
			seconds = parseInt(str.substring(n - 12, n - 9));

			if (!isNaN(seconds)) {
				totalSeconds = parseInt(str.substring(23, 26));

				setTimeout(updateCountDown, 967);
			}
		}
	}

	function refresh() {
		if (location == "http://www.forocoches.com/foro/search.php?do=process") {
			// Reenviar el formulario (actualizar la página causa que el navegador muestre el típico mensaje al reenviar un formulario por POST)
			document.getElementById("searchform").submit();
		} else {
			//window.location.reload(true);
			// A veces el navegador recoge la página de caché, con esto se consigue que la URL sea distinta
			window.location += "&ts=" + new Date().getTime();
		}
	}

	function updateCountDown() {
		seconds--;

		if (seconds > 0) {
			elementCountDown.textContent = "Debes esperar al menos " + totalSeconds + " segundos entre cada búsqueda. Faltan aún " + seconds + " segundos.";
			setTimeout(updateCountDown, 967);
		} else {
			elementCountDown.textContent = "Cargando...";
			refresh();
		}
	}
}
