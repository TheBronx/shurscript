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
    thread = SHURSCRIPT.environment.thread.id;
    loadNextPage();
    //alert(images);
  };

  function loadNextPage() {
    var re = /\<img(.*?)\>/i;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        var html = xmlhttp.responseText;
        while (html.search(re) !== -1) {
          images.push(re.exec(html));
          html = html.replace(re, '1');
        }

        alert(images);
      }
    };
    xmlhttp.open('GET', '/foro/showthread.php?t=' + thread + '&page=3', true);
    xmlhttp.send();
  }

  })(jQuery, SHURSCRIPT.moduleManager.createModule);
