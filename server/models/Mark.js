// create the User variable
// require underscore, sequelize
var Mark;
var              _ = require('underscore'),
         Sequelize = require('sequelize-mysql').sequelize;

var sequelize = new Sequelize('graffidi', 'root');


Marks = sequelize.define('Mark', {
  id: Sequelize.INTEGER(11).UNSIGNED,
  title: Sequelize.STRING(160),
  posted_by: Sequelize.STRING(45),
  start_time: Sequelize.INTEGER,
  end_time: Sequelize.INTEGER,
  video_id: Sequelize.STRING(11),
  likes: Sequelize.INTEGER(8)
});

Marks.hasMany(Message);
Marks.hasOne(User);

Marks.sync().success(function(){
  console.log('Mark success');  
});

// array that holds all the users in the system
// refactor to use data.users
var marks;

// Sequelize call to get all Users in table
Marks.findAll().success(function(allmarks){
    console.log('Got all Marks ', allmarks.length);
    marks = allmarks;
  });

// set modelue.exports object
module.exports = {
	// addUser function - takes username, password, role, first_name, last_name, email, callback
  addMark: function(video_id, title, posted_by, start_time, end_time, callback) {
    // If doesn't exist create new user
    if (!mark) {
      var mark = {
        // Refactor without .max if time
        id: _.max(marks, function(mark) { return mark.id; }).id + 1,
        video_id: video_id,
        title: title,
        posted_by: posted_by,
        start_time: start_time,
        end_time: end_time,
      };
      // add the mark back to the database
      Marks.create(mark, [ 'video_id', 'title', 'posted_by', 'start_time', 'end_time' ]).success(function(mark) {
        // add the mark to the mark array
        marks.push(mark);

        // Run callback (err=null, user)
        callback(null, mark);
      });
    }
  },

  // findAll returns an array of all the users
  findAll: function() {
    Marks.findAll().success(function(allmarks){
      console.log('Got all Marks ', allmarks.length);
      marks = allmarks;
    });
    return marks;
  },
  // findById returns a clone of the user if the id matches
  findById: function(id) {
    return Marks.find({where: {id: id}}).success(function(user) {
      return user;
    });
  },  
};