(function ($, createModule, undefined) {
  'use strics';

  var mod = createModule({
    id: 'ImageGallery',
    name: 'Galeria de imagenes de un hilo',
    author: 'franexp',
    version: '0.1',
    description: 'Muestra una galeria con las imagenes que hay en un hilo.',
    domain: ['/showthread.php']
  });

  var thread;
  var pages;
  var images = []
  /**
  * Activamos modo de carga normal (aunque viene activo por defecto)
  * aqui se podrian hacer comprobaciones adicionales. No es nuestro caso
  */
  mod.normalStartCheck = function () {
    return true;
  };

  /**
  * Sobreescribimos la funcion de ejecucion
  */
  mod.onNormalStart = function () {
    mod.helper.addStyle('gallerycss');
    /*
    * Compilamos la plantilla HTML del Reader
    */
    var tempName = 'gallery',
    templateText = mod.helper.getResourceText('galleryhtml');
    SHURSCRIPT.templater.storeTemplate(tempName, templateText);
    SHURSCRIPT.templater.compile(tempName);

    addGaleryButton();
  };

  mod.openGallery = function () {
    thread = SHURSCRIPT.environment.thread.id;
    pages = numberPages();
    for (i = 1; i <= pages; i++) {
      loadNextImage(i);
    }
    cleanImages(images);
    $modal = $(SHURSCRIPT.templater.fillOut('gallery'));

    try {
      $('body').append($modal);
    } catch (e) {
      // Elementos como los videos de Youtube tienen un script dentro que hace petar el .append()
      console.log(e);
    }

    /* Abrimos la ventana */
    $modal.modal();

  };


  function loadNextImage(page) {
    var reIm = /\<img src="(.*?)"/i;
    var reMe = /<!-- message -->([\s\S]*?)<!-- \/ message -->/i;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        var html = xmlhttp.responseText;
        while (html.search(reMe) !== -1 ) {
          var aux = reMe.exec(html)[0];
          while (aux.search(reIm) !== -1 ) {
            var elem = reIm.exec(aux)[1];
            if (images.indexOf(elem) == -1 ) {
              images.push(elem);
            }
            aux = aux.replace(reIm, '1');
          }
          html = html.replace(reMe, '1');
        }
      }
    };
    xmlhttp.open('GET', '/foro/showthread.php?t=' + thread + '&page=' + page, false);
    xmlhttp.send();
  }

  function cleanImages(images) {
    var re = /http:\/\/cdn.forocoches.com\/(.*)/i;
    if (images.length > 0) {
      for (i = images.length - 1; i >= 0; i--) {
        if (re.test(images[i])) {
          images.splice(i, 1);
        }
      }
    }
  }

  function numberPages() {
    var page = $('.pagenav:first table tbody tr td:first-child').text();
    page = parseInt(page.substring(page.length-2, page.length));
    return page;
  }

  function addGaleryButton() {
    var tdNextNode = document.getElementById("threadtools");
    var trNode = tdNextNode.parentNode;
    var newTd = document.createElement("TD");
    newTd.className = 'vbmenu_control';
    newTd.innerHTML = '<a href="">Galería</a>';
    $(newTd).on('click', function(){
      mod.openReader();
    });
    trNode.insertBefore(newTd, tdNextNode);
  }

  })(jQuery, SHURSCRIPT.moduleManager.createModule);
