var mysql = require('mysql');

module.exports = exports = MysqlConnectionManager;

exports.create = function (params) {
    return new MysqlConnectionManager(params);
};


function MysqlConnectionManager (params) {
    this._params = params;
}

MysqlConnectionManager.prototype.start = function (callback) {
    var connection = mysql.createConnection(this._params);

    connection.connect(function (err) {
        if (err) {
            callback(err);
        } else {
            callback(null, connection);
        }
    });
};

MysqlConnectionManager.prototype.end = function (connection, callback) {
    if (!callback) callback = function () {};

    connection.end(callback);
};
