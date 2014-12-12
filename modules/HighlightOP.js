(function ($, createModule, undefined) {
	'use strict';

	var mod = createModule({
		id: 'HighlightOP',
		name: 'Resaltar ciertos mensajes de un hilo',
		author: 'Electrosa',
		version: '1.1',
		description: 'Resalta tus mensajes, los mensajes del creador del hilo y los posts de los usuarios que elijas, ' +
			'para distingirlos mejor mientras navegas por los hilos.',
		domain: ['/showthread.php'],
		initialPreferences: {
			enabled: true,
			quotes: true,
			opPostsColor: '#DC143C',
			myPosts: false,
			myPostsColor: '#1E90FF',
			contacts: '',
			contactsColor: '#2FC726'
		},
		preferences: {}
	});

	mod.getPreferenceOptions = function () {
		var creOpt = mod.helper.createPreferenceOption;
		var f = function () {
			importBuddyList();
		};
		if (typeof exportFunction === 'function') {// Firefox 31+
			exportFunction(f, unsafeWindow, {defineAs: 'HighlightOP_importBuddyList'});
		} else {
			unsafeWindow.HighlightOP_importBuddyList = f;
		}

		return [
			creOpt({type: 'checkbox', mapsTo: 'quotes', caption: 'Resaltar también las citas.'}),
			creOpt({type: 'color', mapsTo: 'opPostsColor', caption: 'Color de resaltado de los posts del creador del hilo'}),
			creOpt({type: 'checkbox', mapsTo: 'myPosts', caption: 'Resaltar mis propios posts.'}),
			creOpt({type: 'color', mapsTo: 'myPostsColor', caption: 'Color de resaltado de mis posts'}),
			creOpt({type: 'tags', mapsTo: 'contacts', caption: 'Resaltar los posts de los siguientes usuarios (separados por comas)', buttons: true, plain: true, button1: '<a href="#" onclick="HighlightOP_importBuddyList(); return false;" class="btn btn-xs btn-default">Importar de la lista de contactos</a>'}),
			creOpt({type: 'color', mapsTo: 'contactsColor', caption: 'Color de resaltado de los posts de usuarios conocidos.'})
		];
	};

	mod.normalStartCheck = function () {
		return true;
	};

	var currentThread, currentPage;
	var nodes = [];
	var op, username, contacts;

	mod.onNormalStart = function () {
		currentThread = SHURSCRIPT.environment.thread.id;
		currentPage = SHURSCRIPT.environment.thread.page;
		username = mod.helper.environment.user.name.toLowerCase();
		contacts = mod.preferences.contacts.toLowerCase().split(/\s*,\s*/);

		// Add CSS rules
		GM_addStyle(".op_post, .op_quote { border: 1px solid " + mod.preferences.opPostsColor + " !important; border-left: 5px solid " + mod.preferences.opPostsColor + " !important; } .op_post td.alt2 { width: 171px; }");
		GM_addStyle(".my_post, .my_quote { border: 1px solid " + mod.preferences.myPostsColor + " !important; border-left: 5px solid " + mod.preferences.myPostsColor + " !important; } .my_post td.alt2 { width: 171px; }");
		GM_addStyle(".contacts_post, .contacts_quote { border: 1px solid " + mod.preferences.contactsColor + " !important; border-left: 5px solid " + mod.preferences.contactsColor + " !important; } .contacts_post td.alt2 { width: 171px; }");

		if (currentPage == 1) {
			op = getOpFrom(document.querySelector("#posts div.page"));
			sessionStorage["op_" + currentThread] = op;

			SHURSCRIPT.eventbus.on('parsePost', parsePost);
			addFindOpPosts();
		} else if (currentThread) {// If not in first page, we must load it to get OP's name.
			// Check if we have the OP's name saved from another time.
			if (sessionStorage["op_" + currentThread]) {
				op = sessionStorage["op_" + currentThread];
				SHURSCRIPT.eventbus.on('parsePost', parsePost);
				addFindOpPosts();
			} else {
				SHURSCRIPT.eventbus.on('parsePost', savePost);
				loadFirstPage(currentThread);
			}
		}
	};

	function parsePost(event, post) {
		highlight({'user': post.author.toLowerCase(), 'type': 'post', 'node': post.elementTable[0]});
		if (!post.ignored && mod.preferences.quotes) {
			var quotes = post.content[0].getElementsByClassName('alt2');
			for (var i = 0, n = quotes.length; i < n; i++) {
				var elem = quotes[i].getElementsByTagName("B");
				if (elem.length > 0) {
					highlight({'user': elem[0].textContent.toLowerCase(), 'type': 'quote', 'node': quotes[i]});
				}
			}
		}
	}

	function savePost(event, post) {
		if (op) {
			parsePost(event, post);
		} else {
			nodes.push({'user': post.author.toLowerCase(), 'type': 'post', 'node': post.elementTable[0]});
			if (!post.ignored && mod.preferences.quotes) {
				var quotes = post.content[0].getElementsByClassName('alt2');
				for (var i = 0, n = quotes.length; i < n; i++) {
					var elem = quotes[i].getElementsByTagName("B");
					if (elem.length > 0) {
						nodes.push({'user': elem[0].textContent.toLowerCase(), 'type': 'quote', 'node': quotes[i]});
					}
				}
			}
		}
	}

	function highlightSavedPosts() {
		addFindOpPosts();
		for (var i = 0, n = nodes.length; i < n; i++) {
			highlight(nodes[i]);
		}
	}

	/**
	 * Adds a link to find all OP's posts on this thread.
	 */
	function addFindOpPosts() {
		var tdNextNode = document.getElementById("threadtools");
		var trNode = tdNextNode.parentNode;
		var newTd = document.createElement("TD");
		newTd.className = 'vbmenu_control';
		newTd.innerHTML = '<a href="/foro/search.php?do=process&amp;searchthreadid=' + currentThread + '&amp;searchuser=' + escape(op) + '&amp;exactname=1">Buscar posts del OP</a>';
		trNode.insertBefore(newTd, tdNextNode);
	}

	function highlight(item) {
		switch (item.type) {
			case 'post':// Highlighted posts have "op_post" class
				if (item.user === op && item.user !== username) {
					item.node.classList.add("op_post");
				} else if (mod.preferences.myPosts && item.user === username) {
					item.node.classList.add("my_post");
				} else {
					for (var j = 0, m = contacts.length; j < m; j++) {
						if (item.user === contacts[j]) {
							item.node.classList.add("contacts_post");
							break;
						}
					}
				}
				break;
			case 'quote':// Highlighted quotes have "op_quote" class
				if (item.user === op && item.user !== username) {
					item.node.classList.add("op_quote");
				} else if (mod.preferences.myPosts && item.user === username) {
					item.node.classList.add("my_quote");
				} else {
					for (var j = 0, m = contacts.length; j < m; j++) {
						if (item.user === contacts[j]) {
							item.node.classList.add("contacts_quote");
							break;
						}
					}
				}
				break;
		}
	}

	function loadFirstPage(thread) {
		var xmlhttp = new XMLHttpRequest();

		// Get first page asynchronously
		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {// If no errors, parse received HTML and get OP's name
				var doc = new DOMParser().parseFromString(xmlhttp.responseText, "text/html");
				op = getOpFrom(doc.querySelector("#posts div.page"));
				sessionStorage["op_" + currentThread] = op;

				highlightSavedPosts();
			}
		};

		xmlhttp.open("GET", "showthread.php?t=" + thread, true);
		xmlhttp.send();
	}

	function getOpFrom(node) {
		var elem;

		if (elem = node.getElementsByClassName("bigusername")[0]) return elem.textContent.toLowerCase();

		// The user can be in the ignore list
		if (elem = node.querySelector("td.alt2 > a")) return elem.textContent.toLowerCase();

		// Error
		return null;
	}

	function importBuddyList() {
		var xmlhttp = new XMLHttpRequest();

		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
				var html = xmlhttp.responseText;
				var parser = new DOMParser();
				var doc = parser.parseFromString(html, "text/html");

				var elems = doc.getElementById("buddylist").getElementsByTagName("a");
				var contacts = [];

				for (var i = 0, n = elems.length; i < n; i++) {
					contacts.push(elems[i].textContent);
				}

				var newContactsList = contacts.join(', ');
				var oldContactsList = $("input[data-maps-to='contacts']").tokenfield('getTokensList', ',');

				if (contacts.length > 0) { // Si se han obtenido contactos de la importación
					if (oldContactsList) { // hay algo ya definido en el campo
						if (newContactsList !== oldContactsList) { // y la lista es diferente
							bootbox.confirm("<p>La lista actual se sobreescribirá con el nuevo listado que se obtenga de tu " +
									"<a href='/foro/profile.php?do=buddylist' target='_blank'>lista de contactos</a>.</p>" +
									"<p>¿Desea continuar?</p>",
								function (result) {
									if (result) {
										$("input[data-maps-to='contacts']").tokenfield('setTokens', newContactsList); // sobreescribe con la nueva lista
									}
								}
							);
						} else { // y la lista es igual a la anterior
							bootbox.alert("No hemos detectado cambios en tu <a href='/foro/profile.php?do=buddylist' target='_blank'>lista de contactos</a> " +
								"desde la última importación. Realiza cambios en tus contactos antes de volver a intentarlo.");
						}
					} else {
						$("input[data-maps-to='contacts']").tokenfield('setTokens', newContactsList);
					}
				} else { // en caso contrario, avisa al usuario de que no existen contactos
					bootbox.alert("Tu <a href='/foro/profile.php?do=buddylist' target='_blank'>lista de contactos</a> está vacía. " +
						"Para resaltar los mensajes de tus contactos... ¡primero añade algunos!");
				}
			}
		};

		xmlhttp.open("GET", "/foro/profile.php?do=buddylist&nojs=1", true);
		xmlhttp.send();
	}
})(jQuery, SHURSCRIPT.moduleManager.createModule);
