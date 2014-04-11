/**
 * Modulo de persistencia
 */
(function (SH, $, localStorage, undefined) {
    'use strict';

    SH.persist = {
        _system: SH.system.getInstance('Persist'),
        _server: SH.config.server,

        /**
         * Devuelve un valor
         *
         * @param key Key a extraer
         * @param def Default value (opcional)
         */
        getValue: function (key, def) {
            var val = localStorage.getItem(key);

            if (val === null) {return def;}

            return JSON.parse(val);
        },

        /**
         * Guarda un par key-value
         *
         * @param key
         * @param value
         */
        setValue: function (key, value) {
            value = JSON.stringify(value);
            localStorage.setItem(key, value);

            this._setServerValue(key, value);
        },

        /**
         * Guarda key-value en la nube
         */
        _setServerValue: function (key, value){


            // Evita lios de cambio de contexto en el callback
            var self = this;

            // Callback para subir al server
            var push = function () {
                $.ajax({
                    type: 'PUT',
                    url: self._server + 'preferences/' + key + '/?apikey=' + self._apiKey,
                    data: {'value': value},
                    dataType: 'json'
                });
            };

            // Si no hay api key cargada, generala y al acabar sube el valor al server
            if (!this._apiKey) {
                this._getApiKey({callback: push});

            // Si la apikey existe, simplemente sube al server
            } else {
                push();
            }
        },

        _getAll: function () {

        },

        /**
         * Sincroniza los datos locales con el servidor
         */
        synchronize: function () {

        },

        /**
         * Le pide una apiKey al server y la guarda en las preferencias
         */
        _getApiKeyFromServer: function (callback) {
            localStorage.removeItem("API_KEY");
            this._apiKey = undefined;

            this._system.log("Persist._generateApiKey()");

            $.ajax({
                type: 'POST',
                url: this._server + 'preferences/',
                data: "",
                dataType: 'json',
                context: this
            }).done(function (data) {
                this._system.log("Generated API Key:" + JSON.stringify(data));
                // Guarda en persistent y en localStorage
                this._apiKey = data.apikey;
                localStorage.setItem('API_KEY', data.apikey);

                callback();
                this._saveApiKeyInFC(data.apikey); //guardamos la API key generada en las suscripciones
            });
        },

        /**
         * Intenta leer la apiKey en FC, y si falla, se trae una del server
         * @param specs.callback - optional function
         * @param specs.getFromServer - optional bool. Si falla, traemos una del server?
         */
        _getApiKey: function (specs) {
            // Defaults
            specs.callback = specs.callback || function () {};

            if (specs.getFromServer === undefined) {
                specs.getFromServer = true;
            }

            // Antes de nada intenta leer la apiKey localmente
            var apiKey = localStorage.getItem('API_KEY');
            if (apiKey) {
                this._apiKey = apiKey;
                specs.callback();
            }

            $.ajax({
                url: 'http://www.forocoches.com/foro/subscription.php?do=editfolders',
                context: this
            }).done(function (data) {
                var documentResponse = $.parseHTML(data);
                var folder = $(documentResponse).find("input[name='folderlist[50]']");

                // La API key existe. Guarda y llama al callback
                if (folder.length > 0) {
                    this._apiKey = folder.val().replace("shurkey-", "");
                    specs.callback();

                // La API key no esta en FC, pide una al server
                } else if (specs.getFromServer){
                    this._getApiKeyFromServer(specs.callback);

                }
            });

            // Devuelve valor de forma sincronica. Util para llamar a esta funcion de forma cansina hasta que devuelva un valor
            return this._apiKey;
        },

        /**
         * Guarda la API key en las suscripciones
         * Comprueba que el guardado sea exitoso. En caso contrario insiste una y otra vez...
         */
        _saveApiKeyInFC: function(apiKey) {

            // Evita la jodienda del cambio de contexto
            var self = this;

            // TODO [ikaros45 11.04.2014]: usa jQuery en lugar de ajax a pelo!!

            var folderName = "shurkey-" + apiKey;
            var securitytoken = $("input[name='securitytoken']").val(); //Numero de seguridad que genera el vbulletin para autenticar las peticiones
            var params = "s=&securitytoken=" + securitytoken + "&do=doeditfolders&folderlist[50]=" + folderName + "&do=doeditfolders";

            $.ajax({
                url: 'http://www.forocoches.com/foro/subscription.php?do=doeditfolders',
                data: params,
                type: 'post'
            }).done(function () {
                if (self._getApiKey({getFromServer: false}) === undefined) { // Comprobamos que se ha guardado. si no se ha guardado
                    self._saveApiKeyInFC(apiKey); // Insistimos, hasta que se guarde o algo pete xD
                }
            });
        }
    };

})(SH, jQuery, window.localStorage);
