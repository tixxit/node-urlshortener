var util = require('util');
var validUrl = require('valid-url');

var UrlShortenerStorage = null;
var UrlShortenerUtil = require('./util');

var _initialHashSize = null;

/**
 * Initialize the URL Shortener API.
 *
 * @param   {Object}    config                      The system configuration
 * @param   {String}    [config.storage=memory]     The type of storage to use ('memory' or 'redis')
 * @param   {Number}    [config.initialHashSize=4]  The initial size to use for the hash for
 *                                                  resolving a unique url
 * @param   {Function}  callback                    Invoked when the service is initialized
 */
var init = module.exports.init = function(config, callback) {
    var storageType = config.storage || 'memory';
    _initialHashSize = config.initialHashSize || 4;

    UrlShortenerStorage = require(util.format('./storage/%s', storageType));
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
    _setWithUniqueKey(normalizedUrl, _initialHashSize, callback);
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

/*!
 * Given a value, derive a unique key and persist the key-value pair into storage. The storage will
 * never have 2 keys for the same value.
 *
 * @param   {String}    value       The value to persist
 * @param   {Number}    hashSize    The initial hash size to attempt
 * @param   {Function}  callback    Invoked when a unique key has been derived and persisted
 */
function _setWithUniqueKey(value, hashSize, callback, _hash) {
    _hash = _hash || UrlShortenerUtil.hash(value);

    var key = UrlShortenerUtil.urlSafeBase64Encode(_hash.slice(0, hashSize));
    UrlShortenerStorage.setnx(key, value, function(err, preExistingValue) {
        if (err) {
            return callback(err);
        } else if (preExistingValue && preExistingValue !== value) {
            // There was an existing value that was not equal to the value we're setting. This means
            // we had a legit collision and need to retry with a slightly larger hash
            return _setWithUniqueKey(value, hashSize + 1, callback, _hash);
        }

        return callback(null, key);
    });
}
