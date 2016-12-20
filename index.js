"use strict";

const express = require('express');
const bodyParser = require('body-parser')
const app     = express();

const path    = require('path');
const config  = require('./_conf/config.js');
const log     = require('./_lib/logger')(__filename);
const util     = require('./_lib/util');
const http    = require('http').Server(app);

const io = require('socket.io')(http);

const countriesGroup = require('./_lib/country_groups');
const countries = require('./_lib/countries');

let users = {};
let map = {};
let running = false;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, 'public/warmap')));
app.use('/c-ops', express.static(path.join(__dirname, 'public/c-ops')));

/**
* start the app and countdown
*/
app.get('/start', function(req, res) {
  var started = false;
  if(!running){
    started = util.setUserCountries(users, countriesGroup);
  }
  if(started) {
    res.status(200).json({"started": true});
    running = true;
    io.emit('app:start', {"start": true});
  } else {
    res.status(500).json({"started": false});
  }
});

/**
* set a map section enabled or disabled
*/
app.post('/setmap', function(req, res) {
  let data = req.body;
  io.to(map["id"]).emit('map:unlock', data);
  let state = data.state ? "enabled" : "disabled";
  res.status(200).json({"message": "Map " + countries[data.section] + " is " + state});
});

/**
* get the number of connected users
*/
app.get('/connected', function(req, res) {
  res.status(200).json({"user_count": Object.keys(users).length});
});

/**
* handle socket.io comunication
*/
io.on('connection', function(socket) {
  log.info('user connected', ' users: ' + Object.keys(users).length);

  io.to(socket.id).emit('user:connected', {"id": socket.id});

  socket.on('user:joined', function(data) {
    if(!users.hasOwnProperty(data.id) && data.role && data.role == "user")
      users[data.id] = {};
    if(data.role && data.role == "map") {
      map["id"] = data.id;
    }
    log.info(users, data);
    io.emit('user:joined', JSON.stringify(data));
  });

  socket.on('map:unlock', function(data) {
    if(data.section) {
      log.info(users, data);
      io.to(map["id"]).emit('map:unlock', data);
    }
  });

  socket.on('disconnect', function() {
    log.info(users, socket.id);
    delete users[socket.id]
    log.info('user disconnected', ' user: ' + socket.id);
  });
});

/**
* error for other request
*/
app.use(function(req, res) {
  res.status(404).send({ "ERROR": "NOT FOUND" });
});


http.listen(config.port, function() {
  log.info('Listening on port ' + config.port + '!');
});
