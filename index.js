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
  } catch(err) { console.log(err) }
  
});


// ADD EXCERCISES
app.post('/api/users/:_id/exercises', async (req, res) => {
  
  const id = req.params._id;
  const {description, duration, date } = req.body;

  const user = await User.findById(id);
  
  if (!user) {res.send("Could not find User.");
    
  } else {
      const excerciseObj = new Excercise({
        user_id : id,
        description : description , 
        duration , 
        date: date ? new Date(date) : new Date()
      })
      const excercise = await excerciseObj.save()

      res.json({
        _id : user._id,
        username : user.username,
        description : excercise.description,
        excercise : excercise.duration,
        date : new Date(excercise.date).toDateString()
      })
    }

});



// GET ALL USER DATA
app.get('/api/users', (req, res) => {
  res.json() //return list of all users
});

// GET USER DATA
app.get('/api/users/:username', (req, res) => {
  const username = req.body.username;
  res.json() //return list of all users
});


app.post('/api/users/:_id/logs', (req, res) => {
});

const listener = app.listen(process.env.PORT || 8080, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

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