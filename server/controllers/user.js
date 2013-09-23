// require underscore, the User model and the userRoles
var      _ = require('underscore'),
      User = require('../models/User.js'),
 // controlled from the client side
 userRoles = require('../../client/js/routingConfig').userRoles;

// contains the module to load the index of the web app that collects a list of users
module.exports = {
  index: function(req, res) {
    // creates an array of all the users in the User model database
    // User.findAll() is a sequelize call to the database to find all users
    var users = User.findAll();
    // for each of the users delete the password and OpenID info
    _.each(users, function(user) {
      delete user.password;
      delete user.twitter;
      delete user.facebook;
      delete user.google;
      delete user.linkedin;
    });
    // send a response to the server with the list of the users
    res.json(users);
  }
};