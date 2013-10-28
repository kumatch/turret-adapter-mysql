var _ = require('lodash');
var format = require('util').format;

var queryBuilder = exports;

queryBuilder.createSelectParameter = function (options, criteria, orderBy, limit, offset) {
    var table = options.table;
    var primary = normalizePrimaryParameter(options.primary);
    if (!primary) {
        return false;
    }

    var query = format('SELECT * FROM %s', table);
    var values = [];
    var where = "", order = "";

    if (!criteria) criteria = {};
    if (!orderBy)  orderBy = {};
    orderBy[primary.key] = "ASC";


    _.each(criteria, function (v, k) {
        if (where) {
            where += ' AND';
        } else {
            where = ' WHERE';
        }

        where += format(' `%s` = ?', k);
        values.push(v);
    });

    _.each(orderBy, function (v, k) {
        if (order) {
            order += ', ';
        } else {
            order += ' ORDER BY';
        }

        if (v.toLowerCase() === 'asc' || v.toLowerCase() === 'desc') {
            order += format(' `%s` %s', k, v);
        } else {
            order += format(' `%s` %s', k, v ? 'ASC' : 'DESC');
        }
    });

    query += ' ' + where;
    query += ' ' + order;

    if (limit && (limit + '').match(/^[0-9]+$/)) {
        query += format(' LIMIT %s', limit);

        if (offset && (offset + '').match(/^[\-]?[0-9]+$/)) {
            query += format(' OFFSET %s', offset);
        }
    } else if (offset && (offset + '').match(/^[\-]?[0-9]+$/)) {
        query += format('LIMIT 18446744073709551615 OFFSET %s', offset);
    }


    // console.log(query);

    return {
        query: query,
        values: values
    };
};


queryBuilder.createPersistenceParameter = function (options, entity) {
    var isDirty = false;
    var table = options.table;
    var query;

    var primary = normalizePrimaryParameter(options.primary);
    if (!primary) {
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

        query = format('INSERT INTO %s ( %s ) VALUES ( %s )',
                       table,
                       columns.join(', '),
                       ( _.times(columns.length, function () { return '?'; }) ).join(', ')
                      );
    } else {
        values.push( entity[primary.key] );

        query = format('UPDATE %s SET %s WHERE `%s` = ?',
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


queryBuilder.createRemoveParameter = function (options, entity) {
    var table = options.table;
    var primary = normalizePrimaryParameter(options.primary);
    if (!primary) {
        return false;
    }

    if (!entity[primary.key]) {
        throw Error(format('invalid entity, primary key "%s" is blank.', primary.key));
    }


    var query  = format('DELETE FROM %s WHERE `%s` = ?', table, primary.key);
    var values = [ entity[primary.key] ];

    return {
        query: query,
        values: values
    };
};


function normalizePrimaryParameter (params) {
    if (!params) {
        return {
            key: "id"
        };
    } else if (_.isString( params )) {
        return {
            key: params
        };
    } else if (_.isObject( params )) {
        if (params.key) {
            return params;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function checkEntityModified(entity, checker) {
    var modified = false;

    if ( _.isFunction( entity[checker] )) {
        modified = entity[checker]();
    } else if (entity[checker]) {
        modified = entity[checker] ? true : false;
    }

    return modified;
}