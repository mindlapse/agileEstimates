define(["facebook"], function() {

    return function(module) {

        FB.init({
            appId: '1530999693888048',
            status: true,
            cookie: true,
            xfbml: true,
            version: 'v2.5'
        });

        /* May come in handy at some point
        FB.Event.subscribe('auth.authResponseChange', function (res) {
            console.log("auth.authResponseChange:");
            console.dir(res);
            if (onLoggedIn) onLoggedIn(res);
        });
        */

        module.factory('LoginService', ["$rootScope", "$http", function($rootScope, $http) {

            // isLogin
            var me = this;
            this.user = {};

            var api = {

                getUser : function() {
                    return me.user;
                },

                setUser : function(user) {
                    me.user = user;
                },

                /**
                 * Logs in a user, with three possible outcomes handled by
                 * the given
                 *
                 *
                 * @param onNotAuthorized
                 * @param onSuccess
                 */
                doLogin : function(onNotAuthorized, onSuccess) {
                    // Notify the server that the user is logged in

                    var onLoggedIn = function(auth) {
                        $http.post("/login", auth).then(function(res) {
                            if (!res.data.accessTokenVerified) {
                                onNotAuthorized();
                            } else {
                                me.user = res.data;
                                console.log(me.user);
                                onSuccess(me.user);
                            }
                        });
                    }

                    api.getLoginStatus(onLoggedIn, onNotAuthorized);
                },

                /**
                 * Retrieves the login status, and will call either 'onLoggedIn' or 'onNotAuthorized' when
                 * the login status is known.
                 *
                 * 'onLoggedIn' will be provided with an object that can be passed to the /login URL
                 * to authenticate the user with the server.
                 *
                 *
                 * @param onLoggedIn
                 * @param onNotAuthorized
                 */
                getLoginStatus : function (onLoggedIn, onNotAuthorized) {
                    FB.getLoginStatus(function (response) {
                        console.log("getLoginStatus");
                        console.dir(response);

                        if (response && response.status) {
                            setTimeout(function() {
                                $rootScope.$apply(function () {
                                    if (response.status == "connected") {
                                        console.log("Facebook authenticated.");
                                        if (onLoggedIn) {
                                            onLoggedIn(response.authResponse);
                                        }
                                    } else {
                                        console.log("User is not_authorized");
                                        console.log("response.status: " + response.status);
                                        if (onNotAuthorized) {
                                            onNotAuthorized();
                                        }
                                    }
                                });
                            });
                        }
                    });
                }
            };
            return api;
        }])

    }

})