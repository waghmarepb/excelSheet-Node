//Packages
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

//file includes
var config = require('./config/config');
var validateRequest = require('./middlewares/validateRequest');

/************************* START App initialization ************************************/
/****************************************************************************************************/

var app = express();

//Parse json
app.use(bodyParser.json());


//Set headers for Cross origin
app.all('/*', function (req, res, next) {

  res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,content-type,content-Type,Content-type,Accept,X-Access-Token,X-Key');
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});

app.use('/uploads', express.static('./controllers/uploads/'));

app.all('/secure/*', validateRequest.validateUser);

app.use('/', require('./routes'));

// If no route is matched by now, it must be a 404
app.use(function (req, res, next) {
  res.status(404).json({
    status: '404',
    message: "Page not found"
  }).end();

});

/************************* END App initialization & Middlewares ************************************/
/***************************************************************************************************/



/************************* Start Server & DB *******************************************************/
/***************************************************************************************************/


//Start server
app.set('port', config.port);

var server = app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + server.address().port);
});


// Database Connection
// Database Connection
async function connectToDatabase() {
  try {
    await mongoose.connect(config.mongo.url);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

connectToDatabase();
/************************* END Server & DB Connection **********************************************/
/***************************************************************************************************/
