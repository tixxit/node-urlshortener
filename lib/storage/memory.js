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
 * Set a key-value pair.
 *
 * @param   {String}    key             The key that identifies the value
 * @param   {String}    value           The value to set
 * @param   {Function}  callback        Invoked when the value is set
 * @param   {Object}    callback.err    An error that occurred, if any
 */
var set = module.exports.set = function(key, value, callback) {
    _db[key] = value;
    callback();
};
