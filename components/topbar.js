(function ($, SHURSCRIPT, undefined) {
	'use strict';

	var topbar = SHURSCRIPT.core.createComponent('topbar'),
	    $bar;
	
	topbar.showMessage = function (properties) {
		ensureProperties(properties);
		
		if (!$bar) {
			$('<div class="shurscript">').prependTo($('body')).append($bar = $('<div style="padding: 10px; text-align: center;"><span class="message"/><button type="button" class="close" style="position: absolute; right: 15px; line-height: 15px">&times;</button></div>'));
			$bar.hide();
		}

		$bar.find('.message').html(properties.message);
		$bar.attr('class', 'alert alert-' + properties.type);

		$bar.slideDown();

		$bar.on('click', '.close', function() {
			$bar.slideUp();
			properties.onClose && properties.onClose();
		});
	};
	
	function ensureProperties (properties) {
		
		if (typeof properties === "string") {
			properties = {message: properties};
		}

		properties.type = properties.type || "info";
		
	}
})(jQuery, SHURSCRIPT);