(function ($, createModule, undefined) {
  'use strics';

  var mod = createModule({
    id: 'ImageGallery',
    name: 'Galeria de imagenes',
    author: 'franexp',
    version: '0.1',
    description: 'Muestra una galeria con las imagenes que hay en el hilo.',
    domain: ['/showthread.php']
  });

  var thread;
  var pages;
  var title;
  var images = [];
  var index = 0;
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
    thread = SHURSCRIPT.environment.thread.id;
    title = $('.cmega').text();
    pages = numberPages();
  };

  mod.shurbarIcon = function () {
    if ( SHURSCRIPT.environment.thread.id != null ){
      return {
        name: 'Galería',
        description: 'Muestra una galería con las imágenes del hilo',
        image: 'http://i.imgur.com/iMe3OgE.png',
        handler: function () {
          $('.tooltip').hide();
          mod.openGallery();
        }
      };
    }
  };

  mod.openGallery = function () {
    thread = SHURSCRIPT.environment.thread.id;
    title = $('.cmega').text();
    pages = numberPages();
    /* En caso de haber abierto previamente la galería no cargamos las imagenes nuevamente */
    if( images.length <= 0) {
      for (i = 1; i <= pages; i++) {
        loadNextImage(i);
      }
      cleanImages(images);
    }

    var modal = '<div id="gl"><div id="gallery" class="modal fade modal-tag" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">'
    + '<div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header">'
    + '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</button>'
    + '<h3>'+images.length+' imágenes</h3></div><div class="modal-body"></div><div class="modal-footer"><h4>'+title+'</h4>'
    + '</div></div></div></div></div>';
    $('body').append(modal);

    if ( images.length <= 0) {
      $('#gallery').find('.modal-body').append('<p>¡No hay imágenes en este hilo!</p>');
    }
    else {
      for (i = 0; i < images.length; i++) {
        var im = '<div class="im-container"><a target="_blank" href="'+images[i]+'" ><img class="gallery-img" src="'+images[i]+'"></a></div>';
        $('#gallery').find('.modal-body').append(im);
      }
    }

    $('#gallery').on('hidden.bs.modal', function () {
      //Eliminar al cerrar
      $(this).remove();
    });
    /* Abrimos la ventana */
    $('#gallery').modal('show');
  };

  /* Cargamos las páginas del hilo y buscamos las imagenes */
  function loadNextImage(page) {
    var reIm = /\<img src="(.*?)"/i;
    var reMe = /<!-- message -->([\s\S]*?)<!-- \/ message -->/i;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        var html = xmlhttp.responseText;
        /* Buscamos los post */
        while (html.search(reMe) !== -1 ) {
          var aux = reMe.exec(html)[0];
          /* Buscamos las imagenes dentro de los post */
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
    if (page > 1) {
      xmlhttp.open('GET', '/foro/showthread.php?t=' + thread + '&page=' + page, false);
    }else {
      xmlhttp.open('GET', '/foro/showthread.php?t=' + thread, false);
    }

    xmlhttp.send();
  }

  /* Limpiamos el array de imagenes repetidas o imagenes del foro */
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

  /* Buscamos el número de páginas */
  function numberPages() {
    var page = $('.pagenav:first table tbody tr td:first-child').text();
    page = parseInt(page.substring(page.length-2, page.length));
    if (isNaN(page)) {
      page = 1;
    }
    return page;
  }

  })(jQuery, SHURSCRIPT.moduleManager.createModule);
