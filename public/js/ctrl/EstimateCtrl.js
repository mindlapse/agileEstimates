define(["jquery", "underscore"], function($, _) {



    return function(module) {

        module.controller("EstimateCtrl", ["$http", "$scope", "LoginService", "TeamService",
            function($http, $scope, loginService, teamService) {

            var me = this;

            // Add tickets
            me.success = "";
            me.ticketName = "";
            me.rows = [];
            me.rowToDelete = "";


            teamService.onTeamChanged(function() {
                $http.post("/api/loadEstimates",{}).then(handleEstimates);
            })

            teamService.loadTeamChoice();     // Updates the dropdown.

            function handleEstimates(response) {
                var rows = response.data;
                console.log(rows);
                me.rows = [];
                for (var i = 0; i < rows.length; i++) {
                    me.rows.push(rows[i]);
                }
            }

            function starburst(index) {
                var target = $("<div>").css("position", "absolute")

                $("body").append(target);
                target.offset($(".starTarget" + index).offset())
                target.append($("<div>").addClass("starburst"))


                setTimeout(function () { target.remove(); }, 1000);
            }

            me.addTicket = function($event) {
                if (!$event || $event.keyCode == 13) {
                    // Save the ticket and new list of tickets
                    $http.
                        post("/api/addTicket", {ticketName: me.ticketName}).
                        then(handleEstimates);
                    me.ticketName = "";
                }
            };

            me.setRowToDelete = function(row) {
                me.rowToDelete = row
            }

            me.toggleFrozen = function(row) {
                $http.post("/api/setFrozen", {ticketId : row.id, freeze : !row.frozen}).
                    then(() => {
                        row.frozen = !row.frozen;
                    })
            }

            me.deleteTicket = function() {
                $http
                    .post("/api/deleteTicket", {ticketId : me.rowToDelete.id}).then(() => {
                        me.rows = _.reject(me.rows, function(row) {
                            return row.id == me.rowToDelete.id
                        });
                    });
            }

            me.addEstimate = function(row, $index, $event) {
                if (!$event || $event.keyCode == 13) {
                    console.log(row);
                    starburst($index);
                    $http.post("/api/setEstimate", {
                        ticketName : row.name,
                        estimate : row.userEstimate
                    }).then(handleEstimates);
                }
            }

        }]);


    }
});