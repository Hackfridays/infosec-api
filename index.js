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

const waitTime = 5000; // wait 5 seconds before sending password feedback

let users = {};
let map = {};
let running = false;
let startTime;

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
    running = true;
    startTime = new Date();
    io.emit('app:start', {"start": true, "timer": startTime});
    res.status(200).json({"started": true});
  } else {
    res.status(500).json({"started": false});
  }
});

/**
* reset the app and countdown
*/
app.get('/reset', function(req, res) {
  running = false;
  io.emit('app:reset', {"reset": true});
  res.status(200).json({"reset": true});
});

/**
* set a map has complete
*/
app.get('/complete', function(req, res) {
  running = false;
  let data = {"sections": Object.keys(countries), "state": true};
  io.to(map["id"]).emit('map:unlock', data);
  Object.keys(users).forEach(function(user) {
    io.to(user).emit('app:password', {"valid": true});
  });
  res.status(200).json({"message": "Map was set as complete"});
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
* set a map enabled or disabled
*/
app.post('/showmap', function(req, res) {
  let data = req.body;
  io.to(map["id"]).emit('map:show', data);
  let state = data.state ? "enabled" : "disabled";
  res.status(200).json({"message": "Map is " + state});
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
    if(data.role && data.role == "map")
      map["id"] = data.id;
    log.info(users, data);
    io.emit('user:joined', data);
    if(data.id && running)
      io.to(data.id).emit('app:start', {"start": true, "timer": startTime});

  });

  socket.on('map:unlock', function(data) {
    log.info('map:unlock', data);
    if(data.id && data.password && users[data.id]["countries"] != null) {
      log.info(users, data);
      let valid = util.validatePassword(countries, data.password);
      let result = {};
      if(valid) {
        users[data.id]["locked"] = false;
        result["sections"] = users[data.id]["countries"];
        result["state"] = true;
        setTimeout(function(){
          log.info("emit to", map["id"], 'map:unlock', result);
          io.to(map["id"]).emit('map:unlock', result);
        }, waitTime);
      }
      setTimeout(function(){
        log.info("emit to", data.id, 'app:password', {"valid": valid});
        io.to(data.id).emit('app:password', {"valid": valid});
      }, waitTime);
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
