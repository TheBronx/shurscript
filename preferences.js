function TextPreference(key, defaultValue, name, description, regexValidator) {
	this.key = key; //Clave de la propiedad que se guardará con helper.setValue(key, value);
	this.defaultValue = defaultValue; //Valor por defecto si el usuario no tiene ninguno configurado
	this.name = name;
    this.description = description;
    this.regexValidator = regexValidator; //Validar campo con regex
}

TextPreference.prototype.getHTML = function(currentValue) {
	var value = (typeof currentValue !== 'undefined' ? currentValue : this.defaultValue);
	var html = '<label>' + this.name + '</label> <input class="form-control" name="' + this.key + '" type="text" value="' + value + '"/>';
	if (typeof this.description !== 'undefined') {
		html += '<p class="help-block">' + this.description + '</p>';
	}
	return html;
}


function BooleanPreference(key, defaultValue, description) {
	this.key = key;
	this.defaultValue = defaultValue;
    this.description = description;
}

BooleanPreference.prototype.getHTML = function(currentValue) {
	var value = (typeof currentValue !== 'undefined' ? currentValue : this.defaultValue);
	var html = '<div class="checkbox"><input name="' + this.key + '" type="checkbox" ' + (value == true ? 'checked' : '') + '/>';
	html += '<label>' + this.description + '</label></div>';
	return html;
}


/* POR IMPLEMENTAR
function RangePreference(key, defaultValue, min, max, step, name, description) {
    this.key = key;
    this.defaultValue = defaultValue;
    this.min = min;
    this.max = max;
    this.step = step;
    this.name = name;
    this.description = description;
}
*/
function RadioOption(value, name, description) {
    this.value = value;
    this.name = name;
    this.description = description;
}

function RadioPreference(key, defaultValue, options, name, description) {
    this.key = key;
    this.defaultValue = defaultValue;
    this.options = options;
    this.name = name;
    this.description = description;
}

RadioPreference.prototype.getHTML = function(currentValue) {
	var value = (typeof currentValue !== 'undefined' ? currentValue : this.defaultValue);
	var html = "<label>" + this.name + "</label>";
	for (var i = 0; i < this.options.length; i++) {
		var checked = '';
		if (this.options[i].value == value) {
			checked = 'checked';
		}
		html += '<div style="margin-left: 20px;" class="radio">\
		  <label>\
		    <input type="radio" name="' + this.key + '" value="' + this.options[i].value + '" ' + checked + '>' + this.options[i].name;
		if (typeof this.options[i].description != 'undefined') {
			html += '<span style="color:gray"> (' + this.options[i].description + ')</span>';
		}
		html += '</label></div>';
	}
	if (typeof this.description !== 'undefined') {
		html += '<p class="help-block">' + this.description + '</p>';
	}
	return html;
}

/* No se guardara, aparecera como un boton y tiene asociada una accion */
function ButtonPreference(title, clickHandler) {
    this.title = title;
    this.clickHandler = clickHandler;
}

ButtonPreference.prototype.getHTML = function() {
	var button = $('<a class="btn btn-default btn-sm">' + this.title + '</a>');
	button.click(this.clickHandler);
	return button;
}


function SectionPreference(title, description, subpreferences) {
    this.title = title;
    this.description = description;
    this.subpreferences = subpreferences;
}

SectionPreference.prototype.getHTML = function() {
	var section = '<h4 style="border-bottom: 1px solid lightgray">' + this.title + '</h4>';
	section += this.description;
	section += "<div style='padding:20px;'>";
	this.subpreferences.forEach(function(pref){
		section += pref.getHTML();
	});
	section += "</div>";
	return section;
}

function ColorPreference(key, defaultValue, name, description) {
	this.key = key;
	this.defaultValue = defaultValue;
	this.name = name;
    this.description = description;
}

ColorPreference.prototype.getHTML = function(currentValue) {
	var value = (typeof currentValue !== 'undefined' ? currentValue : this.defaultValue);
	var html = '<label>' + this.name + '</label> <input class="form-control" name="' + this.key + '" type="color" value="' + value + '"/>';
	if (typeof this.description !== 'undefined') {
		html += '<p class="help-block">' + this.description + '</p>';
	}
	return html;
}
