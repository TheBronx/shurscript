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
    addGaleryButton();
  };

  function startGallery(){
    thread = SHURSCRIPT.environment.thread.id;
    pages = numberPages();
    for (i = 1; i <= pages; i++) {
      loadNextImage(i);
    }
    cleanImages(images);
    alert(images);
    return false;
  }

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
            images.push(reIm.exec(aux)[0]);
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
    var re = /http:\/\/cdn.forocoches.com\/(.*)\>/i;
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
    $(newTd).on('click', function(){startGallery()});
    trNode.insertBefore(newTd, tdNextNode);
  }

  })(jQuery, SHURSCRIPT.moduleManager.createModule);
