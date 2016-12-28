"use strict";

const express = require('express');
const bodyParser = require('body-parser')
const app     = express();

const path    = require('path');
const ip = require('ip');
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
let admin = {};
let appState = {
  "running": false,
  "paused": false,
  "showmap": false
};
let startTime, originalCounterTime = 45*60*1000, counterTime = originalCounterTime; // counterTime in milliseconds
let unlockedCountries = [];


function addCountry(country) {
  if (unlockedCountries.indexOf(country) == -1) unlockedCountries.push(country);
}

function removeCountry(country) {
  let index = unlockedCountries.indexOf(country);
  if (index > -1) unlockedCountries.splice(index, 1);
}

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
  if(!appState.running){
    started = util.setUserCountries(users, countriesGroup);
  }
  if(started || appState.running) {
    appState.running = true;
    startTime = new Date();
    counterTime = originalCounterTime;
    io.emit('app:start', {"start": true, "startTime": startTime, "timer": counterTime, "paused": appState.paused});
    res.status(200).json({"message": "Countdown started.", "started": true});
  } else {
    res.status(500).json({"message": "Not enough or to many users connected.", "started": false});
  }
});

/**
* reset the app and countdown
*/
app.get('/reset', function(req, res) {
  appState.running = false;
  unlockedCountries = [];
  io.emit('app:reset', {"reset": true});
  res.status(200).json({"reset": true});
});

/**
* set a map has complete
*/
app.get('/complete', function(req, res) {
  appState.running = false;
  let data = {"sections": Object.keys(countries), "state": true};
  io.to(map["id"]).emit('map:unlock', data);
  unlockedCountries = Object.keys(countries);
  Object.keys(users).forEach(function(user) {
    users[user]["locked"] = false;
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
  if(data.state) {
    addCountry(data.section);
  } else {
    removeCountry(data.section);
  }
  res.status(200).json({"message": "Map " + countries[data.section] + " is " + state});
});

/**
* set countdown timer
*/
app.post('/setCountdownTimer', function(req, res) {
  let data = req.body;
  originalCounterTime = data.timer * 60 * 1000;
  counterTime = originalCounterTime;
  res.status(200).json({"message": "Countdown set to " + data.timer + "min"});
});

/**
* set a map enabled or disabled
*/
app.post('/showmap', function(req, res) {
  let data = req.body;
  io.to(map["id"]).emit('map:show', data);
  appState.showmap = data.state;
  let state = data.state ? "enabled" : "disabled";
  res.status(200).json({"message": "Map is " + state});
});

/**
* set a map title
*/
app.post('/setMapTitle', function(req, res) {
  let data = req.body;
  io.to(map["id"]).emit('map:setTitle', data);
  res.status(200).json({"message": "Map title set to " + data.title});
});

/**
* reset the countdown
*/
app.post('/pause', function(req, res) {
  let data = req.body;
  if(appState.running){
    appState.paused = data.state;
    if(appState.paused) {
      var currTime = new Date();
      // calculate remaining time
      var elapsedTime = currTime.getTime() - startTime.getTime();
      counterTime = counterTime - elapsedTime;
    }
    startTime = new Date();
    io.emit('app:pause', {"state": data.state, "startTime": startTime, "timer": counterTime});
    let state = data.state ? "paused" : "running";
    res.status(200).json({"message": "Countdown is " + state});
  } else {
    res.status(500).json({"message": "App is not running."});
  }
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
    if(!users.hasOwnProperty(data.id) && data.role && data.role == "user") {
      users[data.id] = {};
      // emit to admin the number of conneted users
      if(admin["id"]) io.to(admin["id"]).emit('app:users', {"users:": users, "user_count": Object.keys(users).length});
    }

    if(data.role && data.role == "map") {
      map["id"] = data.id;
    }

    if(data.role && data.role == "c-ops") {
      admin["id"] = data.id;
      io.to(admin["id"]).emit('map:show', {"state": appState.showmap});
    }
    log.info(users, data);
    io.to(data.id).emit('user:joined', data);

    // if app was running and user reconnects update himm to run
    if(data.id && appState.running)
      io.to(data.id).emit('app:start', {"start": true, "startTime": startTime, "timer": counterTime, "paused": appState.paused});

    // keep activated map section on in map an c-ops after refresh
    if(data.role && (data.role == "c-ops" || data.role == "map")) {
      Object.keys(users).forEach(function(user) {
        if(users[user].locked === false)
          users[user].countries.forEach(function(country) {
            addCountry(country);
          });
      });
      let result = {};
      result["sections"] = unlockedCountries;
      result["state"] = true;
      if(admin["id"]) io.to(admin["id"]).emit('map:unlock', result);
      if(map["id"]) io.to(map["id"]).emit('map:unlock', result);
    }

    // if user already unlocked and refresh update him to stay unlocked
    if(users[data.id] && users[data.id]["locked"] === false) io.to(data.id).emit('app:password', {"valid": true});
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
        if(admin["id"]) io.to(admin["id"]).emit('map:unlock', result);
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
    if(map["id"] == socket.id && admin["id"]) io.to(admin["id"]).emit('map:show', {"state": false});
    if(admin["id"]) io.to(admin["id"]).emit('app:users', {"users:": users, "user_count": Object.keys(users).length});
  });
});

/**
* error for other request
*/
app.use(function(req, res) {
  res.status(404).send({ "ERROR": "NOT FOUND" });
});


http.listen(config.port, function() {
  log.info('Listening on ' + ip.address() + ' at port ' + config.port + '!');
});
