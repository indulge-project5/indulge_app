var express = require('express');
var db = require('./models');
var bodyParser = require('body-parser');
var methodOverride = require("method-override");
var app = express();
var session = require('express-session');
var app = express();

// app.set('port', (process.env.PORT || 3000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');

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

app.get('/users/:uId/notes/:nId', function(req,res) {
  var user_id = req.params.uId;
  var note_id = req.params.nId;
  db.Note.find({
    where: {
      id: note_id
    }
  }).then(function (nt) {
    res.render('note_show', {note: nt, uid: user_id});
  })
});


app.get('/notes/:nId/edit', function(req,res) {
  var noteId = req.params.nId;
  var title = req.body.title;
  var description = req.body.description;
  db.Note.findById(noteId)
    .then(function(nt) {
      res.render('note_edit', {note: nt});
    });
});

// DO NOT USE!!!!!
// app.get('/users', function(req,res) {
//   db.User.all().then(function(mates){
//   	console.log("mates is: ", mates);
//     res.render('users', {peers: mates});
//   })
// });
// DO NOT USE!!!!!!

app.get('/theme', function(req,res) {
    res.render('theme');
});

app.get('/notes/new', function(req,res) {
  if((req.session.userId === null)||(req.session.userId === undefined)) {
    // User is not logged in.
    var signedIn=0;
  }
  if(req.session.userId === null) {
    // User is not logged in, so don't let them pass
    res.redirect("/login");
  } 
  else {
    //If user information is valid, allow them to continue to their profile:
    req.currentUser().then(function(user){
      if (user) {
        console.log("The user is this: ", user);
        console.log("The user id is this: ", user.id);
        console.log("The user phone is this: ", user.phone);
          res.render('new_note', { user: user, taco:signedIn});
      }
    });
  }
});

app.get('/users/new', function(req,res) {

  res.render('new_user');
});



app.get('/notes', function(req,res) {
  var myNotes = [];
  var pNotes = [];
  req.currentUser().then(function (user) {
    console.log("THE USER IS:", user);
    console.log("THE USER ID IS:", user.id);
    console.log("THE USER partner phone IS:", user.partner_phone);
    var userId = user.id;
    var phone = user.partner_phone;
    db.Note.findAll({
      where: {
        $or: {
          UserId:userId, user_phone:phone
        }
      }
    }).then(function(nts) {
      console.log("The notes are: ", nts);
      for (var key in nts) {
        console.log("The nts[key] is: ", nts[key]);
        console.log("nts[key].UserId is: ",nts[key].UserId);
        if (user.id === nts[key].UserId){
          myNotes.push(nts[key]);
        }
        else {
          pNotes.push(nts[key]);
        }
      }
      res.render('couple_notes', { myNotes, pNotes, user: user});
    })
    console.log("myNotes is: ", myNts);
    console.log("pNotes is: ", pNts);
  })
});

//Creating post request to add a new user to the users table:
//page where user will enter new user info:
app.post("/signup", function (req, res) {
  //Creating variables from params entered by new user (from user/signup.ejs form):
  var first_name = req.body.first_name;
  var last_name = req.body.last_name;
  var phone = req.body.phone;
  var partner_phone = req.body.partner_phone;
  var email = req.body.email;
  var password = req.body.password;
  //Creates a new user using createSecure function (from user.js file):
  db.User.create({first_name: first_name, last_name: last_name, phone: phone, partner_phone: partner_phone, email: email, password: password}).then(function(user){
        res.render("login");
    });
});

//Creating post request for user login:
app.post("/login", function (req, res) {
  var user = req.body;
  db.User.authenticate(user.email, user.password)
    .then(function (dbUser) {
      if(dbUser) {
        req.login(dbUser);
        res.redirect('/notes/new');
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

app.post('/notes/:id/:phone', function(req,res) {
  var note_title = req.body.title;
  var desc = req.body.description;
  var phone = req.params.phone;
  var id = req.params.id;
  // var u_ph = req.params.phone;
  // var user_id = req.params.id;
  db.Note.create({title: note_title, description: desc, UserId: id, user_phone:phone})
    .then(function(note) {
  res.redirect('/notes/new');

  });
});


app.put('/notes/:id', function(req,res) {
  var noteId = req.params.id;
  var title = req.body.title;
  var description = req.body.description;
  db.Note.findById(noteId).then(function(nt){
    nt.updateAttributes({
      title: (title||noteId.title),
      description: description})
    .then(function(savedNt) {
      res.redirect('/notes');
    });
  });
});

// DO NOT USE!!!!!!!
// app.delete('/users/:id', function (req,res) {
//   // console.log("1 test");
//   var uId = req.params.id;
//   // console.log("2 This is the video ID: ",videoId);
//   db.User.findById(uId)
//     .then(function(fUser){
//       fUser.destroy()
//       .then(function() {
//         res.redirect('/users');
//       });
//     });
// });
// DO NOT USE!!!!!!!!


//Note DELETE
app.delete('/notes/:nid', function (req,res) {
  // console.log("1 test");
  var noteId = req.params.nid;
  
  // console.log("2 This is the video ID: ",videoId);
  db.Note.findById(noteId)
    .then(function(foundNt){
      foundNt.destroy()
      .then(function() {
        res.redirect('/notes');
      });
    });
});

//Creating logout for current User:
app.get('/logout', function(req,res){
  req.logout();
  console.log("user has been destroyed", req.session.userId)
  res.redirect('/login');
});

// app.set('port', (process.env.PORT || 5000));

// For development
// app.listen(3000);

// app.listen(process.env.PORT || 3000)
// app.listen(app.get('port'), function() {
//   console.log('Node app is running on port', app.get('port'));
// });

//Telling server to listen to the site:
app.listen(process.env.PORT || 3000), function () {
  console.log("SERVER RUNNING");
};



// app.listen(process.env.PORT || 5000), function () {
//   console.log("SERVER RUNNING");
// };




