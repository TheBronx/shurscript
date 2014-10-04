(function ($, createModule, undefined) {
	'use strict';

	var mod = createModule({
		id: 'Webm',
		name: 'Webm',
		author: 'gananciafc, xusoO, TheBronx',
		version: '0.3',
		description: 'Muestra videos de gfycat.com, mediacru.sh y cualquier .webm',
		domain: ['/showthread.php'],
		initialPreferences: {
			enabled: true
		}
	});

	mod.normalStartCheck = function () {
		return true;
	};

	mod.onNormalStart = function () {
		SHURSCRIPT.eventbus.on('parsePost', parsePost);
	};

	function parsePost(event, post) {
		parseWebm(post.content);
		parseGfycat(post.content);
		parseMediacru(post.content);
	}

	function parseWebm(element) {
		// Carga videos a partir de url's .webm
		element.find('a[href$=".webm"]').each(function() {
			var link = $(this).attr('href');

			var video = document.createElement('video');
			video.src = link;
			setVideoAttributes(video);

			$(this).after(video);
			$(this).remove();

		});
	}

	function parseGfycat(element) {
		// Carga videos de gfycat.com via api gfycat http://gfycat.com/api
		element.find('a[href*="gfycat.com"]').each(function() {
			var dataID = $(this).attr('href').replace(/.*?:\/\/([w]+)?\.?gfycat\.com\//g, "");
			var $this = $(this);
			$.ajax({
				type: "GET",
				url: "http://gfycat.com/cajax/get/"+dataID,
				async: true,
				dataType: "json",
				success: function(data){
					var video = document.createElement('video');
					video.src = data.gfyItem.mp4Url;
					video.src = data.gfyItem.webmUrl;
					setVideoAttributes(video);

					$this.append('<br>');
					$this.after(video);
				}
			});
		});
	}

	function parseMediacru(element) {
		// Carga videos de mediacru.sh
		element.find('a[href*="mediacru.sh"]').each(function() {
			var url = $(this).attr('href').replace(/.*?:\/\//g, "");
			var video = document.createElement('video');
			video.src = '//cdn.'+url+'.mp4';
			video.src = '//cdn.'+url+'.webm';
			setVideoAttributes(video);

			$(this).append('<br>');
			$(this).after(video);
		});
	}

	function setVideoAttributes(video) {
		video.autoplay = false;
		video.loop = false;
		video.muted = false;
		video.controls = true;
		video.style.maxWidth = "600px";
		video.style.maxHeight = "600px";
	}

})(jQuery, SHURSCRIPT.moduleManager.createModule);
