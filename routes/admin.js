var express = require('express');
var router = express.Router();
var db = require("./dao/db.js");
var l = require("./util/log");
var nodemailer = require("nodemailer");
var path = require('path');
var jade = require("jade");

var dao = {};
require("extend")(dao,
    {
        /*
        loadPatients : (c, cb) => {
            c.query("select userId, name, email, fbId, fbLink from user where role is null", [], db.wrap(rs => cb(rs) ));
        },
        */
    }
);

/**
 * This
 *
 */
router.use(require("./middleware/setIsAPIFlag"));
router.use(require("./middleware/checkIsLoggedIn"));
router.use(require("./middleware/checkIsAdmin"));


router.post("/api/getCaregivers", (req, res) => {
    dao.loadCaregivers(req.c, rs => {
        res.send(rs);
    })
})

router.post("/api/getPatients", (req, res) => {
    dao.loadPatients(req.c, rs => {
        res.send(rs);
    })
})

router.post("/api/loadUser", (req, res) => {
    var userId = req.body.userId;
    dao.loadUser(req.c, userId, rs => { res.send(rs) });
})

router.post("/api/addCaregiver", (req, res) => {
    var b = {
        name : req.body.name,
        email : req.body.email,
        phoneNumber : req.body.phoneNumber,
        adminName : "Dave MacDonald"                // TODO
    };

    // TODO include the admin name in the registration entry.
    // TODO Add a new reigstration entry.

    dao.addRegistration(req.c, b.name, b.email, b.phoneNumber, (registrationLink) => {

        b.registrationLink = registrationLink;

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { xoauth2 :generator }
        });

        var registrationEmail = jade.renderFile(path.join(__dirname, '../views/web/email/registrationEmail.jade'), b);
        console.log("Sending registration email: %s", registrationEmail);

        transporter.sendMail({
            from : {
                name: 'Caregiver Sense',
                address: 'caregiversense@gmail.com'
            },
            to : b.email,
            priority : 'high',
            html : registrationEmail,
            subject : 'Welcome'
        }, function(error, response) {
            if (error) {
                console.log(error);
            } else {
                console.log('Message sent');
                console.dir(response);
                // TODO remember to mark the wasEmailed flag!
            }
        });
        res.send({ok:true});

    });
});

router.post("/api/assignCaregiverToPatient", function(req, res) {
    var caregiverId = req.body.caregiverId;
    var patientId = req.body.patientId;

    dao.assignPatientToCaregiver(req.c, caregiverId, patientId).then(() => {
        res.end();
    }).catch((err) => {
        res.end();
    });
})


function unassign(req, res, next) {
    var caregiverId = req.body.caregiverId;
    var patientId = req.body.patientId;
    var caregivers, patients;

    dao.unassignCaregiverFromPatient(req.c, caregiverId, patientId).then(() => {
        return dao.loadPatientsForCaregiver(req.c, caregiverId);
    }).then((rs) => {
        patients = rs;
        return dao.loadCaregiversForPatient(req.c, patientId);
    }).then((rs) => {
        caregivers = rs;
        res.send({patients, caregivers});
    }).catch((err) => {
        l("Error: " + l(err));
        res.send({patients : [], caregivers : []});
    });
}

/**
 * Unassign a caregiver from a patient and return the remaining caregivers.
 */
router.post("/api/unassignCaregiverFromPatient", unassign);

/**
 * Unassign a patient from a caregiver and return the remaining patients.
 */
router.post("/api/unassignPatientFromCaregiver", unassign);


router.post("/api/loadCaregiversForPatient", function(req, res) {
    l("/api/loadCaregiversForPatient");
    dao.loadCaregiversForPatient(req.c, req.body.patientId).then((rs) => {
        res.send({caregivers : rs});
    }).catch((err) => {     // TODO all endpoints using a promise should have a catch that ends the request.
        console.dir(err);
        res.end();
    });
})


router.post("/api/loadPatientsForCaregiver", function(req, res) {
    l("/api/loadPatientsForCaregiver");
    dao.loadPatientsForCaregiver(req.c, req.body.caregiverId).then((rs) => {
        res.send({patients : rs});
    }).catch((err) => {
        console.dir(err);
        res.end();
    });
})

module.exports = router;
