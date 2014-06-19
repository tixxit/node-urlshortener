var path = require('path');

var UrlShortenerAPI = require('./lib/api');
var UrlShortenerServer = require('./lib/server');

var _config = require(path.resolve(__dirname, 'config'));

/*!
 * Initialize both the shortener api and the server using the system configuration
 */
UrlShortenerAPI.init(_config, function(err) {
    if (err) {
        throw err;
    }

    UrlShortenerServer.init(_config, function(err, app, server) {
        if (err) {
            throw err;
        }

        console.log('Server running on port %s', _config.port);
    });
});
