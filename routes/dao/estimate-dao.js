"use strict"
let Q = require("q");
let db = require("./db.js")
let moment = require("moment")
let GroupEstimate = require("../model/GroupEstimate")
let l = require("../util/log.js")

module.exports = {

    /**
     * [{ticketName : "", estimate : "", users : [fbId], isOwner : bool }]
     *
     * @param c
     * @param daysBack  Only load ticket estimates newer than this many days old.
     * @param userId    Needed in order to match tickets to their owner and to set the isOwner flag.
     * @param teamId    Only load ticket estimates for tickets created for this team.
     */
    loadEstimates(c, daysBack, userId, teamId) {
        l("Loading estimates " + daysBack + " days back for team " + teamId);
        return db.query(c,
            "select " +
                "t.ticketId, " +
                "t.name, " +
                "t.addedBy, " +
                "t.added," +
                "t.frozen, " +
                "e.estimate, " +
                "u.fbId, " +
                "u.name as userName " +
            "from " +
                "ticket t " +
                "left join estimate e on t.ticketId = e.ticketId " +
                "left join user u     on e.userId = u.userId " +
            "where t.added >= ? and t.teamId = ? " +
            "order by t.added desc",
            [
                moment().add(-daysBack, 'day').toDate(),
                teamId
            ]).
        then((data) => {
            let estimateMap = new Map();

            l("Have " + data.length + " rows of estimates");

            for (let row of data) {
                let estimate = estimateMap.get(row.name);
                if (!estimate) {
                    estimate = new GroupEstimate(row.ticketId, row.name, userId, row.frozen, new Date(row.added));
                    estimate.owner = row.addedBy;

                    estimateMap.set(row.name, estimate);
                }
                if (row.fbId) {
                    estimate.addEstimate(row.fbId, row.userName, row.estimate);
                }
            }

            return Q(GroupEstimate.toList(estimateMap));

        });
    },

    setEstimate(c, ticketName, userId, teamId, estimate) {
        return db.query(c,
                "select e.id, e.ticketId from estimate e, ticket t " +
                "where e.ticketId = t.ticketId and " +
                "t.name = ? and " +
                "e.userId = ?", [ticketName, userId]).
            then((rows) => {
                if (rows.length == 0) {
                    // insert
                    return db.query(c,
                        "insert into estimate (ticketId, userId, estimate) " +
                        "select ticketId, ?, ? from ticket where name = ? and teamId = ? and frozen = 'N'",
                        [userId, estimate, ticketName, teamId]
                    );
                } else {
                    let ticketId = rows[0].ticketId;
                    // update
                    return db.query(c,
                        "update estimate set estimate = ? where userId = ? and ticketId in " +
                        "(select ticketId from ticket where ticketId = ? and frozen = 'N')",
                        [estimate, userId, ticketId]
                    );
                }
            });
    },

    /**
     * Queries for all estimates made by a userId
     * Loads a Map<ticketName, estimate>
     */
    loadUserEstimateMap(c, userId, teamId) {
        l("Here")
        return db.query(c,
                "select t.name, e.estimate from estimate e, ticket t " +
                "where e.userId = ? and t.teamId = ? and e.ticketId = t.ticketId",
                [userId, teamId]
            ).

            then((nameEstimates) => {
                console.log("Loaded " + nameEstimates.length + " estimates");
                let map = new Map()
                for (let ne of nameEstimates) {
                    map.set(ne.name, ne.estimate)
                }
                return map
            })
    },

    /**
     * Deletes all estimates for a ticket (if the user owns it)
     *
     * @param c         Connection
     * @param ticketId  The ticket to delete
     * @param userId    The user who is performing the delete (no deletes will happen unless the user owns the ticket)
     */
    deleteEstimates(c, ticketId, userId) {
        return db.query(c,
            "delete from estimate where ticketId in (select ticketId from ticket where addedBy = ? and ticketId = ?)",
            [userId, ticketId]
        )
    }
}