var util = require('util');

var _db = {};

var get = module.exports.get = function(key, callback) {
    if (!(key in _db)) {
        return callback({'code': 404, 'message': util.format('Entry with key "%s" not found', key)});
    }

    callback(null, _db[key]);
};

var set = module.exports.set = function(key, value, callback) {
    _db[key] = value;
    callback();
};
