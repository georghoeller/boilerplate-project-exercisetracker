// FIREBASE DEPLOY EXPRESS API
// https://www.youtube.com/watch?v=LW26kpjGl2c

const {onRequest} = require("firebase-functions/v2/https");

const express = require('express')
const app = express()

const cors = require('cors')
const bodyParser   = require('body-parser');
require('dotenv').config()

const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL)

const UserSchema = new mongoose.Schema({
  username: String,
});
const User = mongoose.model("User",UserSchema)

const ExcerciseSchema = new mongoose.Schema({
  user_id: { type: String, required : true },
  description: String,
  duration: Number,
  date: Date,
});
const Excercise = mongoose.model("Excercise",ExcerciseSchema);

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// CREATE USER 
app.post('/api/users', async (req, res) => {
  
  const userObj = new User({
    username : req.body.username
  })

  try {
    const user = await userObj.save();
    console.log(user)
    res.json(user)
  } catch(err) { 
    console.log(err) 
    res.send("Error occured.")
  }
  
});


// GET ALL USER DATA
app.get('/api/users', async (req, res) => {
  const users = await User.find({})
    .select("id_ username");
  res.json(users);
});

// ADD EXCERCISES TO ONE USER
app.post('/api/users/:_id/exercises', async (req, res) => {
  
  const id = req.params._id;
  const {description, duration, date } = req.body;
  
    const user = await User.findById(id);
    
    if (!user) {res.send("Could not find User.");
      
    } else {
        const excerciseObj = new Excercise({
          user_id : id,
          description : description , 
          duration : duration , 
          date: date ? new Date(date) : new Date()
        })
        const excercise = await excerciseObj.save()

        res.json({
          _id : user._id,
          username : user.username,
          description : excercise.description,
          duration : excercise.duration,
          date : new Date(excercise.date).toDateString()
        })
      }
  

});



// // GET USER DATA
// app.get('/api/users/:username', (req, res) => {
//   const username = req.body.username;
//   res.json() //return list of all users
// });

// GET ALL THE LOGS FROM ONE USER
app.get('/api/users/:_id/logs', async (req, res) => {
  const {from, to, limit }  = req.query;
  const id = req.params._id;
  const user = await User.findById(id);

  let filter = {user_id : id};
  let dateObj = {}
  if (from) dateObj["$gte"] = new Date(from);
  if (to) dateObj["$lte"] = new Date(to);
  if (from || to) filter.date = dateObj;

  try {

    const excercises = await Excercise.find(filter).limit(limit ?? 500);
  
    const log = excercises.map(e => ({
      description : e.description,
      duration : e.duration,
      date : e.date.toDateString()
    }));

    res.json({
      username: user.username,
      count: excercises.length ,
      _id: id,
      log: log,
    });

    } catch(err) {
      console.log(err)
      res.send("Excercise Log not found.")
    }


});

const listener = app.listen(process.env.PORT || 8080, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

exports.api = onRequest(app);

// RESPONSES: 

// EXCERCISE {
//   username: "fcc_test",
//   description: "test",
//   duration: 60,
//   date: "Mon Jan 01 1990",
//   _id: "5fb5853f734231456ccb3b05" }

// USER {
//   username: "fcc_test",
//   _id: "5fb5853f734231456ccb3b05" }

// LOG {
//   username: "fcc_test",
//   count: 1,
//   _id: "5fb5853f734231456ccb3b05",
//   log: [{
//     description: "test",
//     duration: 60,
//     date: "Mon Jan 01 1990",
//   }]
// }