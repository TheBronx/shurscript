/*
Modulo Shurscript
@id: FavouriteThreads
@name: Hilos favoritos
@author: TheBronx
@version: 0.1
@description: Mostramos un icono para marcar hilos favoritos. Los hilos favoritos pasan a estar destacados
*/

function FavouriteThreads() {
		
	var helper = new ScriptHelper("FavouriteThreads");
	
	var favorites;
		
	this.shouldLoad = function() {
		 return page == "/forumdisplay.php";
	}
	
	this.load = function() {
	
		GM_addStyle(".favorite>td:nth-child(3) {background-color:#D5E6EE; border-right: 4px solid #528BC6}");
		GM_addStyle(".fav img {display:none;} .fav {cursor: pointer; background-repeat:no-repeat; background-position: center; background-image:url('http://salvatorelab.es/images/star.png');}");
		GM_addStyle(".not_fav img {display:none;} .not_fav {cursor: pointer; background-repeat:no-repeat; background-position: center; background-image:url('http://salvatorelab.es/images/nostar.png');}");

		favorites = jQuery.parseJSON( GM_getValue("FC_FAVORITE_THREADS_" + userid,"[]") );
		favoriteThreads();
	}
		
	function favoriteThreads() {
		
	    var hilos = new Array();
	    var hilo = {};
	    //recogemos todos los hilos actuales
	    $('#threadslist tr td').each( function() {
	        var identifier = $(this).attr('id');
	        if ( identifier != undefined && identifier.indexOf('td_threadstatusicon')>=0 ) {
	            //celda icono
	            hilo.icon_td_id = identifier;
	        } else if (identifier != undefined && identifier.indexOf('td_threadtitle')>=0) {
	            //celda titulo
	            var a = $(this).find('div > a').first();
	            hilo.href = a.attr('href');
	            hilo.id = parseInt(a.attr('href').replace(/.*showthread\.php\?.*t=/,""),10);
	            hilo.title = a.html();
	            hilos.push( hilo );
	            hilo = {};
	        }
	    });
	    
	    //ahora resaltamos los hilos favoritos y mostramos los iconos correspondientes
	    for (var i=0; i<hilos.length; i++) {
	        var hilo = hilos[i];
	        var icon_td = jQuery( "#"+hilo.icon_td_id );
	        if ( favorites.indexOf( hilo.id ) >= 0 ) {
	            //es un hilo favorito
	            icon_td.parent().addClass("favorite");
	            icon_td.hover(
	                function() {//mouse in
	                    $(this).addClass("fav");
	                },
	                function() {//mouse out
	                    $(this).removeClass("fav");
	                }
	            );
	        } else {
	            //es un hilo normal
	            icon_td.hover(
	                function() {//mouse in
	                    $(this).addClass("not_fav");
	                },
	                function() {//mouse out
	                    $(this).removeClass("not_fav");
	                }
	            );
	        }
	        //en ambos casos al hacer clic se cambia su estado (fav->no_fav y viceversa) y se guarda/elimina de favoritos
	        icon_td.click( function(e) {
	            var id = parseInt($( this ).attr('id').replace("td_threadstatusicon_",""),10);
	            //si no era favorito...
	            if (favorites.indexOf(id) < 0) {
	                //lo agregamos a favoritos
	                favorites.push(id);
	                //quitamos el class antiguo
	                $( this ).removeClass("not_fav");
	                //cambiamos los eventos hover
	                $( this ).unbind('mouseenter mouseleave');
	                //nuevos eventos
	                $( this ).hover(
	                    function() {//mouse in
	                        $(this).addClass("fav");
	                    },
	                    function() {//mouse out
	                        $(this).removeClass("fav");
	                    }
	                );
	                $( this ).parent().addClass("favorite");
	            } else {
	                //lo borramos de favoritos
	                favorites.splice(favorites.indexOf(id),1);
	                //quitamos el class antiguo
	                $( this ).removeClass("fav");
	                //cambiamos los eventos hover
	                $( this ).unbind('mouseenter mouseleave');
	                //nuevos eventos
	                $( this ).hover(
	                    function() {//mouse in
	                        $(this).addClass("not_fav");
	                    },
	                    function() {//mouse out
	                        $(this).removeClass("not_fav");
	                    }
	                );
	                $( this ).parent().removeClass("favorite");
	            }
	            saveFavorites();
	        });
	    }
	}
	
	function saveFavorites() {
	    GM_setValue("FC_FAVORITE_THREADS_" + userid, JSON.stringify(favorites));
	}

}

