/*global io:true, $:true, swal:true */

function init() {
  var socket = io();

  $("#start").on('click', function () {
    swal({
        title: "Countdown Time",
        text: "Please set countdown time in minutes:",
        type: "input",
        showCancelButton: true,
        closeOnConfirm: false,
        animation: "slide-from-top",
        inputPlaceholder: "45"
      },
      function(inputValue){
        if (inputValue === "") {
          swal.showInputError("You need to write something!");
          return false
        } else if (isNaN(inputValue)) {
          swal.showInputError("You must input a number.");
          return false;
        } else {
          var countdowntime = Number(inputValue);
          if(countdowntime < 1){
            swal.showInputError("Time must be bigger than 1 minute.");
            return false;
          }
          post("/setCountdownTimer", {"timer": countdowntime});
          get("/start");
          swal.close();
        }
    });
  });

  $("#reset").on('click', function () {
    get("/reset");
    $("input.region").prop("checked", false);
  });

  $("input.region").on('click', function () {
    post("/setmap", {"section": $(this).val(), "state": this.checked});
  });

  $("#onoff").on('click', function () {
    post("/showmap", {"state": this.checked});
  });

  $("#pause").on('click', function () {
    post("/pause", {"state": this.checked});
  });

  $("#complete").on('click', function () {
    get("/complete");
    $("input.region").prop("checked", true);
  });

  $("#setMissionName").on('click', function () {
    var name = $("#missionName").val();
    post("/setMapTitle", {"title": name});
  });

  function post(url, data){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            if(data.message && data.message != "")
              $('.notifications').noty({text: data.message});
        }
    };
    if(data) xhr.send(JSON.stringify(data));
    else xhr.send();
  }

  function get(url, data){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            if(data.message && data.message != "")
              $('.notifications').noty({text: data.message});
            if(data.user_count) $("#users").html(data.user_count);
        } else {
          if(xhr.responseText)
          var data = JSON.parse(xhr.responseText);
          if(data.message && data.message != "")
            $('.notifications').noty({type: 'warning', text: data.message});
        }
    };
    if(data) xhr.send(JSON.stringify(data));
    else xhr.send();
  }

  socket.on('user:connected', function(data) {
    console.log('user:connected', data);
    // var request_id = localStorage.getItem("request_id") || data.id;
    // localStorage.setItem("request_id", request_id);
    socket.emit('user:joined', {"id": data.id, "role":"c-ops"});
  });

  socket.on('app:users', function(data) {
    console.log(data);
    $("#users").html(data.user_count);
  });

  socket.on('map:show', function(data) {
    console.log(data);
    $("#onoff").prop("checked", data.state);
  });

  socket.on('map:unlock', function(data) {
    console.log('map:unlock', data);
    if(data.sections) {
      console.log('map:unlock:sections', data.sections);
      data.sections.forEach(function(section) {
        $("#"+section).prop("checked", data.state);
      });
    } else {
      console.log('map:unlock:section', data.section);
      $("#"+data.section).prop("checked", data.state);
    }
  });

  get('/connected');
}

window.onload = function() {
  init();
};
