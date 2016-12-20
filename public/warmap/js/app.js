/*global io:true, $:true */

function init() {
  var socket = io();
  var countries_state = [];

  socket.on('user:connected', function(data) {
    if(data.error){
      console.log(data);
    } else {
      console.log(data);
      // var request_id = localStorage.getItem("request_id") || data.id;
      // localStorage.setItem("request_id", request_id);
      socket.emit('user:joined', {"id": data.id, "role":"map"});
    }
  });

  socket.on('app:start', function(data) {
    if(data.error){
      console.log(data);
    } else {
      console.log(data);
    }
  });

  socket.on('map:unlock', function(data) {
    if(data.error){
      console.log(data);
    } else {
      console.log(data);
      setSectionState(data.section, data.state);
    }
  });

  function setSectionState(section, state) {
    switch (section) {
      case "F78":
        if (state)	{
          $("#p1").attr('src', '/img/blue-1.png');
          countries_state.push(1);
        } else {
          $('#p1').attr('src', './img/red-1.png');
          countries_state.pop();
        }
        break;
      case "H22":
        if (state)	{
          $("#p2").attr('src', '/img/blue-2.png');
          countries_state.push(1);
        } else {
          $('#p2').attr('src', './img/red-2.png')
          countries_state.pop();
        };
        break;
      case "A45":
        if (state)	{
          $("#p3").attr('src', '/img/blue-3.png');
          countries_state.push(1);
        } else {
          $('#p3').attr('src', './img/red-3.png');
          countries_state.pop();
        }
        break;
      case "Y63":
        if (state)	{
          $("#p4").attr('src', '/img/blue-4.png');
          countries_state.push(1);
        } else {
          $('#p4').attr('src', './img/red-4.png');
          countries_state.pop();
        }
        break;
      case "S74":
        if (state)	{
          $("#p5").attr('src', '/img/blue-5.png');
          countries_state.push(1);
        } else {
          $('#p5').attr('src', './img/red-5.png');
          countries_state.pop();
        }
        break;
      case "U20":
        if (state)	{
          $("#p6").attr('src', '/img/blue-6.png');
          countries_state.push(1);
        } else {
          $('#p6').attr('src', './img/red-6.png');
          countries_state.pop();
        }
        break;
      case "B52":
        if (state)	{
          $("#p7").attr('src', '/img/blue-7.png');
          countries_state.push(1);
        } else {
          $('#p7').attr('src', './img/red-7.png');
          countries_state.pop();
        }
        break;
      case "W41":
        if (state)	{
          $("#p8").attr('src', '/img/blue-8.png');
          countries_state.push(1);
        } else {
          $('#p8').attr('src', './img/red-8.png');
          countries_state.pop();
        }
        break;
      case "Q96":
        if (state)	{
          $("#p9").attr('src', '/img/blue-9.png');
          countries_state.push(1);
        } else {
          $('#p9').attr('src', './img/red-9.png');
          countries_state.pop();
        }
        break;
      case "G78":
        if (state)	{
          $("#p10").attr('src', '/img/blue-10.png');
          countries_state.push(1);
        } else {
          $('#p10').attr('src', './img/red-10.png');
          countries_state.pop();
        }
        break;
      default:
        console.error("Invalid section:", section);
        break;
    }
    var totalUnlocked = countries_state.reduce(function(a, b) {
      return a + b;
    });

    console.log(totalUnlocked);
    if(totalUnlocked == 10) {
      $('body').addClass('peace');
    } else {
      $('body').removeClass('peace');
    }
  }
}

window.onload = function() {
  init();
};
