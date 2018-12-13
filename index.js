const bodyParser = require('body-parser');
const express = require('express');
const router = require('./todo.js');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));

app.use('/todo', router);

app.listen(3000, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }
  console.log('server is listening');
});