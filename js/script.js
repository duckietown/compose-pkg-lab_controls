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
  //naming convention for bots (ETH standard: autobotXX)
  let bot_std_name = "autobot";
  //Location of changelog file
  //let changelog_file = 'https://raw.githubusercontent.com/duckietown/ETHZ-autolab-fleet-roster/aido2/changelog/default.yaml';
  let changelog_file="https://raw.githubusercontent.com/duckietown/ETHZ-autolab-fleet-roster/webeben_test/changelog/default.yaml";
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
      if(id<10){
        cell0.innerHTML = bot_std_name+"0"+id;
      } else {
        cell0.innerHTML = bot_std_name+id;
      }
    } else {
      if(name<10){
        cell0.innerHTML = bot_std_name+"0"+name;
      } else {
        cell0.innerHTML = bot_std_name+name;
      }
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
/////Tab control for popup,showing the Info tab
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
/////Tab control for popup,showing the Camera tab
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

/////Tab control for popup,showing the History tab
  function showHistory(){
    let table_config = document.getElementById("config_list_body");
    empty_body(table_config);

    let table_calib = document.getElementById("calib_list_body");
    empty_body(table_calib);

    let table_experiment = document.getElementById("experiment_list_body");
    empty_body(table_experiment);

    document.getElementById('info_content').style.display="none";
    document.getElementById('camera_content').style.display="none";
    document.getElementById('history_content').style.display="block";
    document.getElementById('info_tab').classList.remove('active');
    document.getElementById('camera_tab').classList.remove('active');
    document.getElementById('history_tab').classList.add('active');
    $.get(changelog_file, function(data) {
      let changelog = jsyaml.load(data);
      try{
        let bot_object=eval("changelog."+document.getElementById("tab_"+current_popup).cells[0].innerHTML);
        try{
          insert_body(bot_object.configuration,table_config);
        } catch {}
        try{
          insert_body(bot_object.calibration,table_calib);
        } catch {}
        try{
          insert_body(bot_object.experiment,table_experiment);
        } catch {}
      } catch {}
    });
    try{
      subscriber_camera.unsubscribe();
    } catch {}
  }

/////Function to empty table body
  function empty_body(table){
    while (table.firstChild) {
      table.removeChild(table.firstChild);
    }
  }

/////Insert content from object into table body
  function insert_body(content_object,table){
    for (const [date,content] of Object.entries(content_object)){
      let row = table.insertRow();
      row.style.height = "30px";
      let cell0 = row.insertCell(0);
      let cell1 = row.insertCell(1);
      cell0.innerHTML=date.replace("date_","").replace(/_/g,".");
      let description="";
      for (const entry of content){
        description=description+entry+"<br>";
      }
      cell1.innerHTML=description;
    }
  }

/////In progress: controlling smart power switches
  function toggle_switch(id){
   let url  = "http://192.168.1."+id+"/toggle";
   let xhr  = new XMLHttpRequest();
   xhr.open('GET', url, true);
   xhr.send(null);
  };
