/**
 * Componente preferences: se encarga de todo lo relacionado con las opciones/preferencias de los modulos
 */
(function ($, SHURSCRIPT, undefined) {
	'use strict';

	var preferences = SHURSCRIPT.core.createComponent('preferences');

	preferences.shurbarIcon = function () {
		return {
			name: 'Shurscript',
			description: 'Abrir preferencias',
			image: SHURSCRIPT.config.imagesURL + 'roto2.gif',
			handler: preferences.onShow
		};
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

		// Click en boton "Comprobar actualizaciones"
		$modal.on('click', '#check-shurscript-updates', function () {
			preferences.checkUpdates();
		});

		// Click en botones "Opciones"
		$modal.on('click', '.shur-btn-options', function () {
			$(this).parent().siblings('.shur-options-body').slideToggle(300);
		});

		// Evento guardar
		$modal.on('click', '#save-settings', function () {
			preferences.saveSettings();
		});

		//Evento opcion cambiada, se añade un identificativo para saber que esa opcion ha sido modificada
		$modal.on('change', 'input', function () {
			$(this).parents('.shur-module-preferences').addClass('changed');
		});

		$modal.on('click', '.shur-module-enabled', function () {
			var prefPanel = $(this).parents('.shur-module-preferences');
			// Quita y pon la clase disabled para mostrar que el modulo esta activado o no
			prefPanel.toggleClass('disabled-module');
			// Muestra u oculta el body del panel si está activado o no
			prefPanel.children('.panel-body').slideToggle();

			//Marcarlo como modificado
			prefPanel.addClass('changed');
		});

		$modal.modal();
		$modal.css("z-index", 1000); //Para no superponerse a la de los alerts
		$(".modal-backdrop").css("z-index", 999);

		//Ajustar al tamaño de la ventana
		$(window).on('resize', function () {
			$modal.find('.modal-body').css('height', $(window).height() - 280);
		});
		$(window).trigger('resize');

		//Recuperar el changelog para la pestaña 'Acerca de'
		$modal.find('a[data-toggle="tab"][href="#tab-about"]').on('shown.bs.tab', function (e) {
			SHURSCRIPT.autoupdater.getChangelog(function (changelog) {
				$modal.find('#shur-changelog .panel-body').html(changelog);
			});
			$(this).off('shown.bs.tab')
		});

		// Click en boton "Generar nueva API Key"
		$modal.on('click', '#change-api-key', function () {
			bootbox.confirm("Recuerde que generar una nueva API Key elimina todos sus datos y configuraciones. Pulse en Aceptar para continuar con el proceso.", function (res) {
				if (res) {
					bootbox.hideAll();
					bootbox.dialog({message: '<center>Generando API Key...</center>'});
					SHURSCRIPT.sync.generateNewApiKey(function () {
						preferences.helper.location.href = "#newkey";
						preferences.helper.location.reload();
					});
				}
			});
		});

		// Formatear con tokenfield los option 'tags'
		$modal.on('shown.bs.modal', function (e) {		
			$('.shur-tags-group input[type=text]').tokenfield({
				allowDuplicates: false,
				delimiter: ',',
			});
		});

		//Recuperar el log para la pestaña 'Debug'
		$modal.find('a[data-toggle="tab"][href="#tab-debug"]').on('shown.bs.tab', function (e) {
			$('#debug-log').html($('#shurscript_log').html());
		});

		// Formulario "Enviar a los desarrolladores"
		$modal.on('click', '#debug-send', function () {
			bootbox.confirm("Por el bien de la comunidad, no abuse de esta utilidad y <strong>trate de ser todo lo conciso posible</strong> para ayudar a resolver el problema. Confirme que desea enviar el registro de shurscript y el suceso que ha escrito.", function (res) {
				if (res) {
					$.post('http://shurscript.org/report.php', $('#debug-form').serialize());
					$('#debug-send').attr({disabled: 'disabled', value: 'Reporte enviado correctamente'});
				}
			});
		});

		preferences.$modal = $modal;
		
		unsafeWindow.viewPlainText = function (enlace) {		
			bootbox.dialog({
				message: '<textarea id="textselect" class="form-control" style="min-height:75px;max-height:500px;overflow-y:auto;" readonly></textarea>',
				buttons: {
					seleccionar: {
						label: "Seleccionar el contenido",
						className: "btn-default",
						callback: function() {
							$('#textselect').select();
							return false;
						}
					},
					cerrar: {
						label: "Cerrar",
						className: "btn-primary",
					},
				}
			});
			var pref = $(enlace).attr('mapsTo');
			$('#textselect').text($("input[data-maps-to='" + pref + "']").tokenfield('getTokensList', ','));
		}

		
	};

	preferences.checkUpdates = function () {
		var $btn = $('#check-shurscript-updates');
		$btn.button('loading');
		SHURSCRIPT.autoupdater.check(true, function (updated) {
			$btn.button('reset');
			if (!updated) {
				bootbox.alert('No hay actualizaciones disponibles del Shurscript');
			}
		});
	};

	/**
	 * Lee las opciones y guardalas
	 */
	preferences.saveSettings = function () {

		var contadorPreferenciasGuardadas = 0;
		var modulosCambiados = preferences.$modal.find('.shur-module-preferences.changed');

		if (modulosCambiados.length) {
			bootbox.dialog({message: '<center>Guardando cambios...</center>'});

			// Loop por cada modulo
			modulosCambiados.each(function (index, prefs) {
				var $prefs = $(prefs),
					moduleId = $prefs.data('module-id'),
					module = SHURSCRIPT.moduleManager.modules[moduleId],
					modulePreferences = module.preferences;

				modulePreferences.enabled = $prefs.find('.shur-module-enabled').is(':checked');

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

					} else if ($option.hasClass('shur-tags-group')) {
						$input = $option.find('input');
						value = $input.val();
					}

					mapsTo = $input.data('maps-to');

					// Update preferences of module
					modulePreferences [mapsTo] = value;

				});

				// Guarda modulePreferences
				module.storePreferences(function () {
					contadorPreferenciasGuardadas++;
					//esperamos a que se hayan guardado todas las preferencias
					if (contadorPreferenciasGuardadas >= modulosCambiados.length) {
						preferences.helper.location.reload();
					}
				});
			});
		} else {
			preferences.$modal.modal('hide');
		}

	};

	/**
	 * Junta toda la informacion necesaria, genera la plantilla y devuelve su html
	 */
	preferences.createModal = function () {
		var modalData = {
			scriptVersion: SHURSCRIPT.scriptVersion,
			scriptBranch: SHURSCRIPT.scriptBranch,
			apiKey: SHURSCRIPT.config.apiKey,
			visualChangelog: SHURSCRIPT.config.visualChangelog,
			userDebug: SHURSCRIPT.environment.user.name,
			urlDebug: SHURSCRIPT.preferences.helper.location.href,
			agentDebug: SHURSCRIPT.environment.browser.name,
			modules: []
		};

		// Loop sobre modulos para sacar la info que nos hace falta
		$.each(SHURSCRIPT.moduleManager.modules, function (moduleName, module) {

			modalData.modules.push({
				id: module.id,
				name: module.name,
				description: module.description,
				options: module.getPreferenceOptions(),
				preferences: module.preferences
			});
		});

		return $(SHURSCRIPT.templater.fillOut('modal', modalData));
	};

	/**
	 * Puerta de entrada al componente
	 */
	preferences.load = function () {
		// Mete CSS para el modal
		preferences.helper.addStyle('modalcss');

		// Reabrir las preferencias en la pestaña 'Acerca de' si se acaba de generar una nueva key
		if (preferences.helper.location.hash.indexOf("newkey") != -1) {
			preferences.onShow();
			preferences.$modal.find('a[data-toggle="tab"][href="#tab-about"]').tab('show');
			setTimeout(function () {
				preferences.helper.location.href = "#"
			}, 1000);
		}
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
		var acceptableTypes = ['checkbox', 'radio', 'text', 'color', 'header', 'tags'],
			commonMandatoryKeys = ['type', 'caption'],
			errorPrefix = 'Error creando opcion: ';

		$.each(commonMandatoryKeys, function (index, key) {
			if (specs[key] === undefined) {
				preferences.helper.throw(errorPrefix + key + ' no esta definido');
			}
		});

		// Si el type no es valido
		if (acceptableTypes.indexOf(specs.type) === -1) {
			preferences.helper.throw(errorPrefix + type + ' no es un tipo valido de opcion');
		}

		// Si type == radio,
		if (specs.type === 'radio') {
			// y elements no es un array, a la mierda
			if (Object.prototype.toString.call(specs.elements) !== '[object Array]') {
				preferences.helper.throw(errorPrefix + '.elements no es un array');
			}

			// Si los objetos no contienen las propiedades value y caption, a la mierda
			$.each(specs.elements, function (index, element) {
				if (element.value === undefined || element.caption === undefined) {
					preferences.helper.throw(errorPrefix + 'Al elemento radio numero ' + index + ' le falta la propiedad value y/o caption');
				}

				// Si no hay subCaption, metele un string vacio
				element.subCaption = element.subCaption || '';
			});
		}

		// Si no es header y no tiene mapsTo, aborta
		if (specs.type !== 'header' && specs.mapsTo === undefined) {
			preferences.helper.throw(errorPrefix + '.mapsTo no esta definido');
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

