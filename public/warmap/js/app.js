/*global io:true, $:true */

function init() {
  var socket = io();
  var sections = ["F78", "H22", "A45", "Y63", "S74", "U20", "B52", "W41", "Q96", "G78"];
  var countries_state = [];

  $('.infobar-peace').toggle();

  socket.on('user:connected', function(data) {
    console.log('user:connected', data);
    // var request_id = localStorage.getItem("request_id") || data.id;
    // localStorage.setItem("request_id", request_id);
    socket.emit('user:joined', {"id": data.id, "role":"map"});
  });

  socket.on('app:start', function(data) {
    console.log('app:start', data);
    resetMap();
    for (var n=1; n<11; n++)
      setTimeout(function(n){ $('.partials #p'+n).addClass('glow'); }, Math.round(Math.random()*4000), n);
  });

  socket.on('app:reset', function(data) {
    console.log('app:reset', data);
    resetMap();
  });

  socket.on('map:show', function(data) {
    console.log('map:show', data);
    if(data.state) {
      showMap(true);
    } else {
      showMap(false);
    }
  });

  socket.on('map:unlock', function(data) {
    console.log('map:unlock', data);
    if(data.sections) {
      console.log('map:unlock:sections', data.sections);
      data.sections.forEach(function(section) {
        setSectionState(section, data.state);
      });
    } else {
      console.log('map:unlock:section', data.section);
      setSectionState(data.section, data.state);
    }
  });

  function setSectionState(section, state) {
    var index = sections.findIndex(function(code){
      return code == section;
    }) + 1;
    if (state)	{
      $('#p' + index).attr('src', '/img/blue-' + index + '.png');
      if(countries_state.length < 10) countries_state.push(1);
    } else {
      $('#p' + index).attr('src', './img/red-' + index + '.png');
      countries_state.pop();
    }

    var totalUnlocked = 0;
    if(countries_state.length) {
      totalUnlocked = countries_state.reduce(function(a, b) {
        return a + b;
      });
    }

    console.log(section, index, countries_state, totalUnlocked, state);

    if(totalUnlocked == 10) {
      $('.infobar-peace, .infobar-war').toggle(400);
      $('body').addClass('peace');
    } else {
      $('body').removeClass('peace');
    }
  }

  function resetMap() {
    sections.forEach(function(section) {
      setSectionState(section, false);
    });
  }

  function showMap(show) {
    if(show) {
      $('.disconnected').hide();
    } else {
      $('.disconnected').show();
    }
  }

  setInterval(function() {
  	// erratic
  	if (Math.round(Math.random())) {
  		// erase
  		if (Math.round(Math.random()*2) == 2)
        $('.main-wrapper #random-' + (Math.round(Math.random()) ?  'a' : 'b')).html("");
  		// erratic again
      var html = "<div class='snippet' style='left:" + (Math.random()*98) + "%; top:" + Math.round(100+Math.random()*920) + "px;'>" + Math.random().toString(36).substring(2, 12) + "</div>";
      console.log(html);
  		$('#random-' + (Math.round(Math.random()) ? 'a' : 'b')).append(html);
  	}
  }, 150);

  // showMap(true);
}

window.onload = function() {
  init();
};
