"use strict"
let db = require("./db.js")
let l = require("../util/log.js")

module.exports = {

    loadTickets(c) {
        return () => db.query(c, "select * from ticket")
    },

    loadTicket(c, ticketName) {
        return db.queryOne(c, "select * from ticket where name = ?", [ticketName])
    },

    addTicket(c, ticketName, userId, teamId) {
        l("Adding ticket for " + ticketName)
        // Add if it does not already exist
        return this.loadTicket(c, ticketName).then(
            (ticket) => {
                return ticket
            },
            () => {
                db.query(c, "insert into ticket (added, name, addedBy, teamId) values (?,?,?,?)",
                    [new Date(), ticketName, userId, teamId]).
                then(() => {
                    return this.loadTicket(c, ticketName)
                })

            }
        )
    },

    deleteTicket(c, ticketId, userId, teamId) {
        return db.query(c, "delete from ticket where ticketId = ? and addedBy = ? and teamId = ?", [ticketId, userId, teamId])
    },

    setFrozen(c, ticketId, userId, freeze) {
        l("setFrozen: " + [...arguments]);
        return db.query(c, "update ticket set frozen = ? where ticketId = ? and addedBy = ?",
            [freeze ? 'Y' : 'N', ticketId, userId]);
    }

}