/*global $:true */

function init() {
  $("input.region").on('click', function () {
    post("/setmap", {"section": $(this).val(), "state": this.checked})
  });
}

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
  xhr.send(JSON.stringify(data));
}

window.onload = function() {
  init();
};
