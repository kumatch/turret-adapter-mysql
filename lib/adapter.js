var _ = require('lodash');
var format = require('util').format;

var Session = require('./session');
var ConnectionManager = require('./connectionManager');
var queryBuilder = require('./queryBuilder');

module.exports = exports = MysqlAdapter;

exports.create = function (params) {
    return new MysqlAdapter(params);
};


function MysqlAdapter (params) {
    this._cm = null;
    if (params) this._cm = new ConnectionManager(params);
}

MysqlAdapter.prototype.setConnectionManager = function (connection_manager) {
    this._cm = connection_manager;

    return this;
};

MysqlAdapter.prototype.getConnectionManager = function () {
    return this._cm;
};

MysqlAdapter.prototype.createSession = function (callback) {
    var self = this;

    self._cm.start(function (err, connection) {
        if (err) {
            callback(err);
        } else {
            var session = new Session(connection, self._cm);
            callback(null, session);
        }
    });
};

MysqlAdapter.prototype.createSelectParameter      = queryBuilder.createSelectParameter;
MysqlAdapter.prototype.createPersistenceParameter = queryBuilder.createPersistenceParameter;
MysqlAdapter.prototype.createRemoveParameter      = queryBuilder.createRemoveParameter;
