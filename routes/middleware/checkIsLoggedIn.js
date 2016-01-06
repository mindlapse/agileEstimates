/**
 * Middleware
 *
 * Validates that the logged in user has the admin role.
 *  - the user object is attached to the session
 *  - they have the 'admin' role.
 */
module.exports = function(req, res, next) {

    if (req.session.user ||
        req.path.startsWith("/js/") ||
        req.path.startsWith("/stylesheets/")) {
        next();
    } else {
        req.redirectToLogin = true;
        next("checkIsLoggedIn:  Not authorized.  User is not logged in. ");
    }
}