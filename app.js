var express = require('express');
var db = require('./models');
var bodyParser = require('body-parser');
var methodOverride = require("method-override");
var app = express();
var session = require('express-session')


//In order to track sessions, express-session is required (command-line:npm install --save express-session):
    session = require("express-session"),
    app = express();


app.use(express.static(__dirname + '/public'));

// Set the view engine to be "EJS"
app.set('view engine', 'ejs');

// Set up body parser
app.use(bodyParser.urlencoded({extended: true}));

// Set up method override to work with POST requests that have the parameter "_method=DELETE"
app.use(methodOverride('_method'));



//Defining the req.session (specific user who logs in):
app.use(session({
  secret: 'Double Top Secret Probation',
  resave: false,
  // save: {uninitialized: true }
  saveUninitialized: true
}))
//Creating ability to track sessions:
app.use("/", function (req, res, next) {
//If user has not signed in, this code sets req.session.userId to null, otherwise, it will set to current user:
  req.session.userId = req.session.userId || null;

  req.login = function (user) {
    req.session.userId = user.id;
  };
  req.currentUser = function () {
    return db.User.find({
        where: {
          id: req.session.userId
       }
      }).
      then(function (user) {
        req.user = user;
        return user;
      })
  };
  req.logout = function () {
    req.session.userId = null;
    req.user = null;
  }
  next(); 
});




//GET REQUESTS//
app.get('/', function(req,res) {
  res.render('index');
});


//Creating get request for login page:
app.get('/login', function(req,res){
  if((req.session.userId===null)||(req.session.userId===undefined)) {
    // If no user is currently logged in, then render the login page:
      res.render("login");
    } 
    else {
      console.log("The req.session.userId is: ", req.session.userId);
    //If user is already in a session, redirect to the profile page:
    res.redirect('/');
  }
});

app.get('/users', function(req,res) {
  db.User.all().then(function(mates){
  	console.log("mates is: ", mates);
    res.render('users', {peers: mates});
  })
});

app.get('/theme', function(req,res) {
    res.render('theme');
});

app.get('/notes/new', function(req,res) {
  res.render('new_note');
});

app.get('/notes', function(req,res) {
  db.Note.all().then(function(nts){
  	console.log("nts is: ",nts);
    res.render('notes', {n: nts});
  })
});

app.get('/users/new', function(req,res) {

  res.render('new_user');
});



app.get('/users/:id/:cid/notes', function(req,res) {
  var userId = req.params.id;
  var c_id = req.params.cid;
  console.log("THIS IS THE userId: " + userId);
  db.Note.findAll({
    where: {
      $or: {
        UserId:userId, user_phone:c_id
      }}})
  .then(function(nts) {
    console.log("The notes are: ", nts);
    res.render('couple_notes', { myNote: nts});
  })
});


// DOESN'T WORK
//   db.Note.find({$or:[{"UserId":userId},{"user_phone":c_id}]})
//     .then(function(nts) {
//       console.log("The notes are: ", nts);
//       res.render('couple_notes', { myNote: nts});
//     });
// });


// DOESN'T WORK
//   db.Note.find({ where: {UserId: userId }})
//     .then(function(nts) {
//       console.log(nts);
//       res.render('couple_notes', { myNote: nts});
//     });  
// });



// DOESN'T WORK
//   db.Note.findAll({ attributes: ['title','description','user_phone','UserId'],
//     where: {UserId: userId }})
//   db.Note.findAll({ attributes: ['title','description','user_phone','UserId'],
//     where: {user_phone: u_ph}})
//     .then(function(nts) {
//       console.log("This is the notes: ", nts);
//       res.render('couple_notes', {myNotes: nts});
//     });  
// });

// DOESN'T WORK
//   db.Note.findAll({where: Sequelize.or({
//     user_phone:u_ph},{UserId:userId})})
//     .then(function(nts) {
//       console.log("This is the notes: ", nts);
//       res.render('couple_notes', {myNotes: nts});
//     });  
// });

//Creating post request for user login:
app.post("/login", function (req, res) {
  var user = req.body;
  db.User.authenticate(user.email, user.password)
    .then(function (dbUser) {
      if(dbUser) {
        req.login(dbUser);
        res.redirect('/notes');
      } else {
        res.send('You failed');
      }
    });
});

app.post('/users', function(req,res) {
  var f_name = req.body.first_name;
  var l_name = req.body.last_name;
  var phone = req.body.phone;
  var email = req.body.email;
  var password = req.body.password;
  db.User.create({first_name: f_name, last_name: l_name, phone: phone, email: email, password: password})
  	.then(function(mate) {
	res.redirect('/users');
  });
});

app.post('/notes', function(req,res) {
  var note_title = req.body.title;
  var desc = req.body.description;
  var phone = req.body.phone;
  var id = req.body.user_id
  // var u_ph = req.params.phone;
  // var user_id = req.params.id;
  db.Note.create({title: note_title, description: desc, UserId: id, user_phone:phone})
    .then(function(note) {
  res.redirect('/notes');
  });
});

//Creating logout for current User:
app.get('/logout', function(req,res){
  req.logout();
  console.log("user has been destroyed", req.session.userId)
  res.redirect('/login');
});

// For development
// app.listen(3000);

// For Heroku
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

