'use strict';

var morgan = require('morgan');
var models = require('./models');
var bodyParser = require('body-parser');
var swig = require('swig');
require('./filters')(swig);
var express = require('express');
var app = express();
var path = require('path');
var socketio = require('socket.io');
var wikiRouter = require('./routes/wiki');
var fs = require('fs');
module.exports = app;

// templating boilerplate setup
app.set('views', path.join(__dirname, '/views')); // where to find the views
app.set('view engine', 'html'); // what file extension do our templates have
app.engine('html', swig.renderFile); // how to render html templates
swig.setDefaults({ cache: false });

// logging middleware
app.use(morgan('dev'));

// body parsing middleware
app.use(bodyParser.urlencoded({ extended: true })); // for HTML form submits
app.use(bodyParser.json()); // would be for AJAX requests

// start the server
var server = app.listen(1337, function(){
  console.log('listening on port 1337');
});
var io = socketio.listen(server);

// modular routing that uses io inside it
app.use('/wiki', wikiRouter);

// the typical way to use express static middleware.
app.use(express.static(path.join(__dirname, '/public')));
