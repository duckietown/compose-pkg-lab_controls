/////Update camera image at an interval of 1 sec
  setInterval(function() {
    let stream = document.getElementById('stream');
    stream.src = 'http://'+ip_addr_cam+':'+cam_port+'/cgi-bin/CGIProxy.fcgi?cmd=snapPicture2&usr='+cam_usr+'&pwd='+cam_pw+'&rdn='+Math.random();
  }, 1000);

/////Setting and reading slider positions
  //Adapted from https://www.w3schools.com/howto/howto_js_rangeslider.asp
  let slider_int = document.getElementById("intensity");
  let output_int = document.getElementById("intensity_out");
  let slider_col = document.getElementById("color");
  let output_col = document.getElementById("color_out");
  output_int.innerHTML = slider_int.value;
  output_col.innerHTML = slider_col.value;

  let color = slider_col.value;
  let intensity = slider_int.value;

  slider_int.oninput = function() {
    output_int.innerHTML = this.value;
    intensity = slider_int.value;
  }

  slider_col.oninput = function() {
    output_col.innerHTML = this.value;
    color = slider_col.value;
  }

/////Define variables
  //Number of moving bots
  let number_bots = 0;
  //Bots are moving
  let bots_moving = false;
  //Array of bot positions (and movements, only temporary)
  let bots_positions = [];

/////Wait function
  // From http://www.endmemo.com/js/pause.php
  function wait(ms){
    var d = new Date();
    var d2 = null;
    do { d2 = new Date(); }
    while(d2-d < ms);
  }

/////Call Hue API with ajax
  //adapted from https://stackoverflow.com/questions/48830933/ajax-put-request-to-phillips-hue-hub-local -->
  $('#on').submit(function(e){
    e.preventDefault();
    for(let i=1;i<light_nbr+1;i++){
      let url_name = 'http://'+ip_addr+'/api/'+api_key+'/lights/'+i+'/state';
      $.ajax({
        url: url_name,
        type:'PUT',
        data: JSON.stringify({on:true, bri:254, ct:153}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        failure: function(errMsg) {alert(errMsg);}
      });
      wait(100);
    }
    slider_int.value=254;
    slider_col.value=153;
    output_int.innerHTML = 254;
    output_col.innerHTML = 153;
    openAlert(type='success', 'All lights turned on!');
  });

  $('#off').submit(function(e){
    e.preventDefault();
    for(let i=1;i<light_nbr+1;i++){
      let url_name = 'http://'+ip_addr+'/api/'+api_key+'/lights/'+i+'/state';
      $.ajax({
        url: url_name,
        type:'PUT',
        data: JSON.stringify({on:false}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        failure: function(errMsg) {alert(errMsg);}
      });
      wait(100);
    }
    openAlert(type='success', 'All lights turned off!');
  });

  $('#change').submit(function(e){
    e.preventDefault();
    let api_data = {on:true, bri:parseInt(intensity, 10), ct:parseInt(color, 10)};
    for(let i=1;i<light_nbr+1;i++){
      let url_name = 'http://'+ip_addr+'/api/'+api_key+'/lights/'+i+'/state';
      $.ajax({
        url: url_name,
        type:'PUT',
        data: JSON.stringify(api_data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        failure: function(errMsg) {alert(errMsg);}
      });
      wait(100);
    }
    openAlert(type='success', 'Lights were changed!');
  });

/////Moving bots on the map (temporary function until watchtowers give positions)
  function move_bots() {
    let map = document.getElementById("map");
    let canvas_height = map.clientHeight-18;
    let canvas_width = map.clientWidth-18;
    setInterval(exec_move, 10);
    function exec_move() {
      for(let i=0; i<number_bots; i++){
        let bot = document.getElementById("bot_"+i);
        if (bots_positions[i][0] <= 0) {
          bots_positions[i][2] = 1;
        }
        if (bots_positions[i][0] >= canvas_height) {
          bots_positions[i][2] = -1;
        }
        if (bots_positions[i][1] <= 0) {
          bots_positions[i][3] = 1;
        }
        if (bots_positions[i][1] >= canvas_width) {
          bots_positions[i][3] = -1;
        }
        bots_positions[i][0]+=bots_positions[i][2];
        bots_positions[i][1]+=bots_positions[i][3];
        bot.style.top = bots_positions[i][0] + 'px';
        bot.style.left = bots_positions[i][1] + 'px';
      }
    }
  }

///// Onclick info of each entity
  function get_info(id){
    alert("My ID is: "+id+"\nMy position is: "+bots_positions[id]);
  }

///// Add a new entity
  function add_bot(){
    let new_div = document.createElement('div');
    let id = number_bots;
    new_div.id = "bot_"+id;
    new_div.className="entity";
    new_div.innerHTML=id;
    new_div.onclick= function() { get_info(id); };
    document.getElementById("bots").appendChild(new_div);
    bots_positions.push([0,0,1,1]);
    let table = document.getElementById("duckie_list_body");
    let row = table.insertRow();
    row.id = "tab_"+id;
    row.style.height = "30px";
    let cell0 = row.insertCell(0);
    let cell1 = row.insertCell(1);
    let cell2 = row.insertCell(2);
    cell0.innerHTML = id;
    cell1.innerHTML = "Active";
    cell2.innerHTML = "Test";

    number_bots++;
    if (bots_moving == false){
      bots_moving=true;
      move_bots();
    }
  }
