var util = require('util');
var validUrl = require('valid-url');

var UrlShortenerStorage = null;
var UrlShortenerUtil = require('./util');

/**
 * Initialize the URL Shortener API.
 *
 * @param   {Object}    config                  The system configuration
 * @param   {String}    [config.storage=memory] The type of storage to use ('memory' or 'redis')
 * @param   {Function}  callback                Invoked when the service is initialized
 */
var init = module.exports.init = function(config, callback) {
    UrlShortenerStorage = require(util.format('./storage/%s', config.storage || 'memory'));
    UrlShortenerStorage.init(config, callback);
};

/**
 * Create a shortened url from the provided raw url.
 *
 * @param   {String}    rawUrl          The raw, unsanitized url
 * @param   {Function}  callback        Invoked when the url has been shortened
 * @param   {Object}    callback.err    An error that occurred, if any
 * @param   {String}    callback.id     The id to use in a shortened url
 */
var createShortenedUrlId = module.exports.createShortenedUrlId = function(rawUrl, callback) {
    if (!validUrl.isUri(rawUrl)) {
        return callback({'code': 400, 'message': 'A valid URL should be provided'});
    }

    var normalizedUrl = UrlShortenerUtil.normalizeUrl(rawUrl);
    var id = UrlShortenerUtil.hashUrl(normalizedUrl);
    UrlShortenerStorage.set(id, normalizedUrl, function(err) {
        if (err) {
            return callback(err);
        }

        return callback(null, id);
    });
};

/**
 * Get a full url from the id with which it was shortened.
 *
 * @param   {String}    id              The id that was given for the url
 * @param   {Function}  callback        Invoked when complete
 * @param   {Object}    callback.err    An error that occurred, if any
 * @param   {String}    callback.url    The full url based on the id
 */
var getFullUrlById = module.exports.getFullUrlById = function(id, callback) {
    UrlShortenerStorage.get(id, function(err, fullUrl) {
        if (err) {
            return callback(err);
        }

        return callback(null, fullUrl);
    });
};
