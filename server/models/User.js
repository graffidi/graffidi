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
	// addUser function - takes username, password, role, first_name, last_name, email, callback
  addUser: function(username, password, role, first_name, last_name, email, callback) {
    // Search the User table for the username supplied
    Users.find({where: {username: username}}).success(function(user) {
      // If doesn't exist create new user
      if (!user) {
        var user = {
          // Refactor without .max if time
          id: _.max(users, function(user) { return user.id; }).id + 1,
          username: username,
          password: password,
          first_name: first_name,
          last_name: last_name,
          email: email,
          role: role.title
        };
        // add the user back to the database
        Users.create(user, [ 'username', 'password', 'first_name', 'last_name', 'email', 'role' ]).success(function(user) {
          // add the user to the user array
          users.push(user);
          if(user) {
              if (user.role === 'admin') {
                  user.role = userRoles.admin;
              } else {
                  user.role = userRoles.user;
              }
          };
          // Run callback (err=null, user)
          callback(null, user);
        });
      }
    });
  },

  // Refactor to store IDs
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
    return Users.findAll().success(function(users){
      console.log('Got all Users ', allusers.length);
      return users;
    });
  },
  // findById returns a clone of the user if the id matches
  findById: function(id) {
    return Users.find({where: {id: id}}).success(function(user) {
      return user;
    });
  },
  // findByUsername returns a clone of the user if the username matches
  findByUsername: function(username, callback) {
    Users.find({where: {username: username}}).success(function(user) {
      if(!user) {
        return callback(null, null);
      }
      if (user.username === username) {
        console.log("I'm in the findByUsername function");
        return callback(null, user);
      }
    });
  },
  // findByProviderId returns true if there is a user if the provider id is true
  findByProviderId: function(provider, id) {
    return Users.find({where: {provider: id}}).success(function(user) {
      return user;
    });
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
      // process.tick to run function in time order
      process.nextTick(function() {
        // check for the user based off username
        module.exports.findByUsername(username, function(err, user) {
          if(err) {
            return done(err);
          }
          if(!user) {
            return done(null, false, {message: "Unknown user" + username});
          }
          if(user.password != password) {
            return done(null, false, {message: "Invalid password"});
          }
          if(user) {
            if(user.role === 'admin') {
              user.role = userRoles.admin;
            } else {
              user.role = userRoles.user;
            }
          }
          return done(null, user);
        })
      });
    }
  ),

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