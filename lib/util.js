
var crypto = require('crypto');
var url = require('url');
var util = require('util');

var normalizeUrl = module.exports.normalizeUrl = function(rawUrl) {
    // Lower-case host and scheme
    return url.format(url.parse(rawUrl))

        // Replace all + encodings to %20 encodings
        .replace(/\+/, '%20')

        // Replace all mixed-case %-- representations to capitals
        .replace(/(%[a-z0-9][a-z0-9])/i, function(m) {
            return m.toUpperCase();
        });
};

var hashUrl = module.exports.hashUrl = function(normalizedUrl, callback) {
    return crypto

            // Take an MD5 sum and base64 it to get a shortened hash string
            .createHash('md5')
            .update(normalizedUrl)
            .digest('base64')

            // + and / are not URL-friendly, convert them to an arbitrary alternative
            .replace(/\+/g, '-')
            .replace(/\//g, '_')

            // The = padding is useless, just get rid of it
            .replace(/=/g, '');
};
