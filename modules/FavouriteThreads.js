
function FavouriteThreads() {
		
	this.id = arguments.callee.name; //ModuleID
	this.name = "Hilos favoritos";
	this.author = "TheBronx";
	this.version = "0.2";
	this.description = "Mostrará un icono al lado de cada hilo para marcarlo como favorito. Los hilos favoritos destacarán entre los demás cuando el usuario entre a algún subforo.";
	this.enabledByDefault = true;
	
	var helper = new ScriptHelper(this.id);
	
	var favorites;
		
	this.shouldLoad = function() {
		 return (page == "/forumdisplay.php" || page == "/showthread.php" || page == "/search.php");
	}
	
	this.load = function() {
	
		GM_addStyle(".favorite>td:nth-child(3) {background-color:"+helper.getValue("BACKGROUND_COLOR", "#D5E6EE")+"; border-right: 4px solid "+helper.getValue("BORDER_COLOR", "#528BC6")+"}");
		GM_addStyle(".fav img {display:none;} .fav {cursor: pointer; background-repeat:no-repeat; background-position: center; background-image:url('http://salvatorelab.es/images/star.png');min-width:20px;}");
		GM_addStyle(".not_fav img {display:none;} .not_fav {cursor: pointer; background-repeat:no-repeat; background-position: center; background-image:url('http://salvatorelab.es/images/nostar.png');min-width:20px;}");
		GM_addStyle(".shur_estrella {width:30px;vertical-align:middle;} .shur_estrella a {cursor: pointer; width:20px; height:20px; display:block; background-repeat:no-repeat; background-position: center; background-image:url('http://salvatorelab.es/images/nostar.png'); margin:0 auto;} .shur_estrella a.fav {background-image:url('http://salvatorelab.es/images/star.png');}");
		
		favorites = GM_getValue("FC_FAVORITE_THREADS_" + userid); //Antiguos
		if (favorites) { //Migrar a la nueva estructura de datos
			helper.setValue("FAVOURITES", favorites);
			GM_deleteValue("FC_FAVORITE_THREADS_" + userid);
		}
		
		favorites = JSON.parse(helper.getValue("FAVOURITES", '[]'));
		
		if (page == "/forumdisplay.php" || page == "/search.php") {
			favoriteThreadsForumdisplay();
		} else if (page == "/showthread.php") {
			favoriteThreadsShowthread();
		}
	}
		
	function favoriteThreadsForumdisplay() {
		
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
	            //hilo.id = parseInt(a.attr('href').replace(/.*showthread\.php\?.*t=/,""),10); //antiguo sistema, falla en search.php
				hilo.id = parseInt(/.*showthread\.php\?.*t=([0-9]+).*/.exec(a.attr('href'))[1]);
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
				//evento sobre la celda del icono
	            icon_td.hover(
	                function() {//mouse in
	                    $(this).addClass("fav");
	                },
	                function() {//mouse out
	                    $(this).removeClass("fav");
	                }
	            );
				//evento sobre la celda del titulo
				jQuery( "#"+hilo.icon_td_id.replace("threadstatusicon","threadtitle") ).hover(
	                function() {//mouse in
	                    $("#"+$(this).attr("id").replace("threadtitle","threadstatusicon") ).addClass("fav");
	                },
	                function() {//mouse out
	                    $("#"+$(this).attr("id").replace("threadtitle","threadstatusicon") ).removeClass("fav");
	                }
	            );
	        } else {
	            //es un hilo normal
				//evento sobre la celda del icono
	            icon_td.hover(
	                function() {//mouse in
	                    $(this).addClass("not_fav");
	                },
	                function() {//mouse out
	                    $(this).removeClass("not_fav");
	                }
	            );
				//evento sobre la celda del titulo
				jQuery( "#"+hilo.icon_td_id.replace("threadstatusicon","threadtitle") ).hover(
	                function() {//mouse in
	                    $("#"+$(this).attr("id").replace("threadtitle","threadstatusicon") ).addClass("not_fav");
	                },
	                function() {//mouse out
	                    $("#"+$(this).attr("id").replace("threadtitle","threadstatusicon") ).removeClass("not_fav");
	                }
	            );
	        }
	        //en ambos casos al hacer clic se cambia su estado (fav->no_fav y viceversa) y se guarda/elimina de favoritos
	        icon_td.click( function(e) {
	            var id = parseInt($( this ).attr('id').replace("td_threadstatusicon_",""),10);
				var celda_titulo = $( "#"+$(this).attr("id").replace("threadstatusicon","threadtitle"));
	            //si no era favorito...
	            if (favorites.indexOf(id) < 0) {
	                //lo agregamos a favoritos
	                favorites.push(id);
	                //quitamos el class antiguo
	                $( this ).removeClass("not_fav");
	                //cambiamos los eventos hover
	                $( this ).unbind('mouseenter mouseleave');
					celda_titulo.unbind('mouseenter mouseleave');
	                //nuevos eventos
					//evento sobre la celda icono
	                $( this ).hover(
	                    function() {//mouse in
	                        $(this).addClass("fav");
	                    },
	                    function() {//mouse out
	                        $(this).removeClass("fav");
	                    }
	                );
					//evento sobre la celda titulo
					celda_titulo.hover(
	                    function() {//mouse in
	                        $("#"+$(this).attr("id").replace("threadtitle","threadstatusicon") ).addClass("fav");
	                    },
	                    function() {//mouse out
	                        $("#"+$(this).attr("id").replace("threadtitle","threadstatusicon") ).removeClass("fav");
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
					celda_titulo.unbind('mouseenter mouseleave');
	                //nuevos eventos
					//evento sobre la celda icono
	                $( this ).hover(
	                    function() {//mouse in
	                        $(this).addClass("not_fav");
	                    },
	                    function() {//mouse out
	                        $(this).removeClass("not_fav");
	                    }
	                );
					//evento sobre la celda titulo
					celda_titulo.hover(
	                    function() {//mouse in
	                        $("#"+$(this).attr("id").replace("threadtitle","threadstatusicon") ).addClass("not_fav");
	                    },
	                    function() {//mouse out
	                        $("#"+$(this).attr("id").replace("threadtitle","threadstatusicon") ).removeClass("not_fav");
	                    }
	                );
	                $( this ).parent().removeClass("favorite");
	            }
	            saveFavorites();
	        });
	    }
	}
	
	function favoriteThreadsShowthread() {
		//estamos viendo un hilo, ¿que hilo es?
		//la pregunta tiene miga, ya que en la URL no tiene por qué venir el topic_id
		var href = $("#threadtools_menu form>table tr:last a").attr("href");
		var t_id = parseInt(href.replace("subscription.php?do=addsubscription&t=",""),10);
		//vale, ahora que sabemos que hilo es, ¿es favorito?
		var is_favorite = false;
		if ( favorites.indexOf( t_id ) >= 0 ) {
	        //es un hilo favorito
			console.log(t_id+" Favorito");
			is_favorite = true;
		} else {
			//no es un hilo favorito
			console.log(t_id+" NO Favorito");
			is_favorite = false;
		}
		//agregamos la estrella junto a los botones de responder
		var estrella = '<td class="shur_estrella"><a href="#" class="'+ (is_favorite ? 'fav':'') +'"></a></td>';
		//boton de arriba
		$("#poststop").next().find("td.smallfont").first().before(estrella);
		//boton de abajo
		$("#posts").next().find("table td.smallfont").first().before(estrella);
		
		//eventos
		$(".shur_estrella a").each( function() {
			$(this).click( function() {
				if (is_favorite) {
					is_favorite = false;
					//borramos de favoritos
					favorites.splice(favorites.indexOf(t_id,1));
					//quitamos el class
					$(".shur_estrella a").each( function() { $(this).removeClass('fav') });
				} else {
					is_favorite = true;
					//agregamos a favoritos
					favorites.push(t_id);
					//agregamos el class
					$(".shur_estrella a").each( function() { $(this).addClass('fav') });
				}
				saveFavorites();
				return false;
			});
		});
	}
	
	function saveFavorites() {
		helper.setValue("FAVOURITES", JSON.stringify(favorites));
	}

	this.getPreferences = function() {
		var preferences = new Array();

		preferences.push(new TextPreference("BACKGROUND_COLOR", helper.getValue("BACKGROUND_COLOR", "#D5E6EE"), "Color de fondo", "El color de fondo para los hilos favoritos. Por defecto #D5E6EE"));
		preferences.push(new TextPreference("BORDER_COLOR", helper.getValue("BORDER_COLOR", "#528BC6"), "Color de borde", "El color del borde derecho para los hilos favoritos. Por defecto #528BC6"));

		return preferences;
	};
}

