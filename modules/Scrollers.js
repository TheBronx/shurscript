
function Scrollers() {

	this.id = arguments.callee.name; //ModuleTemplate
	this.name = "Scroll arriba y abajo";
	this.author = "xusoo";
	this.version = "0.1";
	this.description = "Aparecerán dos flechas en la parte inferior del foro; una para volver al principio de la página y la otra para ir al final.";
	this.enabledByDefault = true; //Define si el modulo vendrá activado por defecto o no
		
	var helper = new ScriptHelper(this.id);

	this.load = function() {
	
		var side = helper.getValue('SIDE', 'right');
	
		GM_addStyle('#scrollers {\
						opacity: 0.5;\
						bottom: 5px;\
						' + side + ': 13px;\
						position: fixed;\
					}');
		GM_addStyle('#scrollers:hover {\
						opacity: 0.9;\
					}');
		GM_addStyle('.scrollerArrow {\
						background: url("' + GM_getResourceURL('scroller-img') + '") no-repeat scroll 0 0 transparent;\
						background-size: 50px;\
						cursor: pointer;\
						height: 50px;\
						width: 50px;\
						display: inline-block;\
						margin: 5px;\
						opacity: 0.4;\
					}');
		GM_addStyle('.scrollerArrow:hover {\
						opacity: 0.7;\
					}');
		
		GM_addStyle('.scrollerArrow#scrollToBottomArrow {\
						transform: rotate(180deg);\
					}');
	
		var container = $("<div id='scrollers'></div>");
		var topArrow = $("<div class='scrollerArrow' id='scrollToTopArrow'></div>");
		topArrow.click(function(){$('html, body').stop().animate({scrollTop: '0px'}, 800)});
		var bottomArrow = $("<div class='scrollerArrow' id='scrollToBottomArrow'></div>");
		bottomArrow.click(function(){$('html, body').stop().animate({scrollTop: $("html").height() + 'px'}, 800)});
		
		var upOrDown = helper.getValue('UP_OR_DOWN', 'both');
		if (upOrDown == 'up') {
			container.append(topArrow);
		} else if (upOrDown == 'down') {
			container.append(bottomArrow);
		} else {
			container.append(bottomArrow).append(topArrow);
		}
		
		$(document.body).append(container);
		
	}
	
	this.getPreferences = function() {
	
		var preferences = [];
		
		var upOrDown = [new RadioOption("both", "Ambas flechas"), new RadioOption("up", "Solo la de ir al principio"), new RadioOption("down", "Solo la de ir al final")];
		preferences.push(new RadioPreference("UP_OR_DOWN", "both", upOrDown, "Mostrar:"));
		
		var side = [new RadioOption("left", "A la izquierda"), new RadioOption("right", "A la derecha")];
		preferences.push(new RadioPreference("SIDE", "right", side, "Alinear:"));
		
		return preferences;
	}
		
}
