// require passport and th User connect modules
var passport =  require('passport'),
        User = require('../models/User.js');

// register module tries to validate the User connection model
module.exports = {
  register: function(req, res, next) {
    try {
      User.validate(req.body);
    }
    catch(err) {
      return res.send(400, err.message);
    }

    // addUser to the User connection model using the request body
    User.addUser(req.body.username, req.body.password, req.body.role, req.body.email, req.body.first_name, req.body.last_name, function(err, user) {
      if(err === 'UserAlreadyExists') {
        return res.send(403, "User already exists");
      }
      else if(err) {
        return res.send(500);
      }

      // request.login function results with the username and the role
      req.logIn(user, function(err) {
        if(err) {
          next(err);
        }
        else {
          res.json(200, { "role": user.role, "username": user.username, "first_name": user.first_name, "last_name": user.last_name });
        }
      });
    });
  },

  // login module authenticates the user into the system and stores a cookie
  login: function(req, res, next) {
    // run passport authenticate and check for the user
    passport.authenticate('local', function(err, user) {
      // if there is a error end, if the user is not in the system return 400
      if(err) {
        return next(err);
      }
      if(!user) {
        return res.send(400);
      }
      // request.login function results in error or cookie and json response
      req.logIn(user, function(err) {
        if(err) {
          return next(err);
        }
        if(req.body.rememberme) {
          req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 7;
        }
        res.json(200, { "role": user.role, "username": user.username, "id": user.id, "first_name": user.first_name, "last_name": last_name });
      });
    })(req, res, next);
  },

  // logs the user out of the system
  logout: function(req, res) {
    req.logout();
    res.send(200);
  }
};