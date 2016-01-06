define([], function() {


    return function(module) {
        module.controller("LoginCtrl", ["$http", "$location", "$scope", "LoginService", function($http, $location, $scope, loginService) {

            var me = this;
            this.showFacebookButton = false;

            function login() {
                loginService.doLogin(
                    function onNotAuthorized() {
                        console.log("LoginCtrl: Not authorized");
                        me.showFacebookButton = true;
                    },
                    function onSuccess(user) {
                        // Navigate to the user's homepage.
                        console.log("Navigating to /home");

                        // TODO route instead of hard redirect.
                        window.location = "/";
                    }
                );
            }

            login();

            this.navigateToUserHome = function() {
                login();
            }
        }]);


    }
});