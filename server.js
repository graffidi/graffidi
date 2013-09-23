// require modules needed to start and run server
var express = require('express'),
       http = require('http'),
   passport = require('passport'),
       path = require('path');

// create the express/node server
var app = express();

// development set up
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// production set up
app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// added to test passport
app.get('/users', function(req, res){
  res.send([{name: "user1"}, {name: "user2"}]);
});

// route to test if the user is logged in or not
app.get('/loggedin', function(req, res) {
  res.send(req.isAuthenticated() ? req.user : '0');
});

// route to log in
app.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }));

// route to log out
app.post('/logout', function(req, res){
  req.logOut();
  res.send(200);
});

// JSON API
// add passport calls into the JSON API calls!!
//app.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }));

app.get('/api/posts',auth, api.posts);

app.get('/api/post/:id',auth, api.post);
app.post('/api/post',auth, api.addPost);
app.put('/api/post/:id',auth, api.editPost);
app.delete('/api/post/:id',auth, api.deletePost);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

// set the port to listen to the exvironement port or port 8000
//app.set('port', process.env.PORT || 8000);

// returns a new web server object and listens to it and gets the port number
// console log the server status
//http.createServer(app).listen(app.get('port'), function(){
//    console.log("Express server listening on port " + app.get('port'));
//});