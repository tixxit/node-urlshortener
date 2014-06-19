
var UrlShortenerAPI = require('./lib/api');
var UrlShortenerServer = require('./lib/server');

var _config = {
    'baseUrl': 'http://localhost:9000',
    'port': 9000,
    'storage': 'memory'
};

UrlShortenerAPI.init(_config, function(err) {
    if (err) {
        throw err;
    }

    UrlShortenerServer.init(_config, function(err, app, server) {
        if (err) {
            throw err;
        }

        console.log('Server running on port %s', 9000);
    });
});
