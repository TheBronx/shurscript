// Shur Scripts SA
// GPLv2 Licensed
// http://www.gnu.org/licenses/gpl-2.0.html
//
// ==UserScript==
// @name			ShurScript
// @description		Script para ForoCoches
// @namespace		http://shurscript.es
// @version			0.07
// @author			TheBronx
// @author			xusoO
// @author			Fritanga
// @include			*forocoches.com/foro/*
// @require			http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js
// @require			https://github.com/TheBronx/shurscript/raw/dev/modules/citas.js
// @require			https://github.com/TheBronx/shurscript/raw/dev/modules/bottom_navigation.js
// @require			https://github.com/TheBronx/shurscript/raw/dev/modules/nested_quotes.js
// @require			https://github.com/TheBronx/shurscript/raw/dev/modules/favourite_threads.js
// @require			https://github.com/TheBronx/shurscript/raw/dev/modules/auto_updater.js
// @grant	GM_log
// @grant	GM_getValue
// @grant	GM_setValue
// @grant	GM_deleteValue
// @grant	GM_xmlhttpRequest
// @grant	GM_registerMenuCommand
// @grant	GM_addStyle
// @history 0.00 first version.
// ==/UserScript==

var helper;

/* Variables útiles y comunes a todos los módulos */
var page; //Página actual (sin http://forocoches.com/foro ni parámetros php)
var username;
var userid;


jQuery(document).ready(function(){
	if (window.top != window) { // [xusoO] Evitar que se ejecute dentro de los iframes WYSIWYG
		return;
	}
	
	initialize();
	loadModules();
});

function initialize() {

	helper = new ScriptHelper();
	
	//inicializamos variables
	page = location.pathname.replace("/foro","");
	
	//Recogemos nombre e ID de usuario
	username = jQuery("a[href*='member.php']").first().text();
	userid = jQuery("a[href*='member.php']").first().attr("href").replace("member.php?u=", "");

}

function loadModules() {
	var activeModules = "Citas;BottomNavigation;FavouriteThreads;AutoUpdater";
/* 	var activeModules = "Citas;BottomNavigation;AutoUpdater"; */
	var modulesArray = activeModules.split(";");
	var moduleName;
	for (i = 0; i < modulesArray.length; i++) {
		moduleName = modulesArray[i].trim();
		try {
			module = eval("new " + moduleName + "()");
/* 			module = new this[moduleName]; */
			if (!module) {
				helper.log ("Module '" + moduleName + "' not found.");
			} else {
				if (!module.shouldLoad || module.shouldLoad()) {
					helper.log("Loading module '" + moduleName + "'...");
					module.load();
					helper.log ("Module '" + moduleName + "' loaded successfully.");
				}
			}
		} catch (e) {
			helper.log ("Fail to load module '" + moduleName + "'\nCaused by: " + e);
		}
	}
	
}


/* Metodos de ayuda comunes a todos los módulos. */
function ScriptHelper(moduleName) {

	this.moduleName = moduleName;

	this.log = function(message) {
		console.log("[SHURSCRIPT]" + (moduleName ? (" [Modulo " + moduleName + "] ") : " ") + new Date().toLocaleTimeString() + ": " + message)
	}
	
	this.setValue = function(key, value) {
		GM_setValue("SHURSCRIPT_" + (moduleName ? moduleName + "_" : "") + key + "_" + userid, value);
	}
	
	this.getValue = function(key, defaultValue) {
		return GM_getValue("SHURSCRIPT_" + (moduleName ? moduleName + "_" : "") + key + "_" + userid) || defaultValue;
	}
	
	this.deleteValue = function(key) {
		GM_deleteValue("SHURSCRIPT_" + (moduleName ? moduleName + "_" : "") + key + "_" + userid);
	}

}

