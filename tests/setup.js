
var assert = require('assert');

var UrlShortenerAPI = require('../lib/api');
var UrlShortenerServer = require('../lib/server');

var _testConfig = {
    'baseUrl': 'http://my.test.server:8080',
    'initialHashSize': 1,
    'port': 9001,
    'storage': 'memory',
    'redis': {
        'dbIndex': 1
    }
};

before(function(callback) {
    // Initialize the test server and api
    UrlShortenerAPI.init(_testConfig, function(err) {
        assert.ok(!err);
        UrlShortenerServer.init(_testConfig, function(err) {
            assert.ok(!err);
            return callback();
        });
    });
});
