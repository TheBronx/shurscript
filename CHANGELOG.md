# CHANGELOG

## v0.21 `04/10/2014`

**Features**
* Autocompletado de iconos: Pulsa ':' (dos puntos) para que te aparezcan sugerencias de los iconos del foro. Ordenados por más usados.
* Nueva funcionalidad para que mientras estés leyendo un hilo, este se vaya actualizando automáticamente y notificándote de los nuevos posts, nuevas páginas e incluso cuando alguien elimina un post.
* WEBM: Ahora podrás ver los famosos vídeos .webm incrustados en Forocoches (Soporte para gfycat.com, mediacru.sh y cualquier archivo .webm) - Gracias al forero **gananciafc**

**Bugfixes**

* Arreglos varios que no recordamos después de tantos meses sin actualizar. Perdón por el retraso. :sisi3:

------------------------------------

### v0.20.6 `29/04/2014`

**Bugfixes**

* Los hilos no se marcaban como favoritos tras refrescar la ventana
* Ahora se pueden abrir las citas en pestañas separadas con Ctrl+Click o botón central
* Arreglado bug que guardaba backup de los mensajes después de haber sido enviados

------------------------------------

### v0.20.5 `27/04/2014`

**Features**

* Ahora se permite importar la lista de ignorados y contactos a los módulos de ignorar/resaltar hilos y mensajes

**Cambios**

* Lavado de cara en preferencias de shurscript
* Cambiados los mensajes de error para ser más descriptivos y con enlace al FAQ
* Se ha implementado un estilo de etiquetas para los campos de ignorar/resaltar por usuarios
* Añadida pestaña de ayuda con las FAQ en las preferencias

**Bugfixes**

* Si hay cambios sin guardar, se pregunta al usuario al cerrar las preferencias
* El usuario se duplicaba en respuesta avanzada y no notificaba las citas correctamente
* En la portada, los enlaces de autor e hilo del panel de citas eran relativos y devolvían error 404
* Si el panel de citas está abierto, al pulsar en el contador, ahora se cierra en vez de permanecer abierto
* Pequeños arreglos en módulo de refrescar búsquedas
* Pequeños arreglos sintácticos en módulo de citas

------------------------------------

### v0.20.4 `19/04/2014`

**Features**

* Añadida sincronización en la nube de las preferencias de usuario
* Re-escritura de los módulos acorde a plantilla
* Nueva opción para subir imágenes a Imgur y postearlas en el foro
* Poder ver el listado completo de Hilos favoritos categorizados por subforo
* Nueva barra en la parte superior para acceder a las preferencias y cualquier nueva funcionalidad que vayamos añadiendo
* Resaltar en un hilo los posts de los usuarios que quieras, con la posibilidad de importarlos desde tu la lista de contactos
* Nueva opción para resaltar hilos por autor (usuario)

------------------------------------

### v0.20.3 `18/04/2014`

**Features**

* Nueva opción para resaltar hilos por autor (usuario)

**Cambios**

* Añadido enlace al último post leído de un hilo desde el panel favoritos
* Añadido tooltip aclaratorio en la estrella para marcar como favorito dentro de un hilo

**Bugfixes**

* Añadido un include para que el script funcionase tanto si la URL tenía www como si no
* Solucionado error que detenía la ejecución del script a usuarios con caracteres extraños
* Añadido manejador para invalidar apikey si se ha generado una nueva
* Otros arreglos menores

------------------------------------

### v0.20.2 `14/04/2014`

**Features**

* Nueva opción para subir imágenes a Imgur y postearlas en el foro
* Poder ver el listado completo de Hilos favoritos categorizados por subforo
* Nueva barra en la parte superior para acceder a las preferencias y cualquier nueva funcionalidad que vayamos añadiendo
* Resaltar en un hilo los posts de los usuarios que quieras, con la posibilidad de importarlos desde tu la lista de contactos

**Bugfixes**

* Hacer que el script funcione correctamente en la portada

------------------------------------

### v0.20.1 `02/04/2014`

**Bugfixes**

* Solucionado problema con las notificaciones
* Arreglado componente encargado de las actualizaciones
* Arreglado problema con la migración de preferencias _(nuevas instalaciones)_
	* Ahora se migrarán los hilos favoritos/ocultados manualmente e historial de citas

------------------------------------

### v0.20 `30/03/2014`

**Features**

* Añadida sincronización en la nube de las preferencias de usuario
* Re-escritura de los módulos acorde a plantilla

**Cambios**

* Reorganizado el panel de preferencias con pestañas separadas
* Actualizado bootstrap.min.js a versión 3.1.1
* Centralizadas y movidas las imágenes que utilizan los módulos a un servidor externo
* El script para uso final se entrega ahora minificado en un único archivo

**Bugfixes**

* Muchos y muy variados, ver commits en GitHub

------------------------------------

### v0.10.2.1 `18/03/2014`

**Changes**

* Resaltado de los posts del OP más discreto

**Bugfixes**

* Si el OP era un usuario que tenías en Ignorados, el resaltado no funcionaba correctamente
* La barra de filtrado rápido solo aparecía en la primera página

------------------------------------

### v0.10.2 `16/03/2014`

**Features**

* Nueva opción para resaltar dentro de un hilo, los mensajes que has escrito tú y el creador del hilo.

**Bugfixes**

* Corregidos fallos provocados por los cambios de Ilitri
* Algunos usuarios con nombres no alfanuméricos no recibían las citas correctamente (Con las menciones desactivadas)
* Chrome + Editor de posts mejorado: Al enviar los posts aparecían saltos de línea dobles.
* Chrome: Al intentar guardar las preferencias había veces que no se guardaban.
* La recarga automática del buscador no funcionaba correctamente
* Otras correcciones menores

------------------------------------

### v0.10.1 `01/10/2013`

**Bugfixes**

* El contador de notificaciones pasaba a números negativos si hacías clic en notificaciones ya leídas (Issue #7)
* Los posts enviados anteriormente desde la respuesta avanzada aparecía luego en la caja de respuesta rápida

------------------------------------

### v0.10 `29/09/2013`

### v0.10 `29/09/2013`

**Features**

* Nueva opción para notificar solo de lo que son realmente citas y no menciones ni coincidencias con el nick que puede sacar el buscador del foro por error
* Historial de las últimas citas leídas debajo de las nuevas
* Botón en el listado de notificaciones para abrir todas las nuevas en pestañas
* Ocultar hilos:
	* Por usuario creador
	* Por palabras clave en el título
	* Manualmente
* Resaltar y mostrar arriba hilos por palabras clave
* Opción para mostrar los hilos favoritos y los destacados por encima del resto
* Filtro rápido en los subforos y en los resultados de búsqueda
* La flecha para hacer scroll hasta abajo del todo, ahora va hasta la respuesta rápida, no hasta el final
* El título de la ventana/pestaña del navegador ahora muestra el número de citas no leídas
* Recarga automáticamente las búsquedas en las que el sistema obliga a esperar varios segundos, evitando así tener que actualizar manualmente la página. **(Aporte del forero Electrosa)**
* Enviar automáticamente las respuestas cuando el foro te hace esperar 30 segundos entre post y post
* Modo Noche **(Aporte del forero Juno)** (BETA. Es posible que de vez en cuando os aparezca el foro en blanco durante un par de segundos.)


**Bugfixes**

* No actualizar las notificaciones desde search.php, para evitar que nos haga esperar X segundos hasta la próxima búsqueda
* Devolver el tamaño adecuado al editor de texto de la respuesta avanzada
* Al enviar una respuesta rápida, no funcionaba el botón de cita rápida en los nuevos posts del hilo
* Cita rápida de etiquetas CODE, HTML y PHP

------------------------------------

### v0.09.2 `16/09/2013`
**Changes**

* La barra de navegación inferior añadida por Electrik en los últimos días se elimina dejando únicamente visible la de 'shurscript'.

**Bugfixes**

* Solucionado problema por el cual las imágenes del editor mejorado se rompían tras el cambio de Static al CDN.


------------------------------------

### v0.09.1 `02/09/2013`
**Changes**

* **Deshacer:** Ahora ya no se muestra la estrella al pasar sobre la celda título de cada hilo. Solo por el icono, como antes.
* Cambiado el orden de las flechas de scroll.

**Bugfixes**

* Solucionado problema con las citas que le ocurría a algunos usuarios con Firefox + GreaseMonkey. No funcionaban.
* Solucionado bug en Chrome que en la edición rápida de un post y la opción auto-grow, la caja de texto no paraba de crecer.


------------------------------------

### v0.09 `01/09/2013`

**Features**

* Ahora se puede elegir el color de los hilos favoritos resaltados
* La estrella de marcar hilo como Favorito ahora se muestra al pasar por encima del hilo, no solo del icono.
* También se pueden marcar hilos como favoritos desde dentro del propio hilo.
* Los hilos favoritos funcionan también en los resultados de búsqueda
* Las opciones del panel de preferencias ahora están ocultas por defecto para ocupar menos
* Flechas para ir al principio y al final del post. (Desactivadas por defecto. Activar desde Preferencias)
* Mejoras en la edición de posts **(Beta)**
    * Añade soporte WYSIWYG a los navegadores que no lo soportaban (Como Google Chrome)
    * Botones en la respuesta rápida que hasta ahora estaban solo en Modo Avanzado
    * Acceso rápido a iconos desde la Respuesta rápida
    * Multi-cita también en la respuesta rápida. Y ahora se ven directamente los [QUOTE] en la caja de texto.
    * La caja de texto se adapta al contenido mientras se escribe. Ideal para tochos.
    * Guardado automático de posts sin enviar, para no perder nada si sin querer cerramos la pestaña o cambiamos de página.
* A partir de ahora, al encontrar una nueva versión del Shurscript, se mostrarán los cambios destacados (changelog).

------------------------------------

### v0.08 `17/08/2013`
**Features** 

* Reescritura completa del script, funcionalidades por módulos
* Panel de preferencias:
    * Activar o desactivar funciones
    * Configurar ciertos aspectos del script
        * Posibilidad de no mostrar ventana emergente al recibir una cita
        * Permitir aumentar el intervalo entre un refresco y otro o desactivar el refresco automático
* Actualizar a jQuery 2.0.3 y añadir Bootstrap 3.0.0
* Nueva funcionalidad: Citas Anidadas

**Bugfixes**

* Correcciones en el actualizador automático
* Mejorar compatibilidad con Scriptish

------------------------------------
### v0.07 `12/08/2013`
**Features**

* Menú emergente de notificaciones
* Alerta de citas sin leer en el navegador

**Bugfixes**

* Eliminado contador de notificaciones del breadcrumb inferior

------------------------------------
### v0.06 `12/08/2013`
**Features**

* Posibilidad de marcar hilos como favoritos

------------------------------------
### v0.04 `11/08/2013`
**Features**

* Adición de un actualizador automático
* Se añade jQuery como librería para el script

**Bugfixes**

* Si sólo hay una cita, se redirige a ella en vez de a la búsqueda

------------------------------------
### v0.00 `10/08/2013`
**Features**

* Barra de navegación (breadcrumb) y perfil en la parte inferior
* Botón y contador de notificaciones respecto a menciones y citas

------------------------------------
