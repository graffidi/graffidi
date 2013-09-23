// require underscore, path, passport, the authentication controller,
// the user controller, the User model, userRoles, and the accessLevels
var          _ = require('underscore'),
          path = require('path'),
      passport = require('passport'),
      AuthCtrl = require('./controllers/auth'),
      UserCtrl = require('./controllers/user'),
          User = require('./models/User.js'),
  // userRoles and accessLevels are controlled from the client side
     userRoles = require('../client/js/routingConfig').userRoles,
  accessLevels = require('../client/js/routingConfig').accessLevels;

// array of the routes that the server uses
var routes = [

  // Views - the viws are calling on /partials/ to load the innerHTML
  //       - it's a GET call and it runs through a middleware to join the path
  {
    path: '/partials/*',
    httpMethod: 'GET',
    middleware: [function (req, res) {
      var requestedView = path.join('./', req.url);
      res.render(requestedView);
    }]
  },

  // OAUTH - calls different paths for each of the different 3rd party menthods
  // TWITTER
  {
    path: '/auth/twitter',
    httpMethod: 'GET',
    middleware: [passport.authenticate('twitter')]
  },
  // TWITTER CALLBACK
  {
    path: '/auth/twitter/callback',
    httpMethod: 'GET',
        middleware: [passport.authenticate('twitter', {
            successRedirect: '/',
            failureRedirect: '/login'
        })]
    },
    //FACEBOOK
    {
      path: '/auth/facebook',
      httpMethod: 'GET',
      middleware: [passport.authenticate('facebook')]
    },
    //FACEBOOK CALLBACK
    {
      path: '/auth/facebook/callback',
      httpMethod: 'GET',
      middleware: [passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/login'
      })]
    },
    // GOOGLE
    {
      path: '/auth/google',
      httpMethod: 'GET',
      middleware: [passport.authenticate('google')]
    },
    // GOOGLE CALLBACK
    {
      path: '/auth/google/return',
      httpMethod: 'GET',
      middleware: [passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/login'
      })]
    },
    // LINKEDIN
    {
      path: '/auth/linkedin',
      httpMethod: 'GET',
      middleware: [passport.authenticate('linkedin')]
    },
    // LINKED IN CALLBACK
    {
      path: '/auth/linkedin/callback',
      httpMethod: 'GET',
      middleware: [passport.authenticate('linkedin', {
        successRedirect: '/',
        failureRedirect: '/login'
      })]
    },

    // Local Auth - register with an email address to the local strategy
    // REGISTER
    {
      path: '/register',
      httpMethod: 'POST',
      middleware: [AuthCtrl.register]
    },
    // LOGIN
    {
      path: '/login',
      httpMethod: 'POST',
      middleware: [AuthCtrl.login]
    },
    // LOGOUT
    {
      path: '/logout',
      httpMethod: 'POST',
      middleware: [AuthCtrl.logout]
    },

    // User resource - loads the user.js index with a list of all the users
    {
      path: '/users',
      httpMethod: 'GET',
      middleware: [UserCtrl.index],
      accessLevel: accessLevels.admin
    },

    // All other get requests should be handled by AngularJS's client-side routing system
    // placed at the end of all the calls so that it only is called if none of the prev calls are made
    {
      path: '/*',
      httpMethod: 'GET',
      middleware: [function(req, res) {
      	// role and username are established to public and blank
        var role = userRoles.public, username = '';
        // if the request has a user
        if(req.user) {
        	// set the role to the user role
          role = req.user.role;
          // set the username to the user username
          username = req.user.username;
        }
        // respond with a cookie that stores the username and the role
        res.cookie('user', JSON.stringify({
          'username': username,
          'role': role
        }));
        // response render index
        res.render('index');
      }]
    }
];  // end of the routes array

// module takes the app
module.exports = function(app) {
	// for each route in the routes array
  _.each(routes, function(route) {
  	// adds ensureAuthorized before the other middleware
    route.middleware.unshift(ensureAuthorized);
    // merge the route.path and route.middleware arrays
    var args = _.flatten([route.path, route.middleware]);
    // take the httpMethod and switch it to uppercase to prevent errors
    // app.get, app.post, app.put, app.delete can be found on the server.js file
    switch(route.httpMethod.toUpperCase()) {
      case 'GET':
      	// run the method to the app.get with the app and pass in args (route.path and route.middleware)
        app.get.apply(app, args);
        break;
      case 'POST':
        // run the method to the app.post with the app and pass in args (route.path and route.middleware)
        app.post.apply(app, args);
        break;
      case 'PUT':
        // run the method to the app.put with the app and pass in args (route.path and route.middleware)
        app.put.apply(app, args);
        break;
      case 'DELETE':
        // run the method to the app.delete with the app and pass in args (route.path and route.middleware)
        app.delete.apply(app, args);
        break;
      default:
        throw new Error('Invalid HTTP method specified for route ' + route.path);
        break;
    }
  });
}

// function ensures that the the user is authorized to use the route
// ensureAuthorized is added to all routes middleware
function ensureAuthorized(req, res, next) {
	// create role
  var role;
  // if the user doesn't exist, set role to public
  if(!req.user) {
  	role = userRoles.public;
  }
  else {
    // if the user exists set the user.role to role
  	role = req.user.role;
  }
  
  // create accessLevel and findWhere path has accessLevel or set the accessLevel to public.
  var accessLevel = _.findWhere(routes, { path: req.route.path }).accessLevel || accessLevels.public;

  // if not true then return a 403 response
  if(!(accessLevel.bitMask & role.bitMask)) {
  	return res.send(403);
  }
    // otherwise return next and enter the 
    return next();
}