const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Initialize variables
const users = [];
let userID = 1;

// Class template for creating objects
class User {
  constructor(_id, username, count, log) {
    this._id = _id;
    this.username = username;
    this.count = count || 0; // Fix for count not being initialized
    this.log = log || []; // Fix for log not being initialized
  }
}

// Create new user {"_id":"1","username":"user1"}
app.post('/api/users', (req, res) => {
  // Create new users with class constructor instances
  let _id = userID.toString();
  let username = req.body.username;
  let userX = new User(_id, username);
  users.push(userX);
  res.json({ _id: userX._id, username: userX.username });
  console.log("CREANDO USUARIO: "+userX._id);
  console.log(({ _id: userX._id, username: userX.username }));
  userID++;
});

// Get array of all users [{"_id":"1","username":"user1"}, {"_id":"2","username":"user2"}]
app.get('/api/users', (req, res) => {
  let arrX = [];
  for (let i = 0; i < users.length; i++) {
    arrX.push({ _id: users[i]._id, username: users[i].username });
  }
  res.json(arrX);
});

const moment = require('moment');

app.post('/api/users/:_id/exercises', (req, res) => {
  let userX = users.find(({ _id }) => _id === req.params._id);
  console.log("exercise user", req.params._id);

  // Parsea y formatea la fecha usando moment.js
  let dateX = req.body.date ? moment(req.body.date).format('ddd MMM DD YYYY') : moment().format('ddd MMM DD YYYY');

  userX.log.push({
    date: dateX, // Asegúrate de que dateX sea una cadena de fecha válida
    duration: Number(req.body.duration),
    description: req.body.description.toString(),
  });

  userX.count++;

  // Construye el objeto de respuesta con los campos del ejercicio
  const exerciseObject = {
    username: userX.username,
    description: req.body.description.toString(),
    duration: Number(req.body.duration),
    date: dateX.toString(),
    _id: userX._id
  };

  console.log(exerciseObject);
  res.json(exerciseObject);
});


app.get('/api/users/:_id/logs', (req, res) => {
  let userX = users.find(({ _id }) => _id === req.params._id);
  let fromX = req.query.from;
  let toX = req.query.to;
  let limitX = Number(req.query.limit);
  console.log("limite query log", req.query);

  let logX = [...userX.log]; // Clonar la lista de logs del usuario
  
  // Filtrar los registros de ejercicio por fecha si se proporcionan fromX y toX
  if (fromX && toX) {
    logX = logX.filter(exercise => {
      let exerciseDate = new Date(exercise.date);
      return exerciseDate >= new Date(fromX) && exerciseDate <= new Date(toX);
    });
  }


  if (limitX) {
    logX = logX.slice(0, limitX); // Limitar la cantidad de registros de ejercicios
  }
  console.log(logX);
  // Mapea los registros de ejercicio y formatea la fecha como una cadena dateString
  logX = logX.map(exercise => ({
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toString()
  }));

  const logResponse = {
    _id: userX._id,
    username: userX.username,
    count: userX.count,
    log: logX, // Devuelve los registros de ejercicio con las fechas formateadas correctamente
  };
  console.log("Consultando log de usuario: " + logResponse._id);
  console.log(logResponse);
  res.json(logResponse);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});