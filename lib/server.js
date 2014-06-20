var bodyParser = require('body-parser');
var express = require('express');
var path = require('path');
var util = require('util');

var UrlShortenerAPI = require('./api');

/**
 * Initialize the URL Shortener Server.
 *
 * @param   {Object}    config                                  The system configuration
 * @param   {Number}    [config.port=9000]                      The port on which to run the server
 * @param   {String}    [config.baseUrl=http://localhost:9000]  The base url for short id access
 * @param   {Function}  callback                                Invoked when init is complete
 */
var init = module.exports.init = function(config, callback) {
    var port = config.port || 9000;

    // Append the form encoding body parser and static files
    var app = express();
    app.use(bodyParser.urlencoded({'extended': false}));
    app.use(express.static(path.resolve(__dirname, '..', 'static')));

    /*!
     * Handles the request to be redirected to a shortened url by its id
     */
    app.get(/^\/([a-zA-Z0-9\-_]+)$/, function(req, res) {
        UrlShortenerAPI.getFullUrlById(req.params[0], function(err, url) {
            if (err) {
                return _sendError(res, err);
            }

            return res.redirect(301, url);
        });
    });

    /*!
     * Shortens a url
     */
    app.post('/', function(req, res) {
        UrlShortenerAPI.createShortenedUrlId(req.body.url, function(err, id) {
            if (err) {
                return _sendError(res, err);
            }

            return res.send(201, {'url': util.format('%s/%s', config.baseUrl, id)});
        });
    });

    // Start the express server and signal that intialization is complete
    var server = app.listen(port, function() {
        return callback(null, app, server);
    });
};

/*!
 * Send the standard error object on the HTTP response and commit it.
 *
 * @param   {Response}  res     The Express HTTP Response object on which to send the error
 * @param   {Object}    err     The error to send
 */
function _sendError(res, err) {
    res.send(err.code, {'message': err.message});
}
