var _ = require('lodash');
var format = require('util').format;

var queryBuilder = exports;

queryBuilder.createSelectParameter = function (options, criteria, orderBy, limit, offset) {
    var table = options.table;
    var primary = options.primary || "id";

    var query = format('SELECT * FROM %s', table);
    var values = [];
    var where = "", order = "";

    if (!criteria) criteria = {};
    if (!orderBy)  orderBy = {};
    orderBy[primary] = "ASC";


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
    var table = options.table;
    var primary = options.primary || "id";
    var isNew = false;

    var columns = _.reject(_.keys(entity), function (column) {
        return column === primary;
    });

    var values  = _.map(columns, function (column) {
        return entity[column];
    });


    var query;

    if (!entity[primary]) {
        query = format('INSERT INTO %s ( %s ) VALUES ( %s )',
                       table,
                       columns.join(', '),
                       ( _.times(columns.length, function () { return '?'; }) ).join(', ')
                      );
    } else {
        query = format('UPDATE %s SET %s WHERE `%s` = ?',
                       table,
                       ( _.map(columns, function (column) {
                           return format('`%s` = ?', column);
                       }) ).join(', '),
                       primary
                       );
        values.push( entity[primary] );
    }

    return {
        query: query,
        values: values
    };
};


queryBuilder.createRemoveParameter = function (options, entity) {
    var table = options.table;
    var primary = options.primary || "id";

    if (!entity[primary]) {
        throw Error(format('invalid entity, primary key "%s" is blank.', primary));
    }


    var query  = format('DELETE FROM %s WHERE `%s` = ?', table, primary);
    var values = [ entity[primary] ];

    return {
        query: query,
        values: values
    };
};
