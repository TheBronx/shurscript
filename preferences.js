function TextPreference(key, value, name, description, regexValidator) {
	this.key = key; //Clave de la propiedad que se guardará con helper.setValue(key, value);
	this.value = value; //Valor actual o por defecto, si no hay
	this.name = name;
    this.description = description;
    this.regexValidator = regexValidator; //Validar campo con regex
}

TextPreference.prototype.getHTML = function() {
	var html = '<label>' + this.name + '</label> <input class="form-control" name="' + this.key + '" type="text" value="' + this.value + '"/>';
	html += '<p class="help-block">' + this.description + '</p>';
	return html;
}


function BooleanPreference(key, value, name, description) {
	this.key = key;
	this.value = value;
	this.name = name;
    this.description = description;
}

BooleanPreference.prototype.getHTML = function() {
	var html = '<div class="checkbox"><input name="' + this.key + '" type="checkbox" ' + (this.value == true ? 'checked' : '') + '/>';
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

function RadioOption(key, name, description) {
    this.key = key;
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
*/

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