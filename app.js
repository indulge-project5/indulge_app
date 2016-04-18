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

app.get('/notes', function(req,res) {
  db.Note.all().then(function(nts){
  	console.log("nts is: ",nts);
    res.render('notes', {n: nts});
  })
});

app.get('/users/new', function(req,res) {

  res.render('new');
});



app.get('/users/:id/notes', function(req,res) {
// Need to pass in the signedIn variable in order to toggle between the two navbar options.  In the key value pair below, the key 'taco' is what is referenced on the index page so it knows when to toggle back and forth. The value 'signedIn' refers to the variable that is defined above.
  var userId = req.params.id;
  console.log("THIS IS THE userId: " + userId);
  db.Note.find({ where: {UserId: userId }})
    .then(function(nts) {
      console.log(nts);
      res.render('couple_notes', {myNotes: nts});
    });  
});



app.post('/users', function(req,res) {
  var name = req.body.first_name;
  var phone = req.body.phone;
  db.User.create({first_name: name, phone: phone})
  	.then(function(mate) {
	res.redirect('/users');
  });
});

app.listen(3000);