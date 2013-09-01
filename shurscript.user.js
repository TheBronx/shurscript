// Shur Scripts SA
// GPLv2 Licensed
// http://www.gnu.org/licenses/gpl-2.0.html
//
// ==UserScript==
// @name			ShurScript
// @description		Script para ForoCoches
// @namespace		http://shurscript.es
// @version			0.10-dev
// @author			TheBronx
// @author			xusoO
// @author			Fritanga
// @include			*forocoches.com/foro/*
// @require			http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js
// @require			http://netdna.bootstrapcdn.com/bootstrap/3.0.0-wip/js/bootstrap.min.js
// @require			https://github.com/TheBronx/shurscript/raw/dev/plugins/bootbox.js
// @require			https://github.com/TheBronx/shurscript/raw/dev/plugins/Markdown.Converter.js
// @require			https://github.com/TheBronx/shurscript/raw/dev/modules/Quotes.js
// @require			https://github.com/TheBronx/shurscript/raw/dev/modules/NestedQuotes.js
// @require			https://github.com/TheBronx/shurscript/raw/dev/modules/BetterPosts.js
// @require			https://github.com/TheBronx/shurscript/raw/dev/modules/BottomNavigation.js
// @require			https://github.com/TheBronx/shurscript/raw/dev/modules/FavouriteThreads.js
// @require			https://github.com/TheBronx/shurscript/raw/dev/modules/Scrollers.js
// @require			https://github.com/TheBronx/shurscript/raw/dev/AutoUpdater.js
// @require			https://github.com/TheBronx/shurscript/raw/dev/preferences.js
// @require			https://github.com/TheBronx/shurscript/raw/dev/settings_window.js
// @resource bootstrapcss https://github.com/TheBronx/shurscript/raw/dev/css/bootstrap.css
// @resource scroller-img https://github.com/TheBronx/shurscript/raw/dev/img/scroller.png
// @grant	GM_log
// @grant	GM_getValue
// @grant	GM_setValue
// @grant	GM_deleteValue
// @grant	GM_xmlhttpRequest
// @grant	GM_registerMenuCommand
// @grant	GM_addStyle
// @grant 	GM_getResourceText
// @grant 	GM_getResourceURL
// ==/UserScript==

var helper;
var allModules = []; //Todos los modulos
var activeModules = []; //Los que tiene activados el usuario
var AutoUpdater;

/* Variables útiles y comunes a todos los módulos */
var page; //Página actual (sin http://forocoches.com/foro ni parámetros php)
var username;
var userid;
var scriptVersion;


jQuery(document).ready(function(){
	if (window.top != window) { // [xusoO] Evitar que se ejecute dentro de los iframes WYSIWYG
		return;
	}
	
	initialize();
	
	if (isCompatible()) {
		loadModules();
	}
	
	AutoUpdater = new AutoUpdater();
	AutoUpdater.check();
});

function isCompatible() {
	//Comprobamos que está soportada la extensión y de paso recogemos la version del script actual.
	if (typeof GM_info != 'undefined' ) { //GreaseMonkey, TamperMonkey, ...
		scriptVersion = GM_info.script.version
	} else if (typeof GM_getMetadata != 'undefined') { //Scriptish
		scriptVersion = GM_getMetadata('version');
	} else {
		bootbox.alert('El addon de scripts de tu navegador no está soportado.');
		return false;
	}
	return true;
}

function initialize() {

	helper = new ScriptHelper();
	
	//inicializamos variables
	page = location.pathname.replace("/foro","");
	
	GM_addStyle(GM_getResourceText('bootstrapcss'));
	
	//Recogemos nombre e ID de usuario
	var user = jQuery(".alt2 > .smallfont > strong > a[href*='member.php?u=']").first();
	username = user.text();
	userid = user.attr("href").match(/\?u\=(\d*)/)[1];
	
	//Configuracion de las ventanas modales
	bootbox.setDefaults({
	    locale: "es",
	    className: "shurscript",
	    closeButton: false
	  });
	  
}

function loadModules() {

	var modules = getAllModules();
			
	var active = getActiveModules();
		
	for (var i = 0; i < modules.length; i++) {
		var moduleName = modules[i].trim();
		try {
			module = eval("new " + moduleName + "()");
			//module = new this[moduleName];
			if (!module) {
				helper.log ("Module '" + moduleName + "' not found.");
			} else {
				
				if (active[moduleName] == true || ((typeof active[moduleName] == 'undefined') && module.enabledByDefault)) { //Activado por el usuario o por defecto
					if (!module.shouldLoad || module.shouldLoad()) {
						helper.log("Loading module '" + moduleName + "'...");
						module.load();
						helper.log ("Module '" + moduleName + "' loaded successfully.");
					}
					activeModules.push(module);
				}
				allModules.push(module);
				
			}
		} catch (e) {
			helper.log ("Failed to load module '" + moduleName + "'\nCaused by: " + e);
		}
	}
		
}

/*
* Obtener los modulos cargados de los @require
*/
function getAllModules() {
	var modules = [];
	if (typeof GM_info != 'undefined' ) {
		var metas = GM_info.scriptMetaStr.split("// @");
		var meta;
		for (var i = 0; i < metas.length; i++) {
			meta = metas[i].trim();
			if (meta.indexOf("require") == 0 && meta.match("/modules/")) {
				var moduleName = meta.match(/modules\/(.*)\.js/)[1];
				modules.push(moduleName);
			}
		}
	} else if (typeof GM_getMetadata != 'undefined') { //Scriptish
		var requires = GM_getMetadata('require');
		for (var i = 0; i < requires.length; i++) {
			if (requires[i].match("/modules/")) {
				var moduleName = requires[i].match(/modules\/(.*)\.js/)[1];
				modules.push(moduleName);
			}
		}
	}
	
	return modules;
}

/*
* Obtienes los modulos que tiene activados el usuario {"modulo1" : true, "modulo2" : false, etc.}
*/
function getActiveModules() {
	var activeModules = helper.getValue("MODULES");
	if (activeModules) {
		try {
			activeModules = JSON.parse(activeModules);
		} catch (e){
			activeModules = {};
			helper.deleteValue("MODULES");
		}
	} else {
		activeModules = {};
	}
	
	return activeModules;
}


/* Metodos de ayuda comunes a todos los módulos. */
function ScriptHelper(moduleName) {
	this.moduleName = moduleName;
}

ScriptHelper.prototype.log = function(message) {
	console.log("[SHURSCRIPT]" + (this.moduleName ? (" [Modulo " + this.moduleName + "] ") : " ") + new Date().toLocaleTimeString() + ": " + message)
}

ScriptHelper.prototype.setValue = function(key, value) {
	GM_setValue("SHURSCRIPT_" + (this.moduleName ? this.moduleName + "_" : "") + key + "_" + userid, value);
}

ScriptHelper.prototype.getValue = function(key, defaultValue) {
	return GM_getValue("SHURSCRIPT_" + (this.moduleName ? this.moduleName + "_" : "") + key + "_" + userid, defaultValue);
}

ScriptHelper.prototype.deleteValue = function(key) {
	GM_deleteValue("SHURSCRIPT_" + (this.moduleName ? this.moduleName + "_" : "") + key + "_" + userid);
}
