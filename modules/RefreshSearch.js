function RefreshSearch() {
    this.id = arguments.callee.name;
    this.name = "Actualizar búsquedas en espera";
    this.author = "Electrosa";
    this.version = "1.1";
    this.description = "Recarga automáticamente las búsquedas en las que el sistema obliga a esperar varios segundos, evitando así tener que actualizar manualmente la página.";
    this.enabledByDefault = true;
    
    var helper = new ScriptHelper(this.id);
    
    var elementCountDown;// objeto de tipo HTML LI Element
    var seconds, totalSeconds;
    var cancelar = false;
    
    this.shouldLoad = function () {
        return location.href.indexOf("/search.php?do=") !== -1;// page == "/search.php?do=process"
    }
    
    this.load = function () {
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
            
            if (! isNaN(seconds)) {
                totalSeconds = parseInt(str.substring(23, 26));
                
                setTimeout(updateCountDown, 967);
            }
        }
    }
    
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
            elementCountDown.innerHTML = "Debes esperar al menos " + totalSeconds + " segundos entre cada búsqueda. Faltan aún " + seconds + " segundos. [ <a href='#' onclick='cancel(); return false;'>cancelar</a> ]";
            setTimeout(updateCountDown, 967);
        } else {
            elementCountDown.innerHTML = "Cargando… [ <a href='#' onclick='refresh(); return false;'>recargar</a> ]";
            refresh();
        }
    }
} 
