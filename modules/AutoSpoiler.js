(function ($, createModule, undefined) {
  'use strics';

  var mod = createModule({
    id: 'AutoSpoiler',
    name: 'Ocultar mensajes con spoiler',
    author: 'franexp',
    version: '0.1',
    description: 'Activa la etiqueta [spoiler][/spoiler] y oculta automáticamente aquellos '
    + 'mensajes escritos entre la etiqueta spoiler.',
    domain: ['/showthread.php', '/newthread.php', '/newreply.php', '/editpost.php']
  });

  var vB_Editor;
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
    vB_Editor = unsafeWindow.vB_Editor;
    /*Añadimos los estilos para el boton y el panel*/
    addButtonStyle();
    /*Buscamos los post con etiquetas quote y modificamos */
    SHURSCRIPT.eventbus.on('parsePost', parsePost);
    /* Añadimos el botón */
    SHURSCRIPT.eventbus.on('editorReady', function () {
      addSpoilerButton();
    });
  };

  /* Pasamos el contenido del post a hideSpoiler */
  function parsePost(event, post) {
    hideSpoiler(post.content);
  }

  /* Ocultamos los mensajes que cumplan con los requisitos de spoiler */
  function hideSpoiler(element) {
    var pretext = $(element).html();
    var re = /\[spoiler\]([^[]+(?:\[(?!spoiler\]|\/spoiler\])[^[]*)*)\[\/spoiler\]/i;
    //nos aseguramos de que no haga nada en caso de no haber etiquetas
    if ( re.exec(pretext) !== null ) {
      while (pretext.search(re) !== -1) {
        pretext = pretext.replace(re, '<div class="shurscript"><button class="btn btn-danger shurscript-spoiler">Mostrar Spoiler</button><div class="panel panel-danger panel-content shurpanel">$1</div></div>');
      }
      $(element).html(pretext);
      $(element).find('.shurscript .panel-content').each(function(){
        if ( $(this).find('font') ) {
          $(this).find('font').attr('color', 'black');
        }
        var e = $(this).parent().find('.shurscript-spoiler');
        //añadimos evento
        $(e).on('click', function(){showPanel(this)});
      });
    }
  }

  /* Añadimos estilos necesarios */
  function addButtonStyle() {
    GM_addStyle(".shurscript-spoiler {width:100%; margin-bottom: 2px; height: 32px; padding: 0; line-height: 200%;}");
    GM_addStyle(".shurpanel {display: none;}");
    GM_addStyle(".panel-content {padding: 5px !important; border-radius: 0 !important;}");
  }

  /* Trata el evento cuando se pulsa sobre un boton de spoiler */
  function showPanel(element) {
    var sit = $(element).parent().find('.shurpanel');
    if ( $(sit).is(':visible') ) {
      $(sit).slideUp('slow');
      $(element).text('Mostrar Spoiler');
    }else {
      $(sit).slideDown('slow');
      $(element).text('Ocultar Spoiler');
    }
    return false;
  }

  function enableWYSIWYG() {

    var editor = getEditor();

    if (!isQuickReply()) {
      $('#' + editor.editorid + '_textarea').css('width', 600);
    }

    unsafeWindow.switch_editor_mode(editor.editorid);
    unsafeWindow.is_saf = false;
    unsafeWindow.is_moz = true;
    editor.wysiwyg_mode = 1;

    if ($('#' + editor.editorid + '_cmd_switchmode').length == 0) //Añadimos el boton de cambiar de Editor
      $('<td><div id="' + editor.editorid + '_cmd_switchmode" class="imagebutton" style="background: none repeat scroll 0% 0% rgb(225, 225, 226); color: rgb(0, 0, 0); padding: 1px; border: medium none;"><img height="20" width="21" alt="Cambiar Modo de Editor" src="http://cdn.forocoches.com/foro/images/editor/switchmode.gif" title="Cambiar Modo de Editor"></div></td>').insertAfter($('#vB_Editor_QR_cmd_resize_0_99').parent());
  }

  /* Añadimos el boton */
  function addSpoilerButton() {

    genericHandler = function (A) {
      A = unsafeWindow.do_an_e(A);
      if (A.type == "click") {
        vB_Editor[getEditor().editorid].format(A, this.cmd, false, true)
      }
      vB_Editor[getEditor().editorid].button_context(this, A.type)
    };

    $('div[id$="_wrap0_youtube"]').parent().after(createButton('spoiler', 'Añadir etiquetas [SPOILER][/SPOILER]', 'http://i.imgur.com/99S4HMF.gif', function() {
      var selection = getEditor().editwin.getSelection();
      var range = selection.getRangeAt(0);
      var selectedText = selection.toString();

      range.deleteContents();
      var newNode = document.createTextNode('[SPOILER][color=#ffffff]' + selectedText + '[/color][/SPOILER]');
      range.insertNode(newNode);

      range.selectNode(newNode);
      range.setStart(newNode, 3);
      range.setEnd(newNode, 3 + selectedText.length);
    }));
  }

  function createButton(actionId, text, icon, customAction) {
    var img = icon ? icon : 'http://cdn.forocoches.com/foro/images/editor/' + actionId + '.gif';
    var button = $('<div id="vB_Editor_001_cmd_' + actionId + '" class="imagebutton" style="background: none repeat scroll 0% 0% rgb(225, 225, 226); color: rgb(0, 0, 0); padding: 1px; border: medium none;"><img width="21" height="20" alt="' + text + '" src="' + img + '" title="' + text + '"></div>')[0];
    button.editorid = getEditor().editorid;
    button.cmd = actionId;
    button.onclick = button.onmousedown = button.onmouseover = button.onmouseout = genericHandler;
    if (customAction) {
      button.onclick = customAction;
    }
    return $('<td></td>').append(button);
  }

  function getEditor() {
    return isQuickReply() ? unsafeWindow.vB_Editor.vB_Editor_QR : unsafeWindow.vB_Editor.vB_Editor_001;
  }

  function isQuickReply() {
    return unsafeWindow.vB_Editor.vB_Editor_QR !== undefined;
  }

})(jQuery, SHURSCRIPT.moduleManager.createModule);
