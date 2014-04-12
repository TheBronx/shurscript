/**
 * Modulo de persistencia
 */
(function (SH, $, _, localStorage, undefined) {
    'use strict';

    SH.persist = {
        _system: SH.system.getInstance('Persist'),
        _server: SH.config.server,

        /**
         * Guarda en localStorage serializando automaticamente
         */
        _setLocalValue: function (key, value) {
            // Asegurate de que hay algo que guardar
            if (value === undefined) {
                this._system.throw('Error setLocalValue', 'Valor para guardar no definido');
            }

            value = JSON.stringify(value);
            localStorage.setItem(key, value);
        },

        /**
         * Lee del localStorage desserializando automaticamente
         */
        _getLocalValue: function (key) {
            var val = localStorage.getItem(key);

            // Si no habia nada guardado, devuelve null
            if (val === null) {return val;}

            // Si habia algo, deserializa y devuelve
            return JSON.parse(val);
        },

        /**
         * Borra del local store
         */
        _removeLocalValue: function (key) {
            localStorage.removeItem(key);
        },

        /**
         * Crea una instancia de persist para un modulo en concreto
         */
        getInstance: function(id) {
            var pers = Object.create(this);
            pers.id = id;

            return pers;
        },

        /**
         * Compone una llave id + key para evitar colisiones en localstore
         * entre modulos
         */
        _composeKey: function (key) {
            return this.id + '_'  + key;
        },

        /**
         * Devuelve un valor
         *
         * @param key Key a extraer
         * @param def Default value (opcional)
         */
        getValue: function (key, def) {
            key = this._composeKey(key);
            var val = this._getLocalValue(key);

            if (val === null) {return def;}

            return val;
        },

        /**
         * Nombres de keys no permitidos
         */
        _forbiddenKeys: ['__timestamp__'],

        /**
         * Guarda un par key-value
         *
         * @param key
         * @param value
         * @param {bool} toServer - default true - si queremos propagar el cambio al server o no.
         */
        setValue: function (key, value, toServer) {
            if (toServer === undefined) {
                toServer = true;
            }

            // Evita que se utilicen keys reservadas para el sistema
            if (_.contains(this._forbiddenKeys, key)) {
                this._system.throw('Key reservada para el sistema: ' + key);
            }

            key = this._composeKey(key);
            this._setLocalValue(key, value);

            if (toServer) {
                this._setServerValue(key, value);
            }
        },

        /**
         * Guarda en localStore el timestamp
         */
        _setTimestamp: function (timestamp) {
            this._setLocalValue('__timestamp__', timestamp);
        },

        /**
         * Lee todos los valores de la nube que le correspondan a la actual apikey
         * y pasaselos al callback
         */
        _getAllServerInfo: function (callback) {

            var url = this._server + 'preferences/?apikey=' + this._apiKey;

            $.ajax({
                type: 'get',
                url: url,
                dataType: 'json',
                context: this
            }).done(callback);
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
                    dataType: 'json',
                    context: self
                }).done(function (data) {
                    self._setTimestamp(data.timestamp);
                });
            };

            self._executeWhenApiKeyReady(push);

        },

        /**
         * Si es necesario, sincroniza los datos locales con el servidor y reinicia la
         * pagina
         */
        synchronize: function () {

            var self = this;

            // Funcion a llamar cuando los datos del servidor hayan sido recogidos
            var whenServerDataReady = function (fullServerData) {
                var localTimestamp = self._getLocalValue('__timestamp__');

                // testing...
                fullServerData.timestamp = 666;

                // Si hay desincronizacion...
                if (fullServerData.timestamp !== localTimestamp) {

                    // Guarda toda la informacion en local
                    _.each(fullServerData, function (value, key) {
                        // El false es para no volver a enviar al server
                        self.setValue(key, value, false);
                    });

                    // Guarda el nuevo timestamp
                    self._setTimestamp(fullServerData.timestamp);

                    // Recarga la pagina usando la cache
                    window.location.reload(false);
                }
            };

            // Cuando la apiKey esté lista, llamamos al getServerInfo pasandole la funcion que sincroniza
            var whenApiKeyAvailable = _.partial(self._getAllServerInfo, whenServerDataReady);

            // Finalmente llama a la funcion que llama funciones cuando la apiKey esta lista
            this._executeWhenApiKeyReady(whenApiKeyAvailable);
        },

        /**
         * Le pide una apiKey al server y la guarda en las preferencias
         */
        _getApiKeyFromServer: function (callback) {
            this._removeLocalValue("API_KEY");
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
                this._setLocalValue('API_KEY', data.apikey);

                callback();
                this._saveApiKeyInFC(data.apikey); //guardamos la API key generada en las suscripciones
            });
        },

        /**
         * Intenta leer la apiKey en FC, y si falla, se trae una del server
         * @param specs.callback - optional function
         * @param specs.getFromServer - optional bool. Si falla, traemos una del server?
         */
        _getApiKeyFromFC: function (specs) {
            // Defaults
            var defs = {
                callback: function () {},
                getFromServer: true
            };

            specs = _.defaults(specs, defs);

            $.ajax({
                url: 'http://www.forocoches.com/foro/subscription.php?do=editfolders',
                context: this

            }).done(function (data) {
                var documentResponse = $.parseHTML(data);
                var folder = $(documentResponse).find("input[name='folderlist[50]']");

                // La API key existe. Guarda en objecto, en storage y llama al callback
                if (folder.length > 0) {
                    this._apiKey = folder.val().replace("shurkey-", "");
                    this._setLocalValue('API_KEY', this._apiKey);
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

            var folderName = "shurkey-" + apiKey;
            var securitytoken = $("input[name='securitytoken']").val(); //Numero de seguridad que genera el vbulletin para autenticar las peticiones
            var params = "s=&securitytoken=" + securitytoken + "&do=doeditfolders&folderlist[50]=" + folderName + "&do=doeditfolders";

            $.ajax({
                url: 'http://www.forocoches.com/foro/subscription.php?do=doeditfolders',
                data: params,
                type: 'post'
            }).done(function () {
                if (self._getApiKeyFromFC({getFromServer: false}) === undefined) { // Comprobamos que se ha guardado. si no se ha guardado
                    self._saveApiKeyInFC(apiKey); // Insistimos, hasta que se guarde o algo pete xD
                }
            });
        },

        /**
         * Ejecuta un callback cuando la apiKey esta lista
         */
        _executeWhenApiKeyReady: function (callback) {
            // Si la apikey existe, simplemente sube al server
            if (this._apiKey) {
                callback.call(this);
                return;
            }

            // Intenta leer del local storage. Si hay, actualiza this, y sube al server
            var apiKey = this._getLocalValue('API_KEY');
            if (apiKey) {
                this._apiKey = apiKey;
                callback.call(this);
                return;
            }

            // Si no hay api key cargada, generala y al acabar sube el valor al server
            this._getApiKeyFromFC.call(this, {callback: callback});

        }
    };

})(SH, jQuery, _, window.localStorage);
