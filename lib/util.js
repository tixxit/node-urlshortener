var crypto = require('crypto');
var url = require('url');
var util = require('util');

/**
 * Given a validated url, normalize it into a canonical form.
 *
 * @param   {String}    rawUrl  The url to normalize
 * @return  {String}            A canonicalized but equivalent representation of the same url
 */
var normalizeUrl = module.exports.normalizeUrl = function(rawUrl) {
    // Lower-case host and scheme
    return url.format(url.parse(rawUrl))

        // Replace all + encodings to %20 encodings
        .replace(/\+/g, '%20')

        // Replace all mixed-case %-- representations to capitals
        .replace(/(%[a-z0-9][a-z0-9])/gi, function(m) {
            return m.toUpperCase();
        });
};

/**
 * Hash the given value and return its buffer.
 *
 * @param   {String}    value   The url to hash
 * @param   {Buffer}            The buffer that represents the hash of the value
 */
var hash = module.exports.hash = function(value) {
    return crypto
        .createHash('md5')
        .update(value)
        .digest();
};

/**
 * Create a url-safe base64 encoding of the provided buffer.
 *
 * @param   {Buffer}    buffer  The buffer to encode
 * @return  {String}            A base64 encoding that is safe to use in a url path
 */
var urlSafeBase64Encode = module.exports.urlSafeBase64Encode = function(buffer) {
    return buffer
        .toString('base64')

        // + and / are not URL-friendly, convert them to an arbitrary alternative
        .replace(/\+/g, '-')
        .replace(/\//g, '_')

        // Ditch the padding
        .replace(/=/g, '');
};
