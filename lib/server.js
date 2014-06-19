var bodyParser = require('body-parser');
var express = require('express');
var path = require('path');
var util = require('util');

var UrlShortenerAPI = require('./api');

var init = module.exports.init = function(config, callback) {
    var port = config.port || 9000;

    var app = express();
    app.use(bodyParser.urlencoded());
    app.use(express.static(path.resolve(__dirname, '..', 'static')));

    app.get(/^\/([a-zA-Z0-9\-_]+)$/, function(req, res) {
        UrlShortenerAPI.getFullUrlById(req.params[0], function(err, url) {
            if (err) {
                return _sendError(res, err);
            }

            return res.redirect(301, url);
        });
    });

    app.post('/', function(req, res) {
        UrlShortenerAPI.createShortenedUrlId(req.body.url, function(err, id) {
            if (err) {
                return _sendError(res, err);
            }

            return res.send(200, {'url': util.format('%s/%s', config.baseUrl, id)});
        });
    });

    var server = app.listen(port, function() {
        return callback(null, app, server);
    });
};

function _sendError(res, err) {
    res.send(err.code, {'message': err.message});
}
