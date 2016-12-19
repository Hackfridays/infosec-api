/*global io:true */

function init() {
  var socket = io();

  socket.on('user:connected', function(data) {
    if(data.error){
      console.log(data);
    } else {
      console.log(data);
      var request_id = localStorage.getItem("request_id") || data.id;
      localStorage.setItem("request_id", request_id);
      socket.emit('user:joined', {"id": request_id});
    }
  });

  socket.on('user:joined', function(data) {
    if(data.error){
      console.log(data);
    } else {
      console.log(data);
    }
  });

  socket.on('app:start', function(data) {
    if(data.error){
      console.log(data);
    } else {
      console.log(data);
    }
  });
}


window.onload = function() {
  init();
};
