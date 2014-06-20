var redis = require('redis');
var util = require('util');

var _db = null;

/**
 * Initialize the Redis storage adapter.
 *
 * @param   {Object}    config                          The system configuration
 * @param   {Object}    [config.redis]                  The redis configuration values
 * @param   {String}    [config.redis.host=127.0.0.1]   The host of the redis server
 * @param   {Number}    [config.redis.port=6379]        The port of the redis server
 * @param   {Function}  callback                        Invoked when complete
 * @param   {Error}     callback.err                    An error that occurred, if any
 */
var init = module.exports.init = function(config, callback) {
    // Resolve the redis configuration defaults
    var redisConfig = config.redis || {};
    var host = redisConfig.host || '127.0.0.1';
    var port = redisConfig.port || 6379;
    
    // Create the client and connect to redis
    _db = redis.createClient();
    _db.on('connect', function() {
        callback();
    });
};

/**
 * Get a value by its key.
 *
 * @param   {String}    key             The key of the value
 * @param   {Function}  callback        Invoked when the value is retrieved
 * @param   {Object}    callback.err    An error that occurred, if any
 * @param   {String}    callback.value  The value associated to the key
 */
var get = module.exports.get = function(key, callback) {
    _db.get(key, function(err, reply) {
        if (err) {
            return callback({
                'code': 500,
                'message': util.format('An unexpected error occurred getting key "%s", key', key)
            });
        } else if (!reply) {
            return callback({
                'code': 404,
                'message': util.format('Entry with key "%s" not found', key)
            });
        }

        callback(null, reply.toString());
    });
};

/**
 * Set a key-value pair.
 *
 * @param   {String}    key             The key that identifies the value
 * @param   {String}    value           The value to set
 * @param   {Function}  callback        Invoked when the value is set
 * @param   {Object}    callback.err    An error that occurred, if any
 */
var set = module.exports.set = function(key, value, callback) {
    _db.set(key, value, function(err) {
        if (err) {
            return callback({
                'code': 500,
                'message': util.format('An unexpected error occurred setting key "%s"', key)
            });
        }

        callback();
    });
};
