function HighlightOP() {
    this.id = arguments.callee.name;
    this.name = "Resaltar al creador del hilo";
    this.author = "Electrosa";
    this.version = "1.0";
    this.description = "Resalta los mensajes que ha escrito el creador del hilo.";
    this.enabledByDefault = true;
    this.worksInFrontPage = false;

    var helper = new ScriptHelper(this.id);
    
    var currentThread, currentPage;
    
    this.shouldLoad = function() {
        return page === "/showthread.php";
    }
    
    this.load = function() {
        currentThread = getCurrentThread();
        currentPage = getCurrentPage();
        
        // If not in first page, we must load it to get OP's name.
        if (currentPage === 1) {
            highlightOP(null);
        } else if (currentThread) {
            // Check if we have the OP's name saved from another time.
            if (sessionStorage["op_" + currentThread]) {
                highlightOP(sessionStorage["op_" + currentThread]);
            } else {
                loadFirstPage(currentThread);
            }
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
                
                var username = doc.getElementsByClassName("bigusername")[0].innerHTML;
                sessionStorage["op_" + currentThread] = username;
                highlightOP(username);
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
            sessionStorage["op_" + currentThread] = op;
        }
        
        // Add CSS rule
        GM_addStyle(".op_post, .op_quote { background-color: #B1D4D7; }");
        GM_addStyle(".my_post, .my_quote { border: 3px solid blue !important; border-radius: 5px; }");
        
        // Highlighted posts have "op_post" class
        for (var i = 0, n = users.length; i < n; i++) {
            var currentUser = users[i].innerHTML;
            
            if (currentUser === op) {
                users[i].parentNode.parentNode.classList.add("op_post");
            }
            
            if (currentUser === username) {
                users[i].parentNode.parentNode.parentNode.parentNode.parentNode.classList.add("my_post");
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
                
                if (quotedUser === username) {
                    quotes[i].classList.add("my_quote");
                }
            }
        }
    }

    function getCurrentPage() {
        var r;
        
        if (r = getURLParameter("page")) return r;
        if (r = document.getElementById("showthread_threadrate_form")) return r.page.value;
        if (r = $("div.pagenav:first-child span strong")[0]) return r.html();
        
        return -1;
    }
    
    function getCurrentThread() {
        var r;
        
        if (r = unsafeWindow.threadid) return r;
        if (r = getURLParameter("t")) return r;
        if (r = document.getElementById("qr_threadid")) return r.t.value;
        
        return null;
    }
}
