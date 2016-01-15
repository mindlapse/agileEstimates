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
        return new Promise((y, n) => {
            c.query(sql, params, (err, rs) => {
                if (err) {
                    l("Error : " + l(err));
                    n(err);
                } else {
                    y(rs);
                }
            });
        });


        return q.promise;
    },

    queryOne : function(c, sql, params) {
        return new Promise((y, n) => {
            l("queryOne for " + sql + l(params))
            c.query(sql, params, (err, rs) => {
                if (err) {
                    l("Error " + l(err))
                    n(err);
                } else if (rs.length != 1) {
                    n("Expected one result from " + sql + " with params [" + params.join(',') + "] but found " + rs.length);
                } else {
                    l("Loaded " + l(rs[0]))
                    y(rs[0]);
                }
            });
        });
    }
};
module.exports = me;