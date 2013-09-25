/*
 * Serve JSON to our AngularJS client
 */
Sequelize = require("sequelize-mysql").sequelize;
// Start Sequelize
var sequelize = new Sequelize('graffidi', 'root');

User = sequelize.define('User', {
  id: Sequelize.INTEGER(11).UNSIGNED,
  first_name: Sequelize.STRING(45),
  last_name: Sequelize.STRING(45),
  email: Sequelize.STRING(255),
  password: Sequelize.STRING(45),
  about: Sequelize.TEXT
 });

Message = sequelize.define('Message', {
  id: Sequelize.INTEGER(11).UNSIGNED,
  // set up parent.id for message tree | Null if message is initial message | has one relationship
  parent_id: {
    type: Sequelize.INTEGER(11).UNSIGNED,
    references: "Messages",
    referencesKey: "id",
    default: 'Null'
  },
  depth: {
      type: Sequelize.INTEGER(11).UNSIGNED,
      default: '0'
    },
  // set up mark.id for message tree | has one to many relationship
  mark_id: {
    type: Sequelize.INTEGER(11).UNSIGNED,
    references: "Marks",
    referencesKey: "id"
  },
  content: Sequelize.TEXT,
  author_id: Sequelize.INTEGER(11).UNSIGNED,
  likes: Sequelize.INTEGER(8)
 });

Mark = sequelize.define('Mark', {
  id: Sequelize.INTEGER(11).UNSIGNED,
  title: Sequelize.STRING(160),
  posted_by: Sequelize.STRING(45),
  start_time: Sequelize.INTEGER,
  end_time: Sequelize.INTEGER,
  video_id: Sequelize.STRING(11),
  // set up relationship with Message.id | one to one relationship
  message_id: {
    type: Sequelize.INTEGER(11).UNSIGNED,
    references: "Messages",
    referencesKey: "id"
  },
  // set up relationship with User.id | one to one relationship
  author_id: {
    type: Sequelize.INTEGER(11).UNSIGNED,
    references: "Users",
    referencesKey: "id"
  },
  likes: Sequelize.INTEGER(8)
});

Mark.hasMany(Message);
Mark.hasOne(User);

Mark.sync().success(function(){
  console.log('Mark success');  
});
Message.sync().success(function(){
  console.log('Message success');  
});
User.sync().success(function(){
  console.log('User success');  
});

 var data = {'posts':[], 'messages':[], 'users':[]};

// GET

exports.posts = function (req, res) {
  Mark.findAll().success(function(marks){
    console.log('Got all Marks ', marks.length);
    data.posts = marks;
    });
  Message.findAll().success(function(messages){
    console.log('Got all Messages ', messages.length);
    data.messages = messages;
  });
  User.findAll().success(function(users){
    console.log('Got all Users ', users.length);
    data.users = users;
  });
  // console.log(data); //on first refresh this is empty
  // on second refresh the data is stored (async issue)
  // in the process of getting the user(id) field to populate with the mark
  res.json(data);
};

exports.post = function (req, res) {
  var id = req.params.id;
  var selectedMessages = [];
  //sequelize get all messages with id = mark.id
  Message.findAll({where: {mark_id: id}}).success(function(messages){
    selectedMessages = messages;
    console.log('Messages for id =', selectedMessages.length);
  });
  if (id >= 0 && id < data.posts.length) {
    res.json({
      post: data.posts[id],
      message: data.messages
    });
  } else {
    res.json(false);
  }
};

// POST

exports.addPost = function (req, res) {
  data.posts.push(req.body);
  res.json(req.body);
};

// PUT

exports.editPost = function (req, res) {
  var id = req.params.id;

  if (id >= 0 && id < data.posts.length) {
    data.posts[id] = req.body;
    res.json(true);
  } else {
    res.json(false);
  }
};

// DELETE

exports.deletePost = function (req, res) {
  var id = req.params.id;

  if (id >= 0 && id < data.posts.length) {
    data.posts.splice(id, 1);
    res.json(true);
  } else {
    res.json(false);
  }
};