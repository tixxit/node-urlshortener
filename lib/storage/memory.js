var util = require('util');

var _db = null;

/**
 * Initialize the in-memory storage adapter.
 *
 * @param   {Object}    config      The system configuration
 * @param   {Function}  callback    Invoked when complete
 */
var init = module.exports.init = function(config, callback) {
    _db = {};
    callback();
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
    if (!(key in _db)) {
        return callback({
            'code': 404,
            'message': util.format('Entry with key "%s" not found', key)
        });
    }

    callback(null, _db[key]);
};

/**
 * Set a key-value pair if it has not already been set. If it was already set, return its current
 * value.
 *
 * @param   {String}    key                         The key that identifies the value
 * @param   {String}    value                       The value to set
 * @param   {Function}  callback                    Invoked when the value is set
 * @param   {Object}    callback.err                An error that occurred, if any
 * @param   {String}    [callback.existingValue]    The pre-existing value of the key
 */
var setnx = module.exports.setnx = function(key, value, callback) {
    if (key in _db) {
        // The key already existed, which indicates a collision. Return the current value
        return get(key, callback);
    }

    _db[key] = value;
    callback();
};
