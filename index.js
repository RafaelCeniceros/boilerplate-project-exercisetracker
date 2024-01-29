const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

// Initialize variables
const users = []
let userID = 1

// Class template for creating objects
class User {
  constructor(_id, username, count, log) {
    this._id = _id
    this.username = username
    this.count = 0
    this.log = []
  }
}

// Create new user {"_id":"1","username":"user1"}
app.post('/api/users', (req, res) => {
  // Create new users with class constructor instances
  let _id = userID.toString()
  let username = req.body.username
  let userX = new User(_id, username)
  users.push(userX)
  res.json({ _id: userX._id, username: userX.username })
  userID++
})

// Get array of all users [{"_id":"1","username":"user1"}, {"_id":"2","username":"user2"}]
app.get('/api/users', (req, res) => {
  let arrX = []
  for (let i = 0; i < users.length; i++) {
    arrX.push({ _id: users[i]._id, username: users[i].username })
  }
  res.json(arrX)
})

app.post('/api/users/:_id/exercises', (req, res) => {
  console.log(req.body);
  let userX = users.find(({ _id }) => _id === req.params._id);
  let dateX = req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString();

  userX.log.push({
    date: dateX,
    duration: Number(req.body.duration),
    description: req.body.description.toString(),
  });

  userX.count++;

  // Construye el objeto de respuesta con los campos del ejercicio
  const exerciseObject = {
    username: userX.username,
    description: (req.body.description).toString(),
    duration: Number(req.body.duration),
    date: dateX,
    _id: userX._id
  };

  res.json(exerciseObject);
});

app.get('/api/users/:_id/logs', (req, res) => {
  let userX = users.find(({ _id }) => _id === req.params._id);
  let fromX = req.query.from;
  let toX = req.query.to;
  let limitX = Number(req.query.limit);

  let logX = userX.log;

  if (limitX) {
    logX = logX.slice(0, limitX); // Limitar la cantidad de registros de ejercicios
  }

  res.json({
    username: userX.username,
    count: userX.count,
    _id: userX._id,
    log: logX.map(exercise => ({
      description: exercise.description,
      duration: exercise.duration,
      date: (exercise.date).toDateString
    })),
    from: fromX,
    to: toX
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})