
module.exports = exports = MysqlSession;

function MysqlSession(connection, connectionManager) {
    this._connection = connection;
    this._cm = connectionManager;
}

MysqlSession.prototype.execute = function (params, callback) {
    var self = this;
    var query = params.query;
    var values = params.values;

    this._connection.query(query, values, callback);
};

MysqlSession.prototype.find = function (params, callback) {
    this.execute(params, function (err, rows) {
        if (err) {
            callback(err);
            return;
        }

        if (rows && rows.length) {
            callback(null, rows);
        } else {
            callback(null, []);
        }
    });
};

MysqlSession.prototype.end = function (callback) {
    if (!callback) callback = function () {};

    this._cm.end(this._connection, callback);
};


MysqlSession.prototype.begin = function (callback) {
    var self = this;

    self._connection.query("SET autocommit=0", function (err) {
        if (err) {
            callback(err);
        } else {
            self._connection.query("START TRANSACTION", callback);
        }
    });
};

MysqlSession.prototype.commit = function (callback) {
    var self = this;

    self._connection.query("COMMIT", function(err) {
        if (err) {
            callback(err);
        } else {
            self._connection.query("SET autocommit=1", callback);
        }
    });
};

MysqlSession.prototype.rollback = function (callback) {
    var self = this;

    self._connection.query("ROLLBACK", function(err) {
        if (err) {
            callback(err);
        } else {
            self._connection.query("SET autocommit=1", callback);
        }
    });
};
