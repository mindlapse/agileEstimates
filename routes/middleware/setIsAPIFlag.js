/**
 * This middleware piece precedes the 'checkIsLoggedIn' middleware.  By flagging
 * the endpoints that are APIs, we avoid redirecting them to the login page, and instead
 * send back a simple response of {needsLogin:true}.  This response should be
 * intercepted and used to trigger a page change to the login screen.
 *
 */
module.exports = function(req, res, next) {
    if (req.path.startsWith("/api/")) {
        req.isAPI = true;
    }
    next();
}

