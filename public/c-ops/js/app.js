/*global $:true */

function init() {
  $("#start").on('click', function () {
    get("/start");
  });

  $("#reset").on('click', function () {
    get("/reset");
  });

  $("input.region").on('click', function () {
    post("/setmap", {"section": $(this).val(), "state": this.checked});
  });

  $("#onoff").on('click', function () {
    post("/showmap", {"state": this.checked});
  });

  $("#complete").on('click', function () {
    get("/complete");
  });

  function post(url, data){
    $('.notifications').html('');
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            $('.notifications').html(data.message);
        }
    };
    if(data) xhr.send(JSON.stringify(data));
    else xhr.send();
  }

  function get(url, data){
    $('.notifications').html('');
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            $('.notifications').html(data.message);
        }
    };
    if(data) xhr.send(JSON.stringify(data));
    else xhr.send();
  }
}

window.onload = function() {
  init();
};
