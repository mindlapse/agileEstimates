define([
    'ctrl/LoginCtrl',
    'ctrl/EstimateCtrl',
    'svc/LoginService',
    'svc/TeamService',
    'directives/EstimateInfoDirective',
    'angular',
    'facebook'
], function(loginCtrl,
            estimateCtrl,
            loginService,
            teamService,
            estimateInfoDirective,
            angular) {

    var module = angular.module("RootModule", ['ui.bootstrap'])
        .config(["$httpProvider", function($httpProvider) {
            $httpProvider.interceptors.push(["$q", function($q) {
                return {
                    'response' : function(response) {
                        console.log("Response intercepted");
                        if (response && response.data && response.data.needsLogin) {
                            window.location = "/login";     // TODO use routing instead.
                        }
                        return response;
                    }
                }
            }])
        }]).

        controller("GroundCtrl", ["$http", "TeamService", function($http, teamSvc) {

            var me = this;
            me.teamSvc = teamSvc;

            console.log("In GroundCtrl")
        }]);




    // Services
    loginService(module)
    teamService(module)

    // Controllers
    loginCtrl(module)
    estimateCtrl(module)

    // Directives
    estimateInfoDirective(module)

})