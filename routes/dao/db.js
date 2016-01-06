var db = require("mysql")
var Q = require("q");
var l = require("../util/log");
var settings = require("../../databaseSettings.json");

l("Loaded database settings " + l(settings));

var me = {

    pool : null,

    wrap : function(cb) {
        return function(err, result) {
            if (err) throw err;
            cb(result);
        }
    },

    getPool : function() {
        if (me.pool == null) {
            me.pool = db.createPool(settings);
        }
        return me.pool;
    },

    go : function go(cb) {
        me.getPool().getConnection(function (err, c) {
            if (!err) {
                l("Connection obtained");

                try {
                    cb(c);

                    c.release();
                    l("Connection released");
                } catch (e) {
                    l("Connection problem");
                    d(e);
                }
            } else {
                l("Error obtaining connection" + l(err));
            }
        });
    },

    query : function(c, sql, params) {
        var q = Q.defer();

        c.query(sql, params, (err, rs) => {
            if (err) {
                l("Error : " + l(err));
                q.reject(err);
            } else {
                q.resolve(rs);
            }
        });

        return q.promise;
    },

    queryOne : function(c, sql, params) {
        var q = Q.defer();

        c.query(sql, params, (err, rs) => {
            if (err) {
                q.reject(err);
            } else if (rs.length != 1) {
                q.reject("Expected one result from " + sql + " with params [" + params.join(',') + "] but found " + rs.length);
            } else {
                q.resolve(rs[0]);
            }
        });

        return q.promise;
    }
};
module.exports = me;