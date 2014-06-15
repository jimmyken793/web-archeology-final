var app = angular.module('FanPageReader', ['facebook', 'ngStorage', 'ngSanitize']); // inject facebook module

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
        // Here, usually you should watch for when Facebook is ready and loaded
        $scope.$watch(function() {
            return Facebook.isReady(); // This is for convenience, to notify if Facebook is loaded and ready to go.
        }, function(newVal) {
            $scope.facebookReady = true; // You might want to use this to disable/show/hide buttons and else
            $scope.getLoginStatus();
        });
        $scope.$storage = $localStorage.$default({
            boards: []
        });
        $scope.boardType = "other";
        $scope.posts = [];
        $scope.fanpageURL = "ntuhate";
        // From now on you can use the Facebook service just as Facebook api says
        // Take into account that you will need $scope.$apply when inside a Facebook function's scope and not angular
        $scope.login = function() {
            Facebook.login(function(response) {
                // Do something with response. Don't forget here you are on Facebook scope so use $scope.$apply
            });
        };
        $scope.escapeStr = function(str) {
            return str.replace(/\n/g, '<br>');
        }
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
                addr = $scope.boardSelectId.name + '/feed?limit=250';
            } else {
                addr = $scope.fanpageURL + '/feed?limit=250';
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
            $scope.loadPage(addr);
        }
        $scope.loaded = function() {

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
            });
        };
    }
]);