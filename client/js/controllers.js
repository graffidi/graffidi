'use strict';

/* Controllers */

angular.module('graffi')
  .controller('NavCtrl', ['$scope', '$location', 'Auth', function($scope, $location, Auth) {
  $scope.user = Auth.user;
  $scope.userRoles = Auth.userRoles;
  $scope.accessLevels = Auth.accessLevels;

  $scope.logout = function() {
    Auth.logout(function() {
      $location.path('/login');
    }, function() {
      $rootScope.error = "Failed to logout";
    });
  };
}]);
angular.module('graffi')
.controller('LoginCtrl',
['$rootScope', '$scope', '$location', '$window', 'Auth', function($rootScope, $scope, $location, $window, Auth) {

  $scope.rememberme = true;
  $scope.login = function() {
    Auth.login({
      username: $scope.username,
      password: $scope.password,
      rememberme: $scope.rememberme
    },
    function(res) {
      $location.path('/');
    },
    function(err) {
      $rootScope.error = "Failed to login";
    });
  };

  $scope.loginOauth = function(provider) {
    $window.location.href = '/auth/' + provider;
  };
}]);

angular.module('graffi')
.controller('HomeCtrl',
['$rootScope', function($rootScope) {
}]);

angular.module('graffi')
.controller('RegisterCtrl',
['$rootScope', '$scope', '$location', 'Auth', function($rootScope, $scope, $location, Auth) {
  $scope.role = Auth.userRoles.user;
  $scope.userRoles = Auth.userRoles;

  $scope.register = function() {
    Auth.register({
      username: $scope.username,
      password: $scope.password,
      role: $scope.role
    },
    function() {
      $location.path('/');
    },
    function(err) {
      $rootScope.error = err;
    });
  };
}]);

angular.module('graffi')
.controller('PrivateCtrl',
['$rootScope', function($rootScope) {
}]);


angular.module('graffi')
.controller('AdminCtrl',
['$rootScope', '$scope', 'Users', 'Auth', function($rootScope, $scope, Users, Auth) {
  $scope.loading = true;
  $scope.userRoles = Auth.userRoles;

  Users.getAll(function(res) {
    $scope.users = res;
    $scope.loading = false;
  }, function(err) {
    $rootScope.error = "Failed to fetch users.";
    $scope.loading = false;
  });
}]);

