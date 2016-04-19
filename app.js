var express = require('express');
var db = require('./models');
var bodyParser = require('body-parser');
var methodOverride = require("method-override");
var app = express();

app.use(express.static(__dirname + '/public'));

// Set the view engine to be "EJS"
app.set('view engine', 'ejs');

// Set up body parser
app.use(bodyParser.urlencoded({extended: true}));

// Set up method override to work with POST requests that have the parameter "_method=DELETE"
app.use(methodOverride('_method'));

//GET REQUESTS//
app.get('/', function(req,res) {
  res.render('index');
});

app.get('/users', function(req,res) {
  db.User.all().then(function(mates){
  	console.log("mates is: ", mates);
    res.render('users', {peers: mates});
  })
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

  res.render('new');
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

app.post('/users', function(req,res) {
  var name = req.body.first_name;
  var phone = req.body.phone;
  db.User.create({first_name: name, phone: phone})
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


app.listen(3000);

