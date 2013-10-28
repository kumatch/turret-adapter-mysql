var _ = require('lodash');

exports.normalize = function (params) {
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
};