// require modules needed to start and run server
var express = require('express'),
       http = require('http'),
   passport = require('passport'),
       path = require('path');

// create the express/node server
var app = express();

// set the port to listen to the exvironement port or port 8000
app.set('port', process.env.PORT || 8000);

// returns a new web server object and listens to it and gets the port number
// console log the server status
http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});