var _ = require('lodash');
var format = require('util').format;

var primaryParameter = require('./primaryParameter');

module.exports = exports = SelectQueryBuilder;

function SelectQueryBuilder (options) {
    this._options = options;

    this._table = options.table || null;
    this._fields = [];
    this._where = null;
    this._order = null;
    this._limit = null;
    this._offset = null;
    this._values = [];
}

SelectQueryBuilder.prototype.from = function (table) {
    this._table = table;
    return this;
};


SelectQueryBuilder.prototype.whereString = function (where, values) {
    this._where = where;
    this._values = values || [];

    return this;
};

SelectQueryBuilder.prototype.orderString = function (order) {
    this._order = order;

    return this;
};



SelectQueryBuilder.prototype.where = function (criteria) {
    var where = "";
    var values = [];

    _.each(criteria, function (v, k) {
        if (where) {
            where += ' AND ';
        }

        where += format('`%s` = ?', k);
        values.push(v);
    });

    this._where = where;
    this._values = values;

    return this;
};

SelectQueryBuilder.prototype.orderBy = function (orderBy) {
    var order = "";

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

    this._order = order;

    return this;
};

SelectQueryBuilder.prototype.limit = function (limit) {
    this._limit = limit;

    return this;
};

SelectQueryBuilder.prototype.offset = function (offset) {
    this._offset = offset;

    return this;
};


SelectQueryBuilder.prototype.createParameter = function () {
    var table = this._table;
    var fields = this._fields;
    var primary = primaryParameter.normalize(this._options.primary);

    if (!table || !primary) {
        return false;
    }

    if (!fields || !fields.length) fields = ['*'];

    var query = format('SELECT %s FROM `%s`',
                       fields.join(', '),
                       table
                      );
    var values = this._values;

    if (this._where) {
        query += ' WHERE ' + this._where;
    }

    if (this._order) {
        query += ' ORDER BY ' + order;
    } else {
        query += format(' ORDER BY `%s` ASC', primary.key);
    }

    var limit  = this._limit || undefined;
    var offset = this._offset || undefined;

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