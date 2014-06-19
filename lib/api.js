var util = require('util');
var validUrl = require('valid-url');

var UrlShortenerStorage = null;
var UrlShortenerUtil = require('./util');

var init = module.exports.init = function(config, callback) {
    UrlShortenerStorage = require(util.format('./storage/%s', config.storage));
    callback();
};

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

var getFullUrlById = module.exports.getFullUrlById = function(id, callback) {
    UrlShortenerStorage.get(id, function(err, fullUrl) {
        if (err) {
            return callback(err);
        }

        return callback(null, fullUrl);
    });
};
