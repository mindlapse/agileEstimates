/**
 * Middleware
 *
 * Validates that the logged in user has the admin role.
 *  - the user object is attached to the session
 *  - they have the 'admin' role.
 */
module.exports = function(req, res, next) {

    var user = req.session.user;

    if (!user) {
        throw "checkIsAdmin must occur after checkIsLoggedIn";
    }
    if (user.role == 'admin') {
        next();
    } else {
        next("checkIsAdmin: Not authorized.  User " + user.userId + " is not an admin.");
    }
}