(function ($, SHURSCRIPT, undefined) {
	'use strict';

	var self = {};

	self.html = SHURSCRIPT.helper.GM.getResource('modalhtml');
	alert(self.html);

})(jQuery, SHURSCRIPT);

/*
//Creamos el nuevo menú arriba a la derecha
var menuItem = $('.vbmenu_control').first();
var newMenuItem = menuItem.clone();
newMenuItem.css("cursor", "pointer");
newMenuItem.html("<a>Shurscript</a>");
newMenuItem.click(function(){
	new SettingsWindow();
});
menuItem.parent().append(newMenuItem);

function SettingsWindow() {

	var panels = [];

	var modal = $();

	modal.on('hidden.bs.modal', function () {
	  modal.remove(); //Eliminarla al cerrar
	});

	modal.on('shown.bs.modal', function () {
	  	var contentWindow = modal.find(".modal-body");
		var preferences
		for (var i = 0; i < allModules.length; i++) {
			var modulePanel = new ModulePanel(allModules[i]);
			panels.push(modulePanel);
			contentWindow.append(modulePanel.get()); //Añadimos los modulos que tengan alguna preferencia configurada
		}
	});

	$(document.body).append(modal);

	modal.find("button#save-settings").click(function() {
		save();
		modal.modal('hide');
		window.location.reload();
	});

	modal.find(".modal-body").css("height", $(window).height() - 210);

	modal.modal();
	$(".modal-backdrop").css("z-index", 1010); //Para no superponerse a la de los alerts

	//Añadir boton de actualizar al título
	var updateButton = $('<button style="position:absolute;margin-left:15px;" class="btn btn-default btn-sm">Comprobar actualizaciones</button>');
	updateButton.click(function(){
		AutoUpdater.check(true);
	});
	$("#shurscript-settings-window .modal-title").append(updateButton);

	function ModulePanel(module) {

		this.module = module;

		var helper = new ScriptHelper(this.module.id);

		var preferences;
		var form;

		var panel;

		var settingsButton;
		var preferencesPanel;


		panel = $('<div class="panel">\
				  <div class="panel-heading">\
				    <h3 class="panel-title">' + module.name + '</h3>\
				  </div>' + ((module.description && module.description != "") ? '<\div class="panel-body"><p>' + module.description + '</p></div>' : '') + '</div>');
		//<form class="module-settings" id="' + modules[i].id + '"  name="' + modules[i].id + '" class="form-horizontal" disabled></form>\

		var enableCheck = $('<input style="float: right;" class="module-enable-check" type="checkbox" name="enabled"/>');
		var enabled = activeModules[module.id];
		if (enabled) {
			enableCheck.attr("checked", "");
		} else {
			panel.addClass("disabled-module");
		}
		enableCheck.click(function() {
			enabled = this.checked == true;
			if (enabled) {
				if (settingsButton) {
					settingsButton.removeAttr("disabled");
				}
				panel.removeClass("disabled-module");
			} else {
				if (preferencesPanel) { //Ocultamos el formulario
					preferencesPanel.slideUp(200);
				}
				if (settingsButton) {
					settingsButton.removeClass('active');
					settingsButton.attr("disabled", "");
				}
				panel.addClass("disabled-module");
			}
		});

		panel.find(".panel-heading").prepend(enableCheck);

	    preferences = module.getPreferences && module.getPreferences();
	    preferences = $(preferences);
	    if (preferences.length > 0) {

	    	var preferencesPanel = $("<div></div>");
	    	preferencesPanelBody = $("<div class='panel-body'></div>");

	    	preferencesPanel.append("<hr style='margin:0'>");
	    	preferencesPanel.append(preferencesPanelBody);

	    	form = $('<form/>');
	    	preferencesPanelBody.append(form);
			form.append(getHTMLFromPreferences(preferences));

			panel.append(preferencesPanel);
			preferencesPanel.hide(); //Se mostrara con el botón


	    	settingsButton = $('<button type="button" data-toggle="button" style="float:right; margin: -23px 24px;" class="btn btn-default btn-sm">Opciones</button>');
			panel.find(".panel-heading").append(settingsButton);
			if (!enabled) {
				settingsButton.attr("disabled", "");
			}
			settingsButton.click(function() {
				preferencesPanel.slideToggle(200);

			});

		}

		function getHTMLFromPreferences(preferences) {
			var html = '';
			for (var j = 0; j < preferences.length; j++) {
				if (preferences[j] instanceof SectionPreference) {
					html += '<h4 style="border-bottom: 1px solid lightgray">' + preferences[j].title + '</h4>';
					html += preferences[j].description;
					html += "<div style='padding:20px;'>";
					html += getHTMLFromPreferences(preferences[j].subpreferences);
					html += "</div>";
				} else {
					var currentValue = helper.getValue(preferences[j].key);
					html += preferences[j].getHTML(currentValue);
					if (j != preferences.length - 1) html += '<hr>';
				}
			}
			return html;
		}

		this.get = function() {
			return panel;
		}

		this.getModule = function() {
			return this.module;
		}

		this.isEnabled = function() {
			return enabled;
		}

		this.save = function() {
			if (preferences) {

				for (var j = 0; j < preferences.length; j++) {
					parseAndSavePreference(preferences[j]);
				}
			}
		}

		function parseAndSavePreference(pref) {
			if (pref instanceof ButtonPreference) { //Los botones no tienen configuracion que guardar
				return;
			}

			if (pref instanceof SectionPreference) { //Grupo de preferencias
				innerPrefs = pref.subpreferences;
				for (var j = 0; j < innerPrefs.length; j++) {
					parseAndSavePreference(innerPrefs[j]);
				}
				return;
			}


			var input = form.find("[name='" + pref.key + "']");
			var value;

			if (pref instanceof BooleanPreference) { //Checkbox
				value = input[0].checked;
			} else if (pref instanceof RadioPreference) {
				input.each(function() {
					if (this.checked) {
						value = this.value;
					}
				});
			} else {
				value = input.val();
			}

			helper.setValue(pref.key, value);
		}

	}

	// Método que guarda los modulos activados y desactivados y sus configuraciones
	function save() {
		var activeModules = {};
		for(var i = 0; i < panels.length; i++) {
			activeModules[panels[i].getModule().id] = panels[i].isEnabled();
			panels[i].save(); //Guardamos la configuracion de cada modulo
		}
		helper.setValue("MODULES", JSON.stringify(activeModules)); //Guardamos los activados y desactivados

	}

}

*/
