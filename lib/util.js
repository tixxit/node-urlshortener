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
 * Given a normalized url, create a short, consistent hash in a url-friendly form that can be used
 * as a unique identifier to the url.
 *
 * @param   {String}    normalizedUrl   The url to hash
 * @return  {String}                    The short, consistent hash that can be used as an identifier
 *                                      for the url
 */
var hashUrl = module.exports.hashUrl = function(normalizedUrl) {
    return crypto

            // Take an MD5 sum and base64 it to get a shortened hash string
            .createHash('md5')
            .update(normalizedUrl)
            .digest('base64')

            // + and / are not URL-friendly, convert them to an arbitrary alternative
            .replace(/\+/g, '-')
            .replace(/\//g, '_')

            // Ditch the padding
            .replace(/=/g, '');
};
