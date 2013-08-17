
//Creamos el nuevo menú arriba a la derecha
var menuItem = $('.vbmenu_control').first();
var newMenuItem = menuItem.clone();
newMenuItem.css("cursor", "pointer");
newMenuItem.html("<a>Shurscript</a>");
newMenuItem.click(function(){
	new SettingsWindow();
});
menuItem.parent().append(newMenuItem);

GM_addStyle('.disabled-module {opacity: 0.5;}');


function SettingsWindow() {

	var panels = [];
	
	var modal = $('<div class="modal fade" id="shurscript-settings-window" tabindex="-1" role="dialog" data-backdrop="static">\
	    <div class="modal-dialog" style="width:800px;">\
	      <div class="modal-content">\
	        <div class="modal-header">\
	          <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\
	          <h4 class="modal-title">Preferencias del Shurscript</h4>\
	        </div>\
	        <div class="modal-body">\
	        	<!--center class="lead" style="font-size: 12pt;">A continuación se listan todas las funcionalidades disponibles en el Shurscript. Activa las que te interesen y desactiva las que no necesites.</center-->\
	        </div>\
	        <div class="modal-footer">\
	          <button type="button" class="btn btn-default" data-dismiss="modal">Cerrar</button>\
	          <button type="button" class="btn btn-primary" id="save-settings">Guardar cambios</button>\
	        </div>\
	      </div>\
	    </div>\
	  </div>');
	
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
	
	modal.modal();
	

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
				  </div>\
				  <div class="panel-body">\
				    <p>' + module.description + '</p>\
				  </div>\
				</div>');
		//<form class="module-settings" id="' + modules[i].id + '"  name="' + modules[i].id + '" class="form-horizontal" disabled></form>\
		
		var enableCheck = $('<input style="float: right;" class="module-enable-check" type="checkbox" name="enabled"/>');
		var enabled = activeModules.indexOf(module) != -1;
		if (enabled) {
			enableCheck.attr("checked", "");
		} else {
			panel.addClass("disabled-module");
		}
		enableCheck.click(function() {
			enabled = this.checked == true;
			if (enabled) {
				panel.removeClass("disabled-module");
				if (preferencesPanel) { //Ocultamos el formulario
					preferencesPanel.slideDown(200);
				}
			} else {
				if (preferencesPanel) { //Mostramos el formulario
					preferencesPanel.slideUp(200);
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
			for (var j = 0; j < preferences.length; j++) {
				var currentValue = helper.getValue(preferences[j].key);
				form.append(preferences[j].getHTML(currentValue));
				if (j != preferences.length - 1) form.append('<hr>');
			}
			
			panel.append(preferencesPanel);
			if (!enabled) {
				preferencesPanel.hide();
			}
			
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
					var pref = preferences[j];
					var input = form.find("[name='" + pref.key + "']");
					var value;
					
					if (pref instanceof ButtonPreference) { //Los botones no tienen configuracion que guardar
						continue;
					}
					
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
		}

	}
	
	/* Método que guarda los modulos activados y desactivados y sus configuraciones */
	function save() {
		var activeModules = {};
		for(var i = 0; i < panels.length; i++) {
			activeModules[panels[i].getModule().id] = panels[i].isEnabled(); 
			panels[i].save(); //Guardamos la configuracion de cada modulo
		}
		helper.setValue("MODULES", JSON.stringify(activeModules)); //Guardamos los activados y desactivados
		
	}

}


