var _ = require('lodash');
var format = require('util').format;

var primaryParameter = require('./primaryParameter');

module.exports = exports = PersistenceQueryBuilder;

function PersistenceQueryBuilder (options) {
    this._options = options;
}

PersistenceQueryBuilder.prototype.createParameter = function (entity) {
    var options = this._options;
    var table = options.table;
    var isDirty = false;
    var query;

    var primary = primaryParameter.normalize(this._options.primary);

    if (!table || !primary) {
        return false;
    }

    var columns = _.reject(_.keys(entity), function (column) {
        return column === primary.key;
    });

    var values  = _.map(columns, function (column) {
        return entity[column];
    });


    if (options.modify_check) {
        isDirty = checkEntityModified(entity, options.modify_check) ? true : false;
    } else {
        isDirty = entity[primary.key] ? true : false;
    }


    if (!isDirty) {
        if (entity[primary.key]) {
            columns.push( primary.key );
            values.push( entity[primary.key] );
        }

        query = format('INSERT INTO `%s` ( %s ) VALUES ( %s )',
                       table,
                       (_.map(columns, function (c) { return format('`%s`', c); } )).join(', '),
                       ( _.times(columns.length, function () { return '?'; }) ).join(', ')
                      );
    } else {
        values.push( entity[primary.key] );

        query = format('UPDATE `%s` SET %s WHERE `%s` = ?',
                       table,
                       ( _.map(columns, function (column) {
                           return format('`%s` = ?', column);
                       }) ).join(', '),
                       primary.key
                       );
    }

    return {
        query: query,
        values: values
    };
};


function checkEntityModified(entity, checker) {
    var modified = false;

    if ( _.isFunction( entity[checker] )) {
        modified = entity[checker]();
    } else if (entity[checker]) {
        modified = entity[checker] ? true : false;
    }

    return modified;
}