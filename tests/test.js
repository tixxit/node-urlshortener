var _ = require('underscore');
var assert = require('assert');

var TestUtil = require('./lib/util');

describe('#shorten', function() {

    it('returns a 400 error when valid urls are provided', function(callback) {
        TestUtil.assertInvalidShortenUrls([
            '',
            'www.google.ca',
            'http/www.google.ca',
            'http:// www.google.ca',
            'http://www.google.ca/pa th/with/space',
            '://www.google.ca/'
        ], callback);
    });

    it('succeeds with a variety of bizarre urls', function(callback) {
        TestUtil.assertValidShortenUrls([
            'http://www',
            'http://www-',
            'https://www-.goo',
            'https://www-.goo-gle',
            'https://www-.goo-gle.CA',
            'https://www-.goo-gle.CA/',
            'https://www-.goo-gle.CA/?',
            'https://www-.goo-gle.CA/?#',
            'https://www-.goo-gle.CA/?#?&',
            'https://www-.goo-gle.CA/?q=my+query#anchor?&',
            'https://www-.goo-gle.CA/?q=my+query&bleh#anchor?&',
            'https://www-.goo-gle.CA/?q=my+query%20LOL&bleh#anchor?&'
        ], function(shortenedUrls) {
            assert.strictEqual(shortenedUrls.length, 12);

            // The url with a trailing / and without are normalized equivalents, so one less unique
            // entry for that short url
            assert.strictEqual(_.uniq(shortenedUrls).length, 11);
            return callback();
        });
    });

    it('returns the same hash for variants of the same url', function(callback) {
        TestUtil.assertValidShortenUrls([
            'https://www-.goo-gle.CA/?q=my+query%20LOL&bleh%AF#anchor?&',
            'https://www-.goo-GLE.ca/?q=my+query%20LOL&bleh%AF#anchor?&',
            'https://www-.goo-gle.CA/?q=my%20query+LOL&bleh%AF#anchor?&',
            'https://www-.goo-gle.CA/?q=my%20query+LOL&bleh%aF#anchor?&',
            'https://www-.goo-gle.CA/?q=my%20query+LOL&bleh%af#anchor?&'
        ], function(shortenedUrls) {
            assert.strictEqual(shortenedUrls.length, 5);
            assert.strictEqual(_.uniq(shortenedUrls).length, 1);
            return callback();
        });
    });
});

describe('#redirect', function() {

    it('returns a 404 for non-existing keys', function(callback) {
        TestUtil.assertNonExistingRedirectError('http://localhost:9001/nonexisting', callback);
    });

    it('redirects to a full url', function(callback) {
        TestUtil.assertValidShortenUrls([
            'https://www-.goo-gle.CA/?q=my+query%20LOL&bleh%af#anchor?&'
        ], function(shortenedUrls) {
            var shortenedUrl = _.first(shortenedUrls);

            TestUtil.assertValidRedirectResponse(shortenedUrl,
                'https://www-.goo-gle.ca/?q=my%20query%20LOL&bleh%AF#anchor?&', callback);
        });
    });
});
