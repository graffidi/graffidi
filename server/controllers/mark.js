// require the Mark model
var Mark = require('../models/Mark.js');
 // controlled from the client side

// contains the module to load the index of the web app that collects a list of users
module.exports = {
  index: function(req, res) {
    // creates an array of all the marks in the User model database
    var marks = Mark.findAll();
    console.log("mark.js check ", marks.length); //undefined
    // send a response to the server with the list of the users
    res.json(marks);
  },
  addMark: function(req, res, next) {
    // addMark on Mark model
    Mark.addMark(req.body.video_id, req.body.title, req.body.posted_by, req.body.start_time, req.body.end_time, function(err, mark) {
    	if(err) {
    		return res.send(500);
    	}
    	console.log("mark.js addMark ");
    	res.json(200, {"video_id": mark.video_id, "title": mark.title, "posted_by": mark.posted_by, "start_time": mark.start_time, "end_time": mark.end_time });
    });
  }
};