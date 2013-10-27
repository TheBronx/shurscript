(function ($, SHURSCRIPT, undefined) {
	'use strict';
	/*
	Componente preferences: opciones de modulos
	*/

	var preferences = SHURSCRIPT.core.createComponent('preferences');

    /**
     * Mete elemento <Shurscript> en barra de FC para acceder a las preferencias
     */
	preferences.appendMenuItem = function () {

		var menuItem = $('.vbmenu_control').first(),
			newMenuItem = menuItem.clone();

        // TODO: mete el estilo por css
		newMenuItem.css('cursor', 'pointer');
		newMenuItem.html('<a>Shurscript</a>');
        menuItem.parent().append(newMenuItem);

		// Mete el evento para lanzar el modal
        newMenuItem.click(preferences.onShow);
	};

    /**
     * Lanza la ventana con las preferencias
     */
	preferences.onShow = function () {
        var $modal = preferences.createModal();

        $('body').append($modal);

        // Mete eventos
		$modal.on('hidden.bs.modal', function () {

			//Eliminarla al cerrar
			$modal.remove();
		});

        // Click en botones "Opciones"
        $modal.on('click', '.shur-btn-options', function () {
            $(this).parent().siblings('.shur-options-body').slideToggle(300);
        });

        // Evento guardar
        $modal.on('click', '#save-settings', function () {
            preferences.saveSettings();
        });

        $modal.on('click', '.shur-module-enabled', function (event) {
            // Quita y pon la clase disabled para mostrar que el modulo esta activado o no
           $(event.currentTarget).parents('.shur-module-preferences').toggleClass('disabled-module');
        });

		$modal.modal();
        preferences.$modal = $modal;
	};

    /**
     * Lee las opciones y guardalas
     */
    preferences.saveSettings = function () {

        // Loop por cada modulo
        preferences.$modal.find('.shur-module-preferences').each(function (index, prefs) {
            var $prefs = $(prefs),
                moduleId = $prefs.data('module-id'),
                module = SHURSCRIPT.moduleManager.modules[moduleId],
                state = module.state;

                state.enabled = $prefs.find('.shur-module-enabled').is(':checked');

                // Loop por las opciones
                $prefs.find('.shur-option').each(function (index, option) {
                    var $option = $(option),
                        $input,
                        value,
                        mapsTo;

                    if ($option.hasClass('shur-radio-group')) {
                        $input = $option.find('input[type=radio]:checked');
                        value = $input.val();

                    } else if ($option.hasClass('shur-checkbox-group')) {
                        $input = $option.find('input');
                        value = $input.is(':checked');

                    } else if ($option.hasClass('shur-text-group')) {
                        $input = $option.find('input');
                        value = $input.val();
                    }

                    mapsTo = $input.data('maps-to');

                    // Update state of module
                    state[mapsTo] = value;

                });

            // Guarda estado en el navegador
            module.storeState();

            // Cierra modal
            preferences.$modal.trigger('hidden.bs.modal');

            // Recarga la pagina
            preferences.helper.location.reload();
        });
    };


    /**
     * Junta toda la informacion necesaria, genera la plantilla y devuelve su html
     */
    preferences.createModal = function () {
        var modalData = {
            scriptVersion: SHURSCRIPT.scriptVersion,
            modules: []
        };

        // Loop sobre modulos para sacar la info que nos hace falta
        $.each(SHURSCRIPT.moduleManager.modules, function (moduleName, module) {

            modalData.modules.push({
                id: module.id,
                name: module.name,
                description: module.description,
                options: module.getOptions(),
                state: module.state
            });
        });

        return $(SHURSCRIPT.templater.fillOut('modal', modalData));

    };

    /**
     * Puerta de entrada a la unidad
     */
	preferences.start = function () {

		// Mete link para abrir modal
		preferences.appendMenuItem();

        // Crea modal a partir de la plantilla


        // Mete CSS
        preferences.helper.addStyle('modalcss');

    };



   /**
    * Crea objetos que definen opciones para el modulo
    *
    * @param {string} specs.type - puede ser 'checkbox', 'radio', 'text' o 'header'
    * @param {string} specs.caption - descripcion de la opcion
    * @param {string} [specs.subCaption] - descripcion opcional adicional
    * @param {array} [specs.elements] - obligatorio para 'radio'. Array de objetos
    * que definen la opcion para el radiobutton. Formato:  {value: '...', caption: '...' [, subCaption: '...']}
    * @param {string} [specs.mapsTo] - obligatorio excepto para 'header'
    *
    * Nota: realmente header no es una opcion, pero es conveniente meterlo en el saco.
    *
    */
    preferences.createOption = function (specs) {
        var acceptableTypes = ['checkbox', 'radio', 'text', 'header'],
            commonMandatoryKeys = ['type', 'caption'];

        $.each(commonMandatoryKeys, function (index, key) {
            if (specs[key] === undefined) {
                preferences.helper.throw(key + ' no esta definido');
            }
        });

        // Si el type no es valido
        if (acceptableTypes.indexOf(specs.type) === -1) {
            preferences.helper.throw(specs.type + ' no es un tipo valido de opcion');
        }

        // Si type == radio,
        if (specs.type === 'radio') {
            // y elements no es un array, a la mierda
            if (Object.prototype.toString.call(specs.elements) !== '[object Array]') {
                preferences.helper.throw('.elements no es un array');
            }

            // Si los objetos no contienen las propiedades value y caption, a la mierda
            $.each(specs.elements, function (index, element) {
                if (element.value === undefined || element.caption === undefined) {
                    preferences.helper.throw('Al elemento numero ' + index + ' le falta la propiedad value y/o caption');
                }

                // Si no hay subCaption, metele un string vacio
                element.subCaption = element.subCaption || '';
            });
        }

        // Si no es header y no tiene mapsTo, aborta
        if (specs.type !== 'header' && specs.mapsTo === undefined) {
            preferences.helper.throw('.mapsTo no esta definido');
        }

        // Si no hay subCaption, metele ''
        specs.subCaption = specs.subCaption || '';

        return specs;
    };

    // Precarga asincronamente la plantilla y compila
    setTimeout(function () {
        var tempName = 'modal',
            templateText = preferences.helper.getResourceText('modalhtml');

        SHURSCRIPT.templater.storeTemplate(tempName, templateText);
        SHURSCRIPT.templater.compile(tempName);
    }, 0);

})(jQuery, SHURSCRIPT);
//
///*
////Creamos el nuevo menú arriba a la derecha
//
//
//function preferences() {
//
//	modal.on('shown.bs.modal', function () {
//	  	var contentWindow = modal.find(".modal-body");
//		var preferences
//		for (var i = 0; i < allModules.length; i++) {
//			var modulePanel = new ModulePanel(allModules[i]);
//			panels.push(modulePanel);
//			contentWindow.append(modulePanel.get()); //Añadimos los modulos que tengan alguna preferencia configurada
//		}
//	});
//
//	$(document.body).append(modal);
//
//	modal.find("button#save-settings").click(function() {
//		save();
//		modal.modal('hide');
//		window.location.reload();
//	});
//
//	modal.find(".modal-body").css("height", $(window).height() - 210);
//
//	modal.modal();
//	$(".modal-backdrop").css("z-index", 1010); //Para no superponerse a la de los alerts
//
//	//Añadir boton de actualizar al título
//	var updateButton = $('<button style="position:absolute;margin-left:15px;" class="btn btn-default btn-sm">Comprobar actualizaciones</button>');
//	updateButton.click(function(){
//		AutoUpdater.check(true);
//	});
//	$("#shurscript-settings-window .modal-title").append(updateButton);
//
//	function ModulePanel(module) {
//
//		this.module = module;
//
//		var helper = new ScriptHelper(this.module.id);
//
//		var preferences;
//		var form;
//
//		var panel;
//
//		var settingsButton;
//		var preferencesPanel;
//
//
//		panel = $('<div class="panel">\
//				  <div class="panel-heading">\
//				    <h3 class="panel-title">' + module.name + '</h3>\
//				  </div>' + ((module.description && module.description != "") ? '<\div class="panel-body"><p>' + module.description + '</p></div>' : '') + '</div>');
//		//<form class="module-settings" id="' + modules[i].id + '"  name="' + modules[i].id + '" class="form-horizontal" disabled></form>\
//
//		var enableCheck = $('<input style="float: right;" class="module-enable-check" type="checkbox" name="enabled"/>');
//		var enabled = activeModules[module.id];
//		if (enabled) {
//			enableCheck.attr("checked", "");
//		} else {
//			panel.addClass("disabled-module");
//		}
//		enableCheck.click(function() {
//			enabled = this.checked == true;
//			if (enabled) {
//				if (settingsButton) {
//					settingsButton.removeAttr("disabled");
//				}
//				panel.removeClass("disabled-module");
//			} else {
//				if (preferencesPanel) { //Ocultamos el formulario
//					preferencesPanel.slideUp(200);
//				}
//				if (settingsButton) {
//					settingsButton.removeClass('active');
//					settingsButton.attr("disabled", "");
//				}
//				panel.addClass("disabled-module");
//			}
//		});
//
//		panel.find(".panel-heading").prepend(enableCheck);
//
//	    preferences = module.getPreferences && module.getPreferences();
//	    preferences = $(preferences);
//	    if (preferences.length > 0) {
//
//	    	var preferencesPanel = $("<div></div>");
//	    	preferencesPanelBody = $("<div class='panel-body'></div>");
//
//	    	preferencesPanel.append("<hr style='margin:0'>");
//	    	preferencesPanel.append(preferencesPanelBody);
//
//	    	form = $('<form/>');
//	    	preferencesPanelBody.append(form);
//			form.append(getHTMLFromPreferences(preferences));
//
//			panel.append(preferencesPanel);
//			preferencesPanel.hide(); //Se mostrara con el botón
//
//
//	    	settingsButton = $('<button type="button" data-toggle="button" style="float:right; margin: -23px 24px;" class="btn btn-default btn-sm">Opciones</button>');
//			panel.find(".panel-heading").append(settingsButton);
//			if (!enabled) {
//				settingsButton.attr("disabled", "");
//			}
//			settingsButton.click(function() {
//				preferencesPanel.slideToggle(200);
//
//			});
//
//		}
//
//		function getHTMLFromPreferences(preferences) {
//			var html = '';
//			for (var j = 0; j < preferences.length; j++) {
//				if (preferences[j] instanceof SectionPreference) {
//					html += '<h4 style="border-bottom: 1px solid lightgray">' + preferences[j].title + '</h4>';
//					html += preferences[j].description;
//					html += "<div style='padding:20px;'>";
//					html += getHTMLFromPreferences(preferences[j].subpreferences);
//					html += "</div>";
//				} else {
//					var currentValue = helper.getValue(preferences[j].key);
//					html += preferences[j].getHTML(currentValue);
//					if (j != preferences.length - 1) html += '<hr>';
//				}
//			}
//			return html;
//		}
//
//		this.get = function() {
//			return panel;
//		}
//
//		this.getModule = function() {
//			return this.module;
//		}
//
//		this.isEnabled = function() {
//			return enabled;
//		}
//
//		this.save = function() {
//			if (preferences) {
//
//				for (var j = 0; j < preferences.length; j++) {
//					parseAndSavePreference(preferences[j]);
//				}
//			}
//		}
//
//		function parseAndSavePreference(pref) {
//			if (pref instanceof ButtonPreference) { //Los botones no tienen configuracion que guardar
//				return;
//			}
//
//			if (pref instanceof SectionPreference) { //Grupo de preferencias
//				innerPrefs = pref.subpreferences;
//				for (var j = 0; j < innerPrefs.length; j++) {
//					parseAndSavePreference(innerPrefs[j]);
//				}
//				return;
//			}
//
//
//			var input = form.find("[name='" + pref.key + "']");
//			var value;
//
//			if (pref instanceof BooleanPreference) { //Checkbox
//				value = input[0].checked;
//			} else if (pref instanceof RadioPreference) {
//				input.each(function() {
//					if (this.checked) {
//						value = this.value;
//					}
//				});
//			} else {
//				value = input.val();
//			}
//
//			helper.setValue(pref.key, value);
//		}
//
//	}
//
//	// Método que guarda los modulos activados y desactivados y sus configuraciones
//	function save() {
//		var activeModules = {};
//		for(var i = 0; i < panels.length; i++) {
//			activeModules[panels[i].getModule().id] = panels[i].isEnabled();
//			panels[i].save(); //Guardamos la configuracion de cada modulo
//		}
//		helper.setValue("MODULES", JSON.stringify(activeModules)); //Guardamos los activados y desactivados
//
//	}
//
//}
//
//*/
