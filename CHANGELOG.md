# CHANGELOG

	Última versión estable: v0.10 (29 de septiembre de 2013)
	En desarrollo: v0.11

## v0.10

**Changes**

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
