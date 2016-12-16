/*global io:true */

function init() {
  var socket = io();

  socket.on('user:connected', function(data) {
    if(data.error){
      console.log(data);
    } else {
      console.log(data);
      socket.emit('user:joined', {"id": data.id, "message": 'derp'});
    }
  });

  socket.on('user:joined', function(data) {
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
