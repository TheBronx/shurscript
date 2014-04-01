var Persistence = (function ($, _, undefined) {
    'use strict';
    var persist = {};
    var server = '...';

    var apiKey;

    var dummyFunc = function () {};

    /**
     * Devuelve funcion dummy si el callback no ha sido definido
     */
    var defaultCallback = function (callback) {
        if (callback === undefined) {
           return dummyFunc;
        }

        return callback;
    };

    /**
     * Guarda un key-value, y ejecuta opcionalmente un callback
     */
    persist.setValue = function (key, value, callback) {
        callback = defaultCallback(callback);

        $.ajax({
            type: 'PUT',
            url: server + 'preferences/' + key + '/?apikey=' + apiKey,
            data: {'value': value},
            dataType: 'json'
        }).done(callback);
    };

    persist.getValue = function () {};
    persist.getAll = function () {};


    return persist;
})(jQuery, _);