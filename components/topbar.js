(function ($, SHURSCRIPT, undefined) {
	'use strict';

	var topbar = SHURSCRIPT.core.createComponent('topbar'),
	    $bar,
	    timer;
	
	topbar.showMessage = function (properties) {
		ensureProperties(properties);
		
		if (!$bar) {
			$('<div class="shurscript" style="height: 62px;">').prependTo($('body')).append($bar = $('<div style="padding: 10px; text-align: center; position: fixed; width: 99%;"><span class="message"/><button type="button" class="close" style="position: absolute; right: 15px; line-height: 15px">&times;</button></div>'));
			$bar.hide();
		}

		$bar.find('.message').html(properties.message);
		$bar.attr('class', 'alert alert-' + properties.type);

		$bar.slideDown();

		var close = function () {
			$bar.slideUp();
			properties.onClose && properties.onClose();
		}

		$bar.on('click', '.close', function() {
			close();
		});

		if (typeof properties.timeout === 'number') {
			if (timer) clearTimeout(timer);
			timer = setTimeout(function () {
				close();
			}, properties.timeout);
		}
	};
	
	function ensureProperties (properties) {
		
		if (typeof properties === "string") {
			properties = {message: properties};
		}

		properties.type = properties.type || "info";
		
	}
})(jQuery, SHURSCRIPT);