var _ = require('lodash');
var format = require('util').format;

var primaryParameter = require('./primaryParameter');

module.exports = exports = DeleteQueryBuilder;

function DeleteQueryBuilder (options) {
    this._options = options;
}

DeleteQueryBuilder.prototype.createParameter = function (entity) {
    var options = this._options;
    var table = options.table;

    var primary = primaryParameter.normalize(this._options.primary);

    if (!table || !primary) {
        return false;
    }

    if (!entity[primary.key]) {
        throw Error(format('invalid entity, primary key "%s" is blank.', primary.key));
    }


    var query  = format('DELETE FROM `%s` WHERE `%s` = ?', table, primary.key);
    var values = [ entity[primary.key] ];

    return {
        query: query,
        values: values
    };
};
