var assert = require('assert');
var request = require('request');
var util = require('util');

/**
 * Shorten a url against the url shortener api
 *
 * @param   {String}    url         The url to shorten
 * @param   {Function}  callback    Invoked when complete
 */
var shorten = module.exports.shorten = function(url, callback) {
    request.post('http://localhost:9001/', {'form': {'url': url}}, function(err, response, body) {
        if (err) {
            return callback(err);
        }

        body = JSON.parse(body);
        if (response.statusCode >= 400) {
            body.code = response.statusCode;
            return callback(body);
        }

        return callback(null, body);
    });
};
 
/**
 * Get the redirect target for a shortened url
 *
 * @param   {String}    shortUrl    The shortened url
 * @param   {Function}  callback    Invoked when complete
 */
var redirect = module.exports.redirect = function(shortUrl, callback) {
    request.get({
        'url': shortUrl,
        'followRedirect': false
    }, function(err, response, body) {
        if (err) {
            return callback(err);
        }

        if (response.statusCode !== 301) {
            body = JSON.parse(body);
            body.code = response.statusCode;
            return callback(body);
        }

        return callback(null, response.headers.location);
    });
};

/**
 * Ensure the redirect for the given short url is valid.
 *
 * @param   {String}    shortUrl            The short url for which to request a redirect
 * @param   {String}    expectedRedirectUrl The expected target for the redirect
 * @param   {Functino}  callback            Invoked when complete
 */
var assertValidRedirectResponse = module.exports.assertValidRedirectResponse = function(shortUrl, expectedRedirectUrl, callback) {
    shortUrl = util.format('http://localhost:9001/%s', shortUrl.split('/').pop());
    redirect(shortUrl, function(err, targetUrl) {
        assert.ifError(err);
        assert.strictEqual(targetUrl, expectedRedirectUrl);
        return callback();
    });
};

/**
 * Ensure the redirect fails due to it being a non-existing short url id.
 *
 * @param   {String}    shortUrl    The url to try and redirect
 * @param   {Function}  callback    Invoked when complete
 */
var assertNonExistingRedirectError = module.exports.assertNonExistingRedirectError = function(shortUrl, callback) {
    redirect(shortUrl, function(err, targetUrl) {
        assertNonExistingKeyError(shortUrl.split('/').pop(), err);
        assert.ok(!targetUrl);
        return callback();
    });
};

/**
 * Ensure all the provided urls are invalid and cannot be shortened
 *
 * @param   {String[]}  urls        The urls to try and shorten
 * @param   {Function}  callback    Invoked when complete
 */
var assertInvalidShortenUrls = module.exports.assertInvalidShortenUrls = function(urls, callback) {
    if (!urls.length) {
        return callback();
    }

    shorten(urls.shift(), function(err, response) {
        assertInvalidShortenUrlError(err);
        assert.ok(!response);
        return assertInvalidShortenUrls(urls, callback);
    });
};

/**
 * Ensure all urls are successfully shortened
 *
 * @param   {String[]}  urls                The urls to shorten
 * @param   {Function}  callback            Invoked when complete
 * @param   {String[]}  callback.shortUrls  The shortened urls
 */
var assertValidShortenUrls = module.exports.assertValidShortenUrls = function(urls, callback, _shortUrls) {
    _shortUrls = _shortUrls || [];
    if (!urls.length) {
        return callback(_shortUrls);
    }

    shorten(urls.shift(), function(err, response) {
        assert.ifError(err);
        assertValidShortenUrlResponse(response);
        _shortUrls.push(response.url);
        return assertValidShortenUrls(urls, callback, _shortUrls);
    });
};

/**
 * Ensure the successful response for shortening a url is valid
 *
 * @param   {Object}    response    The response from the server
 */
var assertValidShortenUrlResponse = module.exports.assertValidShortenUrlResponse = function(response) {
    assert.ok(response);
    assert.ok(response.url);
    assert.strictEqual(response.url.indexOf('http://my.test.server:8080/'), 0);

    // Generically ensure no '=' padding is present in the short id
    assert.strictEqual(response.url.indexOf('='), -1);
};

/**
 * Ensure the error from shortening a url indicates that the provided url was invalid
 *
 * @param   {Object}    err     The error from the server
 */
var assertInvalidShortenUrlError = module.exports.assertInvalidShortenUrlError = function(err) {
    assert.ok(err);
    assert.strictEqual(err.code, 400);
    assert.strictEqual(err.message, 'A valid URL should be provided');
};

/**
 * Ensure the error from requesting a redirect indicates that the short url id did not exist
 *
 * @param   {String}    key     The short url id that was used
 * @param   {Object}    err     The error from the server
 */
var assertNonExistingKeyError = module.exports.assertNonExistingKeyError = function(key, err) {
    assert.ok(err);
    assert.strictEqual(err.code, 404);
    assert.strictEqual(err.message, util.format('Entry with key "%s" not found', key));
};
