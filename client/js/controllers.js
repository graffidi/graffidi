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

  // slider controller
  $scope.position = {
    name: 'Timeline',
    start_time: 0,
    end_time: 40
  };
  $scope.form.start_time = 20;
  $scope.form.end_time = 45;
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
.controller('ShareCtrl',
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
  if(path.match(/share?/gi)) {
    var videoURL = path.split('e?')[1];
    if(videoURL.match(/v=/))
    {
      var video_id = videoURL.split('v=')[1];
      // remove everything after & for video_url
      var ampLoc = videoURL.indexOf('&');
      if (ampLoc != -1) {
        videoURL = videoURL.substring(0, ampLoc);
      }
      $scope.form.video_url = videoURL;



      var ampersandPosition = video_id.indexOf('&');
        if(ampersandPosition != -1) {
          video_id = video_id.substring(0, ampersandPosition);
        }
        // set video_id on scope
        $scope.form.video_id = video_id;
      }
  }
  // get the document title from the youtube video
  // remove everything after & before sending to form
  if(path.match(/&title=/gi)) {
    var title = path.split('&title=')[1];
    title = title.replace(/\%20/g, ' ');
    // remove everything after & for video_url
    var ampLoc1 = title.indexOf('&');
    if (ampLoc1 != -1) {
      title = title.substring(0, ampLoc1);
    }
    $scope.form.title = title;
  }

  // get the author from the youtube video
  // remove everything after & before sending to form
  if(path.match(/&author=/gi)) {
    var author = path.split('&author=')[1];
    var ampLoc2 = author.indexOf('&');
    if (ampLoc2 != -1) {
      author = author.substring(0, ampLoc2);
    }
    $scope.form.posted_by = author;
  }

  // get the start_time from the youtube video
  // remove everything after & before sending to form
  if(path.match(/&start=/gi)) {
    var start = path.split('&start=')[1];
    var ampLoc3 = start.indexOf('&');
    if (ampLoc3 != -1) {
      start = start.substring(0, ampLoc3);
    }
    $scope.form.start_time = start;
  }

  // get the duration/end_time from the youtube video
  // remove everything after & before sending to form
  if(path.match(/&duration=/gi)) {
    var duration = path.split('&duration=')[1];
    // author = author.replace(/\%20/g, ' ');
    $scope.form.end_time = duration;
    // set form.duration
    $scope.form.duration = duration;
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
    console.log(title);
    // set title on scope
    $scope.form.title = title;
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

