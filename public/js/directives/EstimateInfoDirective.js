define([], function() {

    return function(module) {
        module.directive("estimateInfo", function () {

            function getPhotoURL(fbId) {
                if (fbId) {
                    return "//graph.facebook.com/" + fbId + "/picture?type=small";
                }
                return "";
            }

            return {
                restrict: 'E',
                templateUrl: 'estimateInfoTemplate.html',
                scope: {
                    user: '='
                },
                controllerAs: 'estInfo',
                controller: ["$scope", function ($scope) {
                    var u = $scope.user;
                    this.id = u.$$hashKey;
                    this.photoURL = getPhotoURL(u.fbId);
                    this.userName = u.userName;
                    this.estimate = u.estimate;
                }],
                link: function (scope, element) {

                    /*
                    '<table><tr><td><img src="'+ scope.estInfo.photoURL+'" /></td><td>' +
                    '<h4 style="white-space:nowrap;">' + u.userName + '</h4></td></tr></table>' +
                    '<h5 style="white-space:nowrap;">Voted &nbsp;<span class="pointVote">' + u.estimate + '</span>&nbsp; points</h5>'
                    */
                    var u = scope.user;
                    var contents = '<h4 style="white-space:nowrap;">' + u.userName + '</h4>';
                    if (typeof(u.estimate) !== 'undefined') {
                        contents += '<h5 style="white-space:nowrap;">Voted &nbsp;<span class="pointVote">' + u.estimate + '</span>&nbsp; points</h5>'
                    }

                    $(element).tooltip({
                        placement: 'bottom',
                        delay: 300,
                        html: true,
                        title: contents
                    });
                }

            }
        })
    }
})

