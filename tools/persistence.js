/**
 * Modulo de persistencia
 */
(function (SH, $, _, localStorage, undefined) {
    'use strict';

    // Funcion vacia
    var dummyFunc = function () {};

    // Nuestro
    var storage = {
        // Key unica por usuario para guardar en localStorage
        _key: 'shurstorage-' + SH.environment.user.name,

        // Aqui se guarda todo antes de ser guardado en localStorage
        memoryStorage: {},

        /**
         * Hace persistentes los datos guardados en memoryStorage
         */
        flush: function () {
            localStorage.setItem(this._key, JSON.stringify(this.memoryStorage));
        },

        loadFromLocalStore: function () {
            var data = localStorage.getItem(this._key);

            if (data) {
                this.memoryStorage = JSON.parse(data);
            }
        }

    };

    storage.loadFromLocalStore();

    SH.persist = {
        // ID/owner de este Persist
        owner: undefined,
        _system: SH.system.getInstance('Persist'),
        _server: SH.config.server,

        // Aqui se guardaran los datos correspondientes a
        _privateMemoryStorage: undefined,


        /**
         * Guarda en localStorage serializando automaticamente
         */
        _setLocalValue: function (key, value) {
            // Guarda en memoria
            this._privateMemoryStorage[key] = value;

            // Propaga cambios a localStorage de forma asincrona
            storage.flush();
        },

        /**
         * Lee del localStorage deserializando automaticamente
         */
        _getLocalValue: function (key) {
            return this._privateMemoryStorage[key];
        },

        /**
         * Borra del local store
         */
        _removeLocalValue: function (key) {
            delete this._privateMemoryStorage[key];
            storage.flush();
        },

        /**
         * Crea una instancia de persist para un modulo en concreto
         */
        getInstance: function(owner) {
            var pers = Object.create(this);
            pers.owner = owner;

            // Asegurate de que existe un substore para esta instancia de Persist
            storage.memoryStorage[owner] = storage.memoryStorage[owner] || {};

            // Guarda referencia
            pers._privateMemoryStorage = storage.memoryStorage[owner];

            return pers;
        },

        /**
         * Devuelve un valor
         *
         * @param key Key a extraer
         * @param def Default value (opcional)
         */
        getValue: function (key, def) {
            return this._privateMemoryStorage[key] || def;
        },

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

            var url = this._server + 'storage/?apikey=' + this._apiKey;

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
            var storeInServer = function () {
                $.ajax({
                    type: 'PUT',
                    url: self._server + 'storage/' + key + '/?apikey=' + self._apiKey,
                    data: {'value': value},
                    dataType: 'json',
                    context: self
                }).done(function (data) {
                    self._setTimestamp(data.timestamp);
                });
            };

            self._executeWhenApiKeyReady(storeInServer);

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
         * Le pide una apiKey al server y la guarda en las subscripciones de FC
         */
        _getApiKeyFromServer: function (callback) {

            callback = callback || dummyFunc;

            var self = this;
            self._removeLocalValue("API_KEY");
            self._apiKey = undefined;

            $.ajax({
                type: 'POST',
                url: self._server + 'storage/',
                data: "",
                dataType: 'json',
                context: self
            }).done(function (data) {
                self._system.log("Generated API Key:" + JSON.stringify(data));
                // Guarda en persistent y en localStorage
                self._apiKey = data.apikey;

                storage.memoryStorage.apiKey = data.apikey;
                storage.flush();

                // Guardamos la API key generada en las suscripciones en diferido
                _.defer(self._saveApiKeyInFC, data.apikey);

                callback();
            });
        },

        /**
         * Intenta leer la apiKey en FC, y si falla, se trae una del server
         * @param kwargs.callback - optional function
         * @param kwargs.getFromServer - optional bool. Si falla, traemos una del server?
         */
        _getApiKeyFromFC: function (kwargs) {

            // Mete defaults donde haga falta
            kwargs = _.defaults(kwargs, {
                onSuccess: dummyFunc,
                onError: dummyFunc
            });

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
                    kwargs.callback();

                // La API key no esta en FC, pasa control al callback
                } else {
                    kwargs.onError();

                }
            });
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
                if (self._getApiKeyFromFC() === undefined) { // Comprobamos que se ha guardado. si no se ha guardado
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

            // Si no hay api key cargada, intenta leerla de FC, y si falla, pidela al server
            var getFromServerAndStoreInFC = _.bind(this._getApiKeyFromServer,
                                                   this, callback);

            this._getApiKeyFromFC.call(this, {
                onSuccess: callback,
                onError: getFromServerAndStoreInFC
            });
        }
    };

})(SH, jQuery, _, window.localStorage);
