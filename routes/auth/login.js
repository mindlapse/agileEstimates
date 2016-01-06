var Q = require("q");
var request = require("request");
var l = require("../util/log");
var d = console.dir;

var dao = {};
require("extend")(dao,
    require("../dao/user-dao")
)

var api = {

    /*
        Logs in a user to facebook, given an access token.
        Returns a promise of a verified user object, or the promise is rejected.

        Example of what is promised:
        {
            "id":"3153162601397",       // The facebook id
            "first_name":"Keanu",
            "gender":"male",
            "last_name":"Reeves",
            "link":"https://www.facebook.com/app_scoped_user_id/3153162601397/",
            "locale":"en_US",
            "name":"Keanu Reeves",
            "timezone":-5,
            "updated_time":"2015-11-17T17:23:11+0000",
            "verified":true
        }
    */
    verifyAccessToken : function(accessToken) {

        // TODO Is an https Agent pool needed here, since this will default to using the global agent which may be a bottleneck.

        var q = Q.defer();
        request.get({
            url: "https://graph.facebook.com/me",
            qs: {
                "access_token": accessToken
            }
        }, function (err, httpResponse, body) {
            var parsedBody = null;
            if (body) {
                parsedBody = JSON.parse(body);
            }
            if (err || httpResponse.statusCode != 200 || parsedBody == null || !parsedBody.id) {
                l("Error:  " + l(err));
                l("Status: " + l(httpResponse.statusCode));
                l("Body:   " + l(parsedBody));

                l("Call to https://graph.facebook.com/me failed");
                q.reject({err, body});
                // TODO e-mail sysadmin about failure
            } else {
                console.log("Facebook response %s", body);
                //q.reject({err, body});
                q.resolve(parsedBody);
            }
        });
        return q.promise;
    },

    /**
     * A promise for a status object with the following
     *  {
     *      accessTokenVerified : true/false,
     *      userIsRegistered : true/false
     *  }
     *  Also, if both are true, then session.user will be set to the logged in user.
     *
     * @param c         A database connection
     * @param session   The session object (normally bound to the request as req.session)
     * @param auth      An object containing an accessToken to validate with facebook.
     * @returns         A promise for the status object above.
     */
    login : function(c, session, auth) {
        l("auth/login.js on " + l(auth));
        var status = {
            accessTokenVerified : false
        };
        return api.verifyAccessToken(auth.accessToken).

            then(
                (fbUser) => {
                    status.accessTokenVerified = true;
                    l("Access token verified for fbUser.id: " + fbUser.id);

                    return dao.loadUserByFbId(c, fbUser.id).then((user) => {
                            l("Loaded user: " + l(user));
                            session.user = user;
                            return user;
                        },
                        () => {
                            l("Registering user: " + l(fbUser));
                            return dao.addUserByFbId(c, fbUser.id, fbUser.name).then(() => {
                                return dao.loadUserByFbId(c, fbUser.id);
                            });
                        }
                    )
                }
            ).then(() => {
                l("login.js # login(): Returning " + l(status));
                return status;
            }).catch(
                (e) => {
                    l("login.js # login() error: " + l(e));
                    return status;
                }
            );

    }
};

module.exports = api;