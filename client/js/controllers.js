'use strict';

/* Controllers */

angular.module('graffidi')
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
angular.module('graffidi')
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

angular.module('graffidi')
.controller('HomeCtrl',
['$rootScope', '$scope', '$http', 'Marks', function($rootScope, $scope, $http, Marks) {
  $scope.loading = true;
  Marks.getAll(function(res) {
    $scope.marks = res;
    console.log(res);
    $scope.loading = false;
  }, function(err) {
    $rootScope.error = "Failed to fetch marks.";
    $scope.loading = false;
  });
}]);

angular.module('graffidi')
.controller('RegisterCtrl',
['$rootScope', '$scope', '$location', 'Auth', function($rootScope, $scope, $location, Auth) {
  $scope.role = Auth.userRoles.user;
  $scope.userRoles = Auth.userRoles;

  $scope.register = function() {
    Auth.register({
      first_name: $scope.first_name,
      last_name: $scope.last_name,
      username: $scope.username,
      email: $scope.email,
      password: $scope.password,
      role: $scope.role
    },
    function() {
      $location.path('/');
    },
    function(err) {
      $rootScope.error = err; // sends the error up a level to the rootScope
    });
  };
}]);

angular.module('graffidi')
.controller('AddCtrl',
['$rootScope', '$scope', '$location', 'Marks', function($rootScope, $scope, $location, Marks) {
  // accesses the form
  $scope.form = {};

  // get the url and check if it was taken from YouTube
  var path = $location.url();
  path = path.replace("%2F%2F", '//');
  path = path.replace("%2F", '/');
  path = path.replace("%3F", '?');
  path = path.replace("%3D", '=');
  // if there is a youtube link attached to the url run script to add it to the form
  if(path.match(/addmark?/gi)) {
    console.log("if passed");
    $scope.form.video_url = path.split('k?')[1];
    var video_id = $scope.form.video_url.split('v=')[1];
    var ampersandPosition = video_id.indexOf('&');
    if(ampersandPosition != -1) {
      video_id = video_id.substring(0, ampersandPosition);
    }
    // set video_id on scope
    $scope.form.video_id = video_id;
  }
  
  //$scope.form.apikey = "AIzaSyDQYSFnnnIUTAQXQR_XvCYPeKxSVTcUYQM";
  
  // showVideo takes the url and converts it to the video_id etc.
  $scope.showVideo = function(){
    var video_id = $scope.form.video_url.split('v=')[1];
    var ampersandPosition = video_id.indexOf('&');
    if(ampersandPosition != -1) {
      video_id = video_id.substring(0, ampersandPosition);
    }
    // set video_id on scope
    $scope.form.video_id = video_id;
  },

  $scope.addMark = function() {
    Marks.addMark({
      video_id: $scope.form.video_id,
      title: $scope.form.title,
      posted_by: $scope.form.posted_by,
      start_time: $scope.form.start_time,
      end_time: $scope.form.end_time
    },
    function() {
      $location.path('/');
    },
    function(err) {
      $rootScope.error = err; // sends the error up a level to the rootScope
    });
  };
}]);

angular.module('graffidi')
.controller('PrivateCtrl',
['$rootScope', function($rootScope) {
}]);


angular.module('graffidi')
.controller('AdminCtrl',
['$rootScope', '$scope', 'Users', 'Auth', function($rootScope, $scope, Users, Auth) {
  $scope.loading = true;
  $scope.userRoles = Auth.userRoles;

  Users.getAll(function(res) {
    $scope.users = res;
    console.log('got the users');
    $scope.loading = false;
  }, function(err) {
    $rootScope.error = "Failed to fetch users.";
    $scope.loading = false;
  });
}]);

