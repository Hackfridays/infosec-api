'use strict';

var express = require('express');
var app     = express();

var path    = require('path');
var config  = require('./_conf/config.js');
var log     = require('./_lib/logger')(__filename);
var express = require('express');
var http    = require('http').Server(app);

var userCount = 0;
var users = {};
var io = require('socket.io')(http);

app.use('/', express.static(path.join(__dirname, 'public/warmap')));
app.use('/c-ops', express.static(path.join(__dirname, 'public/c-ops')));


io.on('connection', function(socket) {
  log.info('user connected', ' users: ' + userCount);

  io.to(socket.id).emit('user:connected', {"id": socket.id});

  socket.on('user:joined', function(data) {
    users[data.id] = {};
    log.info(users, data);
    io.emit('user:joined', 'data: ' + JSON.stringify(data));
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
