var db = require("./db.js");



var l = console.log;

module.exports = {

    loadUserByUserId : function(c, userId) {
        l("user-dao.loadUserByUserId: Loading user with userId " + userId)
        return db.queryOne(c, "select * from user where userId = ?", [userId])
    },

    loadUserByFbId : function(c, fbId) {
        l("user-dao.loadUserByFbId: Loading user with fbId " + fbId)
        return db.queryOne(c, "select * from user where fbId = ?", [fbId])
    },

    addUserByFbId : function(c, fbId, name) {
        l("user-dao.addUserByFbId: adding '" + name + "' with id " + fbId)
        return db.query(c, "insert into user (fbId, name) values (?, ?)", [fbId, name])
    },

    changeTeamPreference : function(c, userId, teamId) {
        l("user-dao.changeTeamPreference(userId=" + userId + ", teamId=" + teamId)
        return db.query(c,
            "update user set teamChoice = ? where userId = ?", [teamId, userId]
          )
    },

    // Returns the teamId and teamName
    loadTeamPreference : function(c, userId) {
        return db.queryOne(c,
            "select t.teamId, t.teamName from user u, team t where u.teamChoice = t.teamId and u.userId = ?",
            [userId]
        )
    }

/*
    return db.query(c,
        "insert into user (tagId, name, email, fbId, fbLink, role, first_name, last_name, locale, timezone) " +
        "values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        ['', auth.name, registration.email, auth.id, auth.link, role, auth.first_name, auth.last_name, auth.locale, auth.timezone]
    );
*/


}