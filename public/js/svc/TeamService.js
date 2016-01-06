define([""], function() {

    return function(module) {

        module.factory('TeamService', ["$http", "$q", function ($http, $q) {

            var self = this;
            self.teams = [];
            self.isTeamSelected = false;
            self.selectedTeamName = "";
            self.teamChangeListener = null;

            $http.post("/api/loadTeams", {}).then((response) => {
                var teams = response.data.teams;
                for (var i = 0; i < teams.length; i++) {
                    self.teams.push(teams[i]);
                }
            });

            var api = {
                isTeamSelected: function() {
                    return self.isTeamSelected;
                },

                getSelectedTeamName: function() {
                    return self.selectedTeamName;
                },

                loadTeamChoice : function() {
                    return $http.post("/api/loadTeamPreference").
                        then(function(response) {
                            self.selectedTeamName = response.data.teamName;
                            self.isTeamSelected = true;

                            // Notify the listener that the team has changed.
                            console.log("Team changed to " + self.selectedTeamName);
                            if (self.teamChangeListener) {
                                console.log("Calling listener")
                                self.teamChangeListener()
                            }
                        })
                },

                // Set a listener
                onTeamChanged : function(callback) {
                    self.teamChangeListener = callback;
                },

                // Sets the team choice and returns a promise for all
                // of the estimates for that team.
                setTeamChoice : function(teamId) {
                    return $http.post("/api/changeTeamPreference", {teamId:teamId}).
                    then(function() {
                        api.loadTeamChoice();
                    });
                },

                getTeams : function() {
                    return self.teams;
                }
            }
            return api;
        }])
    }
})