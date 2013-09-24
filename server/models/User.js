// create the User variable
// require underscore, passport, all strategies, validator, and userRoles
var User;
var              _ = require('underscore'),
          passport = require('passport'),
     LocalStrategy = require('passport-local').Strategy,
   TwitterStrategy = require('passport-twitter').Strategy,
  FacebookStrategy = require('passport-facebook').Strategy,
    GoogleStrategy = require('passport-google').Strategy,
  LinkedInStrategy = require('passport-linkedin').Strategy,
             check = require('validator').check,
             async = require('async'),
         userRoles = require('../../client/js/routingConfig').userRoles,
         Sequelize = require('sequelize-mysql').sequelize;

var sequelize = new Sequelize('graffidi', 'root');

// User Table Sequelize schema
Users = sequelize.define('User', {
  id: Sequelize.INTEGER(11).UNSIGNED,
  first_name: Sequelize.STRING(45),
  last_name: Sequelize.STRING(45),
  email: Sequelize.STRING(255),
  username: Sequelize.STRING(45),
  password: Sequelize.STRING(45),
  role: Sequelize.STRING(45),
  provider: Sequelize.STRING(45),
  facebook: Sequelize.STRING(255),
  twitter: Sequelize.STRING(255),
  google: Sequelize.STRING(255),
  about: Sequelize.TEXT
 });

// Check that the table is there
Users.sync().success(function(){
  console.log('User success');  
});

// array that holds all the users in the system
// refactor to use data.users
var users;

// Sequelize call to get all Users in table
Users.findAll().success(function(allusers){
    console.log('Got all Users ', allusers.length);
    users = allusers;
  });

// set modelue.exports object
module.exports = {
	// addUser function - takes username, password, role, callback
  addUser: function(username, password, role, callback) {
    // If doesn't exist create new user
    Users.find({where: {username: username}}).success(function(user) {
      if (!user) {
        var user = {
          id: _.max(users, function(user) { return user.id; }).id + 1,
          username:   username,
          password:   password,
          first_name: first_name,
          last_name: last_name,
          email: email,
          role: role.title
        };
        // add the user back to the database
        Users.create(user, [ 'username', 'password', 'first_name', 'last_name', 'email', 'role' ]).success(function(user) {
          users.push(user);
          if(user) {
              if (user.role === 'admin') {
                  user.role = userRoles.admin;
              } else {
                  user.role = userRoles.user;
              }
          };
          callback(null, user);
        });
      }
    });
  },

  // use Oauth to see if the user is in the system
  findOrCreateOauthUser: function(provider, providerId) {
  	// user is set to the user returned by the find function
    var user = module.exports.findByProviderId(provider, providerId);
    // if user is undefined then create a new one
    if(!user) {
    	// user is created
      user = {
      	// TODO: use the database to do this
        id: _.max(users, function(user) { return user.id; }).id + 1,
        username: provider + '_user', // Should keep Oauth users anonymous on demo site
        role: userRoles.user,
        // TODO: add provider to the User database model to store the Oauth provider
        provider: provider
      };
      // TODO: add a field for each of the providers so if it is used the providerId can be stored there
      user[provider] = providerId;
      // add user to the users list
      users.push(user);
    }
    // return the user so that it can be worked with after this
    return user;
  },

  // findAll returns an array of all the users
  findAll: function() {
    return _.map(users, function(user) { return _.clone(user); });
  },
  // findById returns a clone of the user if the id matches
  findById: function(id) {
    return _.clone(_.find(users, function(user) { return user.id === id }));
  },
  // findByUsername returns a clone of the user if the username matches
  findByUsername: function(username) {
    return _.clone(_.find(users, function(user) { return user.username === username; }));
  },
  // findByProviderId returns true if there is a user if the provider id is true
  findByProviderId: function(provider, id) {
    return _.find(users, function(user) { return user[provider] === id; });
  },
  // validate takes user and checks for creation conditions
  validate: function(user) {
    check(user.username, 'Username must be 1-20 characters long').len(1, 20);
    check(user.password, 'Password must be 5-60 characters long').len(5, 60);
    check(user.username, 'Invalid username').not(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/);

    // TODO: Seems node-validator's isIn function doesn't handle Number arrays very well...
    // Till this is rectified Number arrays must be converted to string arrays
    // https://github.com/chriso/node-validator/issues/185
    var stringArr = _.map(_.values(userRoles), function(val) { return val.toString() });
    check(user.role, 'Invalid user role given').isIn(stringArr);
  },

  // localStrategy - takes username, password, done callback
  localStrategy: new LocalStrategy(
    function(username, password, done) {
    	// creates a user variable and checks if it is in the database
      var user = module.exports.findByUsername(username);
      // if the user is undefined return message
      if(!user) {
        done(null, false, { message: 'Incorrect username.' });
      }
      // if password is wrong return message
      else if(user.password != password) {
        done(null, false, { message: 'Incorrect username.' });
      }
      // if all pass then run callback done
      else {
        return done(null, user);
      }

  }),

  // TWITTER STRATEGY
  // TODO: add consumer key and secret
  twitterStrategy: function() {
    process.env['TWITTER_CONSUMER_KEY'] = 'Iy1LDc2lZ7F79dyEBZaRpw';
    process.env['TWITTER_CONSUMER_SECRET'] = '2k78sAIoGFWpJndLjMx1JzvqCil4K77y6EwuOulW4';
    if(!process.env.TWITTER_CONSUMER_KEY)    throw new Error('A Twitter Consumer Key is required if you want to enable login via Twitter.');
    if(!process.env.TWITTER_CONSUMER_SECRET) throw new Error('A Twitter Consumer Secret is required if you want to enable login via Twitter.');

    return new TwitterStrategy({
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: process.env.TWITTER_CALLBACK_URL || 'http://localhost:8000/auth/twitter/callback'
    },
    function(token, tokenSecret, profile, done) {
      var user = module.exports.findOrCreateOauthUser(profile.provider, profile.id);
      done(null, user);
    });
  },

  // FACEBOOK STRATEGY
  // TODO: add app id and secret
  facebookStrategy: function() {
    process.env['FACEBOOK_APP_ID'] = '238557472964574';
    process.env['FACEBOOK_APP_SECRET'] = '3d04034285db26a15177cbd55ef8984a';
    if(!process.env.FACEBOOK_APP_ID)     throw new Error('A Facebook App ID is required if you want to enable login via Facebook.');
    if(!process.env.FACEBOOK_APP_SECRET) throw new Error('A Facebook App Secret is required if you want to enable login via Facebook.');

    return new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || "http://localhost:8000/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      var user = module.exports.findOrCreateOauthUser(profile.provider, profile.id);
            done(null, user);
    });
  },

  // GOOGLE STRATEGY
  // TODO: add google return url and realm
  googleStrategy: function() {
    process.env['GOOGLE_RETURN_URL'] = 'http://localhost:8000/auth/google/return';
    process.env['GOOGLE_REALM'] = 'http://localhost:8000/';
    return new GoogleStrategy({
      returnURL: process.env.GOOGLE_RETURN_URL || "http://localhost:8000/auth/google/return",
      realm: process.env.GOOGLE_REALM || "http://localhost:8000/"
    },
    function(identifier, profile, done) {
      var user = module.exports.findOrCreateOauthUser('google', identifier);
      done(null, user);
    });
  },

  // LINKEDIN STRATEGY
  // TODO: add key and secret
  linkedInStrategy: function() {
    process.env['LINKED_IN_KEY'] = '';
    process.env['LINKED_IN_SECRET'] = '';
    if(!process.env.LINKED_IN_KEY)     throw new Error('A LinkedIn App Key is required if you want to enable login via LinkedIn.');
    if(!process.env.LINKED_IN_SECRET) throw new Error('A LinkedIn App Secret is required if you want to enable login via LinkedIn.');

    return new LinkedInStrategy({
      consumerKey: process.env.LINKED_IN_KEY,
      consumerSecret: process.env.LINKED_IN_SECRET,
      callbackURL: process.env.LINKED_IN_CALLBACK_URL || "http://localhost:8000/auth/linkedin/callback"
    },
    function(token, tokenSecret, profile, done) {
      var user = module.exports.findOrCreateOauthUser('linkedin', profile.id);
      done(null,user); 
    });
  },
  // serializeUser
  serializeUser: function(user, done) {
    done(null, user.id);
  },

  // deserializeUser
  deserializeUser: function(id, done) {
    var user = module.exports.findById(id);

    if(user)    { done(null, user); }
    else        { done(null, false); }
  }
};