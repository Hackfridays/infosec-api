"use strict";

const express = require('express');
const app     = express();

const path    = require('path');
const config  = require('./_conf/config.js');
const log     = require('./_lib/logger')(__filename);
const util     = require('./_lib/util');
const http    = require('http').Server(app);

const io = require('socket.io')(http);

const countriesGroup = require('./_lib/country_groups');

let users = {};
let running = false;

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
    io.emit('app:start', JSON.stringify({"start": true}));
  } else {
    res.status(500).json({"started": false});
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
    if(!users.hasOwnProperty(data.id))
      users[data.id] = {};
    log.info(users, data);
    io.emit('user:joined', JSON.stringify(data));
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
