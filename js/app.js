var app = angular.module('FanPageReader', ['facebook']); // inject facebook module

app.config(['FacebookProvider',
    function(FacebookProvider) {
        FacebookProvider.init('320156364807880');
    }
])

app.controller('readerCtrl', ['$scope', 'Facebook',
    function($scope, Facebook) {
        // Here, usually you should watch for when Facebook is ready and loaded
        $scope.$watch(function() {
            return Facebook.isReady(); // This is for convenience, to notify if Facebook is loaded and ready to go.
        }, function(newVal) {
            $scope.facebookReady = true; // You might want to use this to disable/show/hide buttons and else
            Facebook.getLoginStatus(function(response) {
                if (response.status === 'connected') {
                    var uid = response.authResponse.userID;
                    var accessToken = response.authResponse.accessToken;
                } else if (response.status === 'not_authorized') {
                    $scope.login();
                } else {
                    $scope.login();
                }
            });
        });
        $scope.posts = [];
        // From now on you can use the Facebook service just as Facebook api says
        // Take into account that you will need $scope.$apply when inside a Facebook function's scope and not angular
        $scope.login = function() {
            Facebook.login(function(response) {
                // Do something with response. Don't forget here you are on Facebook scope so use $scope.$apply
            });
        };
        $scope.load = function(addr) {
            if (!addr) {
                addr = '/NTUHATE/feed?limit=30';
                $scope.posts = [];
                console.log("init posts");
            }
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
                        $scope.load(response.paging.next);
                    } else {
                        console.log($scope.posts);
                    }
                }
            });
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

        $scope.me = function() {
            Facebook.api('/me', function(response) {
                $scope.$apply(function() {
                    // Here you could re-check for user status (just in case)
                    $scope.user = response;
                });
            });
        };
    }
]);