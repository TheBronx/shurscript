/*
 Modulo Shurscript
 @id: BottomNavigation
 @name: Barra de navegación duplicada debajo
 @author: xusoo
 @version: 0.1
 @description: Copia la tabla con la navegación en la parte inferior del foro
 */

function FixedMenubar() {

	this.id = arguments.callee.name; //ModuleID
	this.name = "Barra de menú fija";
	this.author = "xusoo";
	this.version = "0.1";
	this.description = "La barra de navegación, junto con la información del usuario y las notificaciones aparecerá siempre arriba siguiendo el scroll del usuario.";

	var helper = new ScriptHelper(this.id);
	var floating = false;
	var startingTop;
	var headers, userpanel, toolbar, threadToolbar;

	this.shouldLoad = function () {
		return true;
	}

	this.getPreferences = function () {

	}

	this.load = function () {

		headers = $(".page > div > .tborder");
		userpanel = $(headers[0]);
		toolbar = $(headers[1]);
		threadToolbar = $(headers[2]);

		toolbar.css("padding", 0);

		var userinfo = userpanel.find(".alt2 > div.smallfont");
		var html = userinfo.html();
		if (html.indexOf("<br>") != -1) {
			var minHTML = html.replace(html.substring(html.indexOf("<br>"), html.indexOf("<div>")), "").trim()
			userinfo.html(minHTML); //Quitamos texto sobrante para reducir el tamaño de la barra "Tu última visita:..."
		}
		if ($(".notifications")) {
			$(".notifications").css("padding", "3px 15px"); //Reducir tamaño de las notificaciones
		}

		userpanel.wrap("<div style='height:" + userpanel.height() + "px'></div>");
		toolbar.wrap("<div style='height:" + toolbar.height() + "px'></div>");

		toolbar = toolbar.find("table");

		var threadTools = threadToolbar.find(".vbmenu_control");
		toolbar.find("tr").first().append("<td class='vbmenu_control' width=100%");
		toolbar.find("tr").first().append(threadTools);

		startingTop = headers.offset().top;

		$(window).on("scroll", function () {
			if (window.scrollY > startingTop) {
				if (!floating) {
					undockToolbar();
				}
				if ($("#notificationsBox")) {
					$("#notificationsBox").hide();
				}
			} else if (floating) {
				dockToolbar();
			}
		});

		if (window.scrollY > startingTop) {
			undockToolbar();
		}

	}

	function undockToolbar() {

		var style = "position: fixed; width: auto; margin-right: 5px;";

		userpanel.attr("style", style);
		userpanel.css("top", "0");

		toolbar.attr("style", style + "border-bottom: 1px solid gray;");
		toolbar.css("top", "50px");

		floating = true;

	}

	function dockToolbar() {

		userpanel.attr("style", "");

		toolbar.attr("style", "");

		floating = false;
	}

};
