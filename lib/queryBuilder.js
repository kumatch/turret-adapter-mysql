var _ = require('lodash');
var format = require('util').format;

var SelectQueryBuilder = require('./queryBuilder/select');
var PersistenceQueryBuilder = require('./queryBuilder/persistence');
var DeleteQueryBuilder = require('./queryBuilder/delete');


module.exports = exports = QueryBuilder;

exports.create = function (options) {
    return new QueryBuilder(options);
};

function QueryBuilder (options) {
    this._options = options || {};
}

QueryBuilder.prototype.select = function () {
    return new SelectQueryBuilder(this._options);
};

QueryBuilder.prototype.persistence = function () {
    return new PersistenceQueryBuilder(this._options);
};

QueryBuilder.prototype.delete = function () {
    return new DeleteQueryBuilder(this._options);
};
