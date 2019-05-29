/////Update camera image at an interval of 1 sec
  setInterval(function() {
    let stream = document.getElementById('stream');
    stream.src = 'http://'+ip_addr_cam+':'+cam_port+'/cgi-bin/CGIProxy.fcgi?cmd=snapPicture2&usr='+cam_usr+'&pwd='+cam_pw+'&rdn='+Math.random();
  }, 200);

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

/////Worker for running tasks in the background
  let worker_lights = new Worker(lights_worker_file);
  //URL called by the worker
  let url = 'http://'+ip_addr+'/api/'+api_key+'/lights/';

  worker_lights.addEventListener('message', function(e) {
    openAlert(type='success', e.data);
  }, false);

/////Define variables
  //Number of moving bots
  let number_bots = 0;
  //Bots are moving
  let bots_moving = false;
  //Array of bot positions (and movements, only temporary)
  let bots_positions = [];
  //Current Popup id
  let current_popup;
  //Previous highlighted id
  let prev_id = 0;
  //Add pingable bots to map
  function start_bots(){
    detected_duckiebots.forEach(function(entry){
      add_bot(entry);
    });
  }

/////Wait function
  // From http://www.endmemo.com/js/pause.php
  function wait(ms){
    var d = new Date();
    var d2 = null;
    do { d2 = new Date(); }
    while(d2-d < ms);
  }

  $.get('https://raw.githubusercontent.com/duckietown/Software/master19/catkin_ws/src/00-infrastructure/duckietown/config/baseline/fsm/fsm_node/default.yaml', function(data) {
      alert(data);
   });

/////Call Hue API (using workers)
  $('#on').submit(function(e){
    e.preventDefault();
    let command = JSON.stringify({on:true, bri:254, ct:153});
    worker_lights.postMessage({'url': url, 'light_nbr': light_nbr, 'command': command});

    slider_int.value=254;
    slider_col.value=153;
    output_int.innerHTML = 254;
    output_col.innerHTML = 153;
  });

  $('#off').submit(function(e){
    e.preventDefault();
    let command = JSON.stringify({on:false, bri:254, ct:153});
    worker_lights.postMessage({'url': url, 'light_nbr': light_nbr, 'command': command});

    slider_int.value=254;
    slider_col.value=153;
    output_int.innerHTML = 254;
    output_col.innerHTML = 153;
  });

  $('#change').submit(function(e){
    e.preventDefault();
    let command = JSON.stringify({on:true, bri:parseInt(intensity, 10), ct:parseInt(color, 10)});
    worker_lights.postMessage({'url': url, 'light_nbr': light_nbr, 'command': command});
  });

/////Moving bots on the map (temporary function until watchtowers give positions)
  function move_bots() {
    let map = document.getElementById("map");
    let canvas_height = map.clientHeight-18;
    let canvas_width = map.clientWidth-18;
    setInterval(exec_move, 10);
    function exec_move() {
      for(let i=0; i<number_bots; i++){
        try{
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
        } catch{}
      }
      if (document.getElementById('thepopup').style.display=="block"){
        document.getElementById('info_content').innerHTML="My ID is: "+current_popup+"<br>My position is: "+bots_positions[current_popup];
      }
    }
  }
///// Add a new entity
  function add_bot(name){
    let new_div = document.createElement('div');
    let id = number_bots;
    new_div.id = "bot_"+id;
    new_div.className="entity";
    if (name==null){
      new_div.innerHTML=id;
    } else {
      new_div.innerHTML=name;
    }
    new_div.onclick= function() { highlightBot(id);
                                  document.getElementById('tab_'+id).scrollIntoView(true);};
    document.getElementById("bots").appendChild(new_div);
    bots_positions.push([Math.floor(Math.random()*300),Math.floor(Math.random()*300),1,1]);
    let table = document.getElementById("duckie_list_body");
    let row = table.insertRow();
    row.id = "tab_"+id;
    row.onclick=function() { highlightBot(id); };
    row.style.height = "30px";
    let cell0 = row.insertCell(0);
    let cell1 = row.insertCell(1);
    let cell2 = row.insertCell(2);
    if (name==null){
      cell0.innerHTML = "Autobot"+id;
    } else {
      cell0.innerHTML = "Autobot"+name;
    }
    cell2.onclick= function() { iconPop(id); };
    cell1.innerHTML = "Active";
    cell2.innerHTML = "Open information window";

    number_bots++;
    if (bots_moving == false){
      bots_moving=true;
      move_bots();
    }
  }

///// Remove an entity
  function remove_bot(){
    try {
      let id=parseInt(document.getElementById('toRemove').value);
      document.getElementById("bot_"+id).remove();
      document.getElementById("tab_"+id).remove();
      document.getElementById('toRemove').value="";
    }catch{
      openAlert(type='warning', 'Removing not possible, entity doesn\'t exist!');
    }
  }

/////Function to highlight different bots by clicking
  function highlightBot(id) {
    if (prev_id != id){
      document.getElementById('tab_'+id).style.background="#ED9C27";
      document.getElementById('bot_'+id).style.background="#ED9C27";
      try{
        document.getElementById('tab_'+prev_id).style.background="#ffffff";
        document.getElementById('bot_'+prev_id).style.background="red";
      }catch{}
    } else {
      if (document.getElementById('tab_'+id).style.backgroundColor=="rgb(237, 156, 39)"){
        document.getElementById('tab_'+id).style.background="#ffffff";
        document.getElementById('bot_'+id).style.background="red";
      } else {
        document.getElementById('tab_'+id).style.background="#ED9C27";
        document.getElementById('bot_'+id).style.background="#ED9C27";
      }
    }
    prev_id=id;
    document.getElementById('toRemove').value=id;
  }

/////Function to show popup on click
  function iconPop(id){
      current_popup = id;
      document.getElementById('thepopup').style.display="block";
      document.getElementById('blackoutdiv').style.display="block";
      document.getElementById('info_content').style.display="block";
      document.getElementById('camera_content').style.display="none";
      document.getElementById('history_content').style.display="none";
  }
/////Function to hide popup on click
  function iconUnPop(){
      document.getElementById('thepopup').style.display="none";
      document.getElementById('blackoutdiv').style.display="none";
      document.getElementById('info_tab').classList.add('active');
      document.getElementById('camera_tab').classList.remove('active');
      document.getElementById('history_tab').classList.remove('active');
      try{
        subscriber_camera.unsubscribe();
      } catch {}
  }
/////Tab control for popup
  function showInfo(){
    document.getElementById('info_content').style.display="block";
    document.getElementById('camera_content').style.display="none";
    document.getElementById('history_content').style.display="none";
    document.getElementById('info_tab').classList.add('active');
    document.getElementById('camera_tab').classList.remove('active');
    document.getElementById('history_tab').classList.remove('active');
    try{
      subscriber_camera.unsubscribe();
    } catch {}
  }

  function showCamera(){
    document.getElementById('info_content').style.display="none";
    document.getElementById('camera_content').style.display="block";
    document.getElementById('history_content').style.display="none";
    document.getElementById('info_tab').classList.remove('active');
    document.getElementById('camera_tab').classList.add('active');
    document.getElementById('history_tab').classList.remove('active');

    if (ROS_connected){
      subscriber_camera = new ROSLIB.Topic({
        ros : window.ros,
        name : '/watchtower33/camera_node/image/compressed',
        messageType : 'sensor_msgs/CompressedImage',
        queue_size : 1,
      });
      let stream = document.getElementById('raspi_stream');
      subscriber_camera.subscribe(function(message) {
        stream.src = "data:image/jpeg;charset=utf-8;base64,"+message.data;
      });
    }
  }

  function showHistory(){
    document.getElementById('info_content').style.display="none";
    document.getElementById('camera_content').style.display="none";
    document.getElementById('history_content').style.display="block";
    document.getElementById('info_tab').classList.remove('active');
    document.getElementById('camera_tab').classList.remove('active');
    document.getElementById('history_tab').classList.add('active');
    try{
      subscriber_camera.unsubscribe();
    } catch {}
  }
/////In progress: controlling smart power switches
  function toggle_switch(id){
     let url  = "http://192.168.1."+id+"/toggle";
     let xhr  = new XMLHttpRequest();
     xhr.open('GET', url, true);
     xhr.send(null);
    };
