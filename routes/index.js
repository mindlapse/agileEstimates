"use strict"
let db = require('./dao/db')
let l = require("./util/log")
let express = require('express')
let router = express.Router()
let extend = require("extend");
let settings = require("../settings.json");

// Support teams, support sprints.
// DONE when a ticket is added, the results are reloaded
// TODO A team admin can delete an item
//      DONE add a delete icon
//      DONE Add an 'addedBy' field to the ticket
//      DONE Only show 'delete' icons next to items added by the user.
//      DONE 'delete' icons have cursor pointer
//      DONE install bootstrap-sass
//      DONE Add API to delete estimates
//      DONE Add API to delete the ticket
//      DONE Add Endpoint to delete item
//      DONE Return ticketId with the group estimates.
//      DONE Link icon to endpoint: deleteTicket()
//      DONE create a template to prompt if they are sure they want to delete.
//      DONE link the template to the delete icon
//      DONE link the Ok button to trigger the delete
// DONE Add a person's name to the title of their profile pic
// TODO The creator can accept an estimate, which locks it to further modification.
//      DONE add frozen to the schema
//      TODO add API to freeze a ticket from further estimates
//      TODO modify the existing setEstimate method so that it has no effect if a ticket is frozen
//      TODO add the lock/unlock icon

// TODO A user cannot update their estimate if > 7 days since the first estimate from that user.
// TODO A team admin can upload the estimate
// TODO When an group estimate is unlocked, show the individual contributions.
// TODO Create a docker image of it





/*
 estimate schema:   `id`, `userId`, `ticketId`, `estimate`

 */
let dao = {};
extend(dao,
    require("./dao/estimate-dao"),
    require("./dao/team-dao"),
    require("./dao/user-dao"),
    require("./dao/ticket-dao")
);

function userId(req) {
    return req.session.user.userId;
}

// The currently selected team of the logged in user.
function teamId(req) {
    return req.session.user.teamChoice;
}

function sendAllEstimates(req, res) {

    return dao.loadEstimates(req.c, settings.daysBack, userId(req), teamId(req)).then(
        (groupEstimates) => {
            // Decorate with user estimates.

            return dao.loadUserEstimateMap(req.c, userId(req), teamId(req)).
                then((ticketToEstimateMap) => {

                    for (let ge of groupEstimates) {
                        if (ticketToEstimateMap.has(ge.name)) {
                            ge.userEstimate = ticketToEstimateMap.get(ge.name)
                        }
                    }

                    res.send(groupEstimates)
                })

        })
}


router.post("/api/loadTeams", function(req, res) {
    req.isAPI = true;   // TODO Create API that does not require login.
    dao.loadTeams(req.c).then( (teams) => res.send({teams}) )
})



router.use(require("./middleware/checkIsLoggedIn"));        // REST Endpoints past here require login

router.get('/', (req, res) => {

   res.render('index')
});


router.use(require("./middleware/setIsAPIFlag"));


/*
    REST endpoints for tickets
 */
router.post("/api/addTicket", function(req, res) {

    dao.
        addTicket(req.c, req.body.ticketName, userId(req), teamId(req)).
        then(() => {
            sendAllEstimates(req, res)
        })
});

/**
 * Delete a ticket and any associated estimates.
 * The ticket and estimates will only be deleted if the user created the ticket.
 *
 * POST: {ticketId : 123}
 */
router.post("/api/deleteTicket", function(req, res) {
    var ticketId = req.body.ticketId
    console.log("Deleting ticket ", ticketId, " for ", userId(req), " and team ", teamId(req));
    return dao.deleteEstimates(req.c, ticketId, userId(req)).
        then(() => {
            l("here");
            return dao.deleteTicket(req.c, ticketId, userId(req), teamId(req))
        }).
        then(() => {
            res.send({deleted : true})
        })
})

/**
 * Freezes a ticket so that no further estimates can be made against it while its frozen.
 * A user can only freeze a ticket if they were the creator.
 *
 * POST: {ticketId : 123, freeze : bool}
 */
router.post("/api/setFrozen", function(req, res) {
    var ticketId = req.body.ticketId
    var freeze = req.body.freeze
    return dao.setFrozen(req.c, ticketId, userId(req), freeze).
        then(() => { res.send({}) })
})

/*
    REST endpoints for estimates
 */

router.post("/api/loadEstimates", function(req, res) {
    sendAllEstimates(req, res);
});

router.post("/api/setEstimate", function(req, res) {
    // See if there is an existing estimate for the user.
    // If so, then update their estimate, otherwise, insert the estimate.

    let name     = req.body.ticketName;
    let estimate = req.body.estimate;

    dao.
        setEstimate(req.c, name, userId(req), teamId(req), estimate).
        then(() => sendAllEstimates(req, res) )

})



/*
    REST endpoints for team preferences
 */

router.post("/api/loadTeamPreference", function(req, res) {
    dao.
        loadTeamPreference(req.c, userId(req)).
        then((row) => {
            res.send({teamId : row.teamId, teamName : row.teamName})
        })
})

router.post("/api/changeTeamPreference", function(req, res) {
    dao.
        changeTeamPreference(req.c, userId(req), req.body.teamId).
        then(() => {
            return dao.loadUserByUserId(req.c, req.session.user.userId)
        }).then((user) => {
            req.session.user = user
            res.send({changedTeamTo: user.teamChoice})
        })
})


module.exports = router