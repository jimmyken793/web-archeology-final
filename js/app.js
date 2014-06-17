var app = angular.module('FanPageReader', ['facebook', 'ngStorage', 'ngSanitize', 'angularSpinner']); // inject facebook module

app.config(['FacebookProvider',
    function(FacebookProvider) {
        FacebookProvider.init('320156364807880');
    }
])

app.filter("nl2br", function($filter) {
    return function(data) {
        if (!data) return data;
        return data.replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/\n\r?/g, '<br />');
    };
});

app.controller('readerCtrl', ['$scope', 'Facebook', '$localStorage', '$sanitize',
    function($scope, Facebook, $localStorage, $sanitize) {
        $scope.facebookReady = false;
        $scope.$watch(function() {
            return Facebook.isReady();
        }, function(newVal) {
            $scope.getLoginStatus();
        });
        $scope.$storage = $localStorage.$default({
            boards: []
        });
        if ($scope.$storage.boards.length == 0) {
            $scope.boardType = "other";
            $scope.fanpageURL = "ntuhate";
        } else {
            $scope.boardType = "select";
            $scope.fanpageURL = "";
        }
        $scope.posts = [];
        $scope.login = function() {
            Facebook.login(function(response) {
                $scope.getLoginStatus();
            });
        };
        $scope.loadPage = function(addr) {
            FB.api(addr, function(response) {
                if (!response || response.error) {
                    if (!response) {
                        console.log('Error occured');
                    } else {
                        console.log('Error occured', response.error);

                    }
                } else {
                    console.log(response);
                    if (response.data.length > 0) {
                        $scope.$apply(function() {
                            $scope.posts = $scope.posts.concat(response.data);
                        });
                        $scope.loadPage(response.paging.next);
                    } else {
                        $scope.loaded();
                    }
                }
            });
        };

        $scope.load = function() {
            var addr;
            if ($scope.boardType == "select") {
                if (!$scope.boardSelectId) {
                    return;
                }
                addr = $scope.boardSelectId.name + '/feed?limit=250';
            } else {
                if ($scope.fanpageURL.length == 0) {
                    return;
                }
                addr = $scope.fanpageURL + '/feed?limit=50';
                if ($scope.$storage.boards.filter(function(board) {
                    return board.name === $scope.fanpageURL.toLowerCase()
                }).length == 0) {
                    $scope.$storage.boards.push({
                        name: $scope.fanpageURL.toLowerCase()
                    });
                }
            }
            console.log("init posts");
            $scope.posts = [];
            $scope.query = "";
            $scope.loading = true;
            $scope.loadPage(addr);
        }
        $scope.loaded = function() {
            $scope.loading = false;
        }
        $scope.getLoginStatus = function() {
            Facebook.getLoginStatus(function(response) {
                if (response.status == 'connected') {
                    $scope.$apply(function() {
                        $scope.loggedIn = true;
                    });
                } else {
                    $scope.$apply(function() {
                        $scope.loggedIn = false;
                    });
                }
                $scope.facebookReady = true;
            });
        };
    }
]);
Ladda.bind('button');