
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')
var l = require("./routes/util/log");

var db = require("./routes/dao/db");

var index = require('./routes/index');
var login = require('./routes/login');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

function releaseConnection(req) {
    if (req.c) {
        req.c.release();
        req.c = null;
        l("Connection released");
    }
}

/*

 Configure the session

 The session will contain these values:
    userId      - set when a registered user logs in.
    patientId   - set when the user has a patient selected, or when they select a new one.

 */
app.use(session({
    // genid                // Use the uid2 library to generate session IDs.
    name : 'memtag.sid',    // The name of the session ID cookie.
    proxy : true,           // Trust the reverse proxy based on the 'X-Forwarded-Proto' header.
    resave : false,         // TODO verify that the session store implements a touch method.
    rolling : true,         // Set a cookie on each response, causing the expiration date to reset.
    saveUninitialized : false, // A new session will not be saved unless it is modified.
    secret : '8twCW4cdiITjRnifLDBC0jXVFstfez5RiIOyCmoF7RNAWoY0tn',  // Used to sign cookies.
    // store :              // Defaults to a new MemoryStore.  TODO change this to be a redis store or perhaps use Sequelize.js when clustering.
    unset : 'keep',         // Setting req.session to null or using delete on it will result in the session being kept
                            // open, but the changes made during the request are discarded.
    cookie : {
        httpOnly : true,    // The session cookie is not accessible by script.
        secure : 'auto',    // The cookie will be secure if accessed over HTTPS, and not secure if accessed over HTTP.
        maxAge : 2592000000,// The cookie expires after 30 days.
        path : '/'
    }
}));
if (app.get('env') === 'production') {
    app.set('trust proxy', 1); // trust first proxy
}

// The first middleware chain link establishes a database connection.
app.use(function(req, res, next) {
    db.getPool().getConnection(function(err, c) {
        if (!err) {
            l("Connection obtained");
            req.c = c;
            res.on("finish", function() {
                releaseConnection(req);
            });
            next();
        } else {
            next(err);
        }
    });
});
app.use(function(req, res, next) {
    l("DATE: " + new Date());
    next();
});



app.use('/login', login);
app.use('/', index);


// catch 404 and forward to error handler
app.use(function(req, res, next) {


    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// Handler to release the database connection
app.use(function(err, req, res, next) {
    releaseConnection(req);
    next(err);
});


app.use(function(err, req, res, next) {
    l("Error is " + l(err));

    var stack = (app.get('env') === 'development') ? err : {};

    if (req.redirectToLogin) {
        if (req.isAPI) {
            res.status(200).send({needsLogin : true});
        } else {
            console.log("app.js: Redirecting user to 'web/login.jade'")
            res.status(200).render('login', {
                message: err.message,
                error: stack
            });
        }
    } else {
        console.log("app.js: Redirecting user to 'error.jade'")
        res.status(err.status || 500).render('error', {
            message: err.message,
            error: stack
        });
    }

});


module.exports = app;
