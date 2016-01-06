"use strict"
let db = require("./db.js")
let l = require("../util/log.js")

module.exports = {

    loadTeams(c) {
        return db.query(c, "select * from team")
    }


}