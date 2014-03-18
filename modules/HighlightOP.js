(function ($, createModule, undefined) {
	'use strict';
	
	var mod = createModule({
		id: 'HighlightOP',
		name: 'Resaltar mensajes míos y del creador del hilo',
		author: 'Electrosa',
		version: '1.0',
		description: 'Resalta dentro de un hilo, los mensajes que has escrito tú y el creador del hilo, con un borde a la izquierda.',
		domain: ['/showthread.php'],
		initialPreferences: {
			enabled: true,
			opPostsColor: '#DC143C',
			myPosts: false,
			myPostsColor: '#1E90FF',
			quotes: true
		},
		preferences: {}
	});
	
	mod.getPreferenceOptions = function () {
		var creOpt = mod.helper.createPreferenceOption;
		
		return [
				creOpt({type: 'text', mapsTo: 'opPostsColor', caption: 'Color de resaltado de los posts del creador del hilo'}),// color
				creOpt({type: 'checkbox', mapsTo: 'myPosts', caption: 'Resaltar también mis propios posts.'}),
				creOpt({type: 'text', mapsTo: 'myPostsColor', caption: 'Color de resaltado de mis posts'}),// color
				creOpt({type: 'checkbox', mapsTo: 'quotes', caption: 'Resaltar también las citas.'})
			];
	};
	
	mod.normalStartCheck = function () {
		return true;
	};
	
	var currentThread, currentPage;
	
	mod.onNormalStart = function () {
		currentThread = getCurrentThread();
		currentPage = getCurrentPage();
		
		if (currentPage == 1) {
			var op = getOpFrom(document.querySelector("#posts div.page"));
			sessionStorage["op_" + currentThread] = op;
			
			highlightOP(op);
		} else if (currentThread) {// If not in first page, we must load it to get OP's name.
			// Check if we have the OP's name saved from another time.
			if (sessionStorage["op_" + currentThread]) {
				highlightOP(sessionStorage["op_" + currentThread]);
			} else {
				loadFirstPage(currentThread);
			}
		}
	};
	
	
	function loadFirstPage(thread) {
		var xmlhttp = new XMLHttpRequest();
		
		// Get first page asynchronously
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {// If no errors, parse received HTML and get OP's name
				var html = xmlhttp.responseText;
				var parser = new DOMParser();
				var doc = parser.parseFromString(html, "text/html");
				
				var op = getOpFrom(doc.querySelector("#posts div.page"));
				sessionStorage["op_" + currentThread] = op;
				highlightOP(op);
			}
		};
		
		xmlhttp.open("GET", "showthread.php?t=" + thread, true);
		xmlhttp.send();
	}
	
	function getOpFrom(node) {
		var elem;
		
		if (elem = node.getElementsByClassName("bigusername")[0]) return elem.innerHTML;
		
		// The user can be in the ignore list
		if (elem = node.querySelector("td.alt2 > a")) return elem.innerHTML;
		
		// Error
		return null;
	}

	function highlightOP(op) {
		if (! op) { console_log("ERROR"); return; }
		
		var username = mod.helper.environment.user.name;
		
		// Add CSS rules
		GM_addStyle(".op_post, .op_quote { border: 1px solid " + mod.preferences.opPostsColor + " !important; border-left: 5px solid " + mod.preferences.opPostsColor + " !important; } .op_post td.alt2 { width: 171px; }");
		GM_addStyle(".my_post, .my_quote { border: 1px solid " + mod.preferences.myPostsColor + " !important; border-left: 5px solid " + mod.preferences.myPostsColor + " !important; } .my_post td.alt2 { width: 171px; }");
		
		// Highlighted posts have "op_post" class
		var users = document.getElementsByClassName("bigusername");
		
		for (var i = 0, n = users.length; i < n; i++) {
			var currentUser = users[i].innerHTML;
			
			if (currentUser === op && currentUser !== username) {
				users[i].parentNode.parentNode.parentNode.parentNode.parentNode.classList.add("op_post");
			}
			
			if (mod.preferences.myPosts && currentUser === username) {
				users[i].parentNode.parentNode.parentNode.parentNode.parentNode.classList.add("my_post");
			}
		}
		
		// Highlighted quotes have "op_quote" class
		if (mod.preferences.quotes) {
			var quotes = document.getElementsByClassName("alt2");
			
			for (var i = 0, n = quotes.length; i < n; i++) {
				var elem = quotes[i].getElementsByTagName("B");
				
				if (elem && elem.length > 0) {
					var quotedUser = elem[0].innerHTML;
				
					if (quotedUser === op && currentUser !== username) {
						quotes[i].classList.add("op_quote");
					}
					
					if (mod.preferences.myPosts && quotedUser === username) {
						quotes[i].classList.add("my_quote");
					}
				}
			}
		}
		
		// Add a link to find all OP's posts on this thread.
		var tdNextNode = document.getElementById("threadtools");
		var trNode = tdNextNode.parentNode;
		
		var newTd = document.createElement("TD");
		newTd.className = 'vbmenu_control';
		newTd.innerHTML = '<a href="/foro/search.php?do=process&searchthreadid=' + currentThread + '&searchuser=' + escape(op) + '&exactname=1">Buscar posts del OP</a>';
		
		trNode.insertBefore(newTd, tdNextNode);
	}
	
	function getURLParameter(name) {
		return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))
			|| null;
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
})(jQuery, SHURSCRIPT.moduleManager.createModule);
