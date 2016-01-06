var router = require('express').Router();
var login = require("./auth/login");
var l = require("./util/log");


// Logs in and returns the user's role.
router.post("/", function(req, res, next) {
    l("/login API endpoint called");
    login.login(req.c, req.session, req.body).then((status) => {

        var user = req.session.user;
        if (user) {
            status.role = user.role;
        }
        l("Sending " + l(status));
        res.send(status);
    });


});

module.exports = router;