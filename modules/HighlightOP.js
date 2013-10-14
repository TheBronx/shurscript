function HighlightOP() {
    this.id = arguments.callee.name; //ModuleTemplate
    this.name = "Resaltar al creador del hilo";
    this.author = "Electrosa";
    this.version = "0.1";
    this.description = "Resalta los mensajes que ha escrito el creador del hilo.";
    this.enabledByDefault = true;
    this.worksInFrontPage = false;

    var helper = new ScriptHelper(this.id);

    /* Define una condición a la carga del módulo. Si no se quiere condición, eliminar este metodo o devolver true. */
    this.shouldLoad = function() {
        return page === "/showthread.php";
    }

    /* Método obligatorio y punto de entrada a la lógica del módulo */
    this.load = function() {
        var currentThread = getURLParameter("t") || getCurrentThread();
        var currentPage = getURLParameter("page") || getCurrentPage();
        
        // If not in first page, we must load it to get OP's name.
        if (currentPage && currentPage !== 1) {
            loadFirstPage(currentThread);
        } else {
            highlightOP(null);
        }
    }
    
    function loadFirstPage(thread) {
        var xmlhttp = new XMLHttpRequest();
        
        // Get first page asynchronously
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {// If no errors, parse received HTML and get OP's name
                var html = xmlhttp.responseText;
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, "text/html");
                
                highlightOP(doc.getElementsByClassName("bigusername")[0].innerHTML);
            }
        };
        
        xmlhttp.open("GET", "showthread.php?t=" + thread, true);
        xmlhttp.send();
    }

    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))
            || null;
    }

    function highlightOP(op) {
        var users = document.getElementsByClassName("bigusername");
        
        if (! op) {
            op = users[0].innerHTML;
        }
        
        // Add CSS rule
        GM_addStyle(".op_post, .op_quote { background-color: #B1D4D7; }");
        
        // Highlighted posts have "op_post" class
        for (var i = 0, n = users.length; i < n; i++) {
            var currentUser = users[i].innerHTML;
            
            if (currentUser === op) {
                users[i].parentNode.parentNode.classList.add("op_post");
            }
        }
        
        // Highlighted quotes have "op_quote" class
        var quotes = document.getElementsByClassName("alt2");
        
        for (var i = 0, n = quotes.length; i < n; i++) {
            var elem = quotes[i].getElementsByTagName("B");
            
            if (elem && elem.length > 0) {
                var quotedUser = elem[0].innerHTML;
            
                if (quotedUser === op) {
                    quotes[i].classList.add("op_quote");
                }
            }
        }
    }

    function getCurrentPage() {
        return $("div.pagenav:first-child span strong").html();
    }
    
    function getCurrentThread() {
        var href = $("#threadtools_menu form > table tr:last a").attr("href");
        
        if (href.indexOf("subscription") !== -1) {
            return parseInt(href.replace("subscription.php?do=addsubscription&t=", ""), 10);
        } else {
            return parseInt(href.replace("poll.php?do=newpoll&t=", ""), 10);
        }
    }
}
