/////Update camera image at an interval of 1 sec
  setInterval(function() {
    let stream = document.getElementById('stream');
    stream.src = 'http://'+ip_addr_cam+':'+cam_port+'/cgi-bin/CGIProxy.fcgi?cmd=snapPicture2&usr='+cam_usr+'&pwd='+cam_pw+'&rdn='+Math.random();
  }, 200);

/////Create subscribers to highlight movement in the city
  let sub_interval=null;
  sub_interval = setInterval(function() {
    if (ROS_connected){
      clearInterval(sub_interval);
      let subs = {};
      let ancestor = document.getElementById('duckie_list_body'), descendents = ancestor.children;
      for(let i=0; i<descendents.length; i++){
        let name=descendents[i].cells[0].innerHTML;
        if (name.substring(0,4)=="watc"){
          subs[name]  = new ROSLIB.Topic({
            ros : window.ros,
            name : '/'+name+'/maskNorm',
            messageType : 'std_msgs/Float32',
            queue_size : 1,
          });
          subs[name].subscribe(function(message) {
            let bot = document.getElementById("entity_"+name);
            if (parseFloat(message.data)>500){
              bot.style.width= "30px";
              bot.style.height= "30px";
              bot.style.backgroundColor= "LightSkyBlue";
            }else{
              bot.style.width= "18px";
              bot.style.height= "18px";
              bot.style.backgroundColor= document.getElementById('tab_'+name).style.backgroundColor;
            }
          });
        }
      }
    }
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

/////Worker for running tasks in the background
  let worker_lights = new Worker(lights_worker_file);
  //URL called by the worker
  let url = 'http://'+ip_addr+'/api/'+api_key+'/lights/';

  worker_lights.addEventListener('message', function(e) {
    openAlert(type='success', e.data);
  }, false);

/////Define variables
  //Bots are moving
  let bots_moving = false;
  //Array of bot positions (and movements, only temporary)
  let bots_positions = {};
  //Current Popup name
  let current_popup;
  //Previous highlighted entity
  let prev_name = "";
  //Location of changelog file
  //let changelog_file = 'https://raw.githubusercontent.com/duckietown/ETHZ-autolab-fleet-roster/aido2/changelog/default.yaml';
  let changelog_file="https://raw.githubusercontent.com/duckietown/ETHZ-autolab-fleet-roster/webeben_test/changelog/default.yaml";
  //Add pingable bots to map
  function start_bots(){
    detected_hosts.forEach(function(entry, index){
      add_bot(entry, index);
    });
  }
  let watchtower_pos={
    "watchtower01":[650,30],
    "watchtower02":[675,60],
    "watchtower03":[675,105],
    "watchtower04":[675,150],
    "watchtower05":[615,185],
    "watchtower06":[575,1],
    "watchtower07":[575,45],
    "watchtower08":[575,80],
    "watchtower09":[575,125],
    "watchtower10":[525,1],
    "watchtower11":[525,60],
    "watchtower12":[525,185],
    "watchtower13":[460,20],
    "watchtower14":[455,80],
    "watchtower15":[455,125],
    "watchtower16":[490,185],
    "watchtower21":[675,240],
    "watchtower22":[675,290],
    "watchtower23":[675,350],
    "watchtower24":[625,255],
    "watchtower25":[625,310],
    "watchtower26":[600,205],
    "watchtower27":[575,310],
    "watchtower28":[600,360],
    "watchtower29":[550,205],
    "watchtower30":[505,255],
    "watchtower31":[505,275],
    "watchtower32":[505,330],
    "watchtower33":[490,205],
    "watchtower34":[455,265],
    "watchtower35":[460,310],
    "watchtower41":[400,135],
    "watchtower42":[435,200],
    "watchtower43":[435,265],
    "watchtower44":[415,320],
    "watchtower45":[350,185],
    "watchtower46":[370,330],
    "watchtower47":[305,185],
    "watchtower48":[310,210],
    "watchtower49":[330,240],
    "watchtower50":[315,295],
    "watchtower51":[260,185],
    "watchtower52":[260,205],
    "watchtower53":[215,150],
    "watchtower54":[215,240],
  };

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
      let ancestor = document.getElementById('duckie_list_body'), descendents = ancestor.children;
      for(let i=0; i<descendents.length; i++){
        try{
          let name = descendents[i].cells[0].innerHTML;
          let bot = document.getElementById("entity_"+name);
          if (bots_positions[name][0] <= 0) {
            bots_positions[name][2] = 1;
          }
          if (bots_positions[name][0] >= canvas_height) {
            bots_positions[name][2] = -1;
          }
          if (bots_positions[name][1] <= 0) {
            bots_positions[name][3] = 1;
          }
          if (bots_positions[name][1] >= canvas_width) {
            bots_positions[name][3] = -1;
          }
          bots_positions[name][0]+=bots_positions[name][2];
          bots_positions[name][1]+=bots_positions[name][3];
          bot.style.top = bots_positions[name][0] + 'px';
          bot.style.left = bots_positions[name][1] + 'px';
        } catch{}
      }
      if (document.getElementById('info_content').style.display=="block"){
        document.getElementById('info_content').innerHTML="My name is: "+current_popup+"<br>My position is: "+bots_positions[current_popup];
      }
    }
  }
///// Add a new entity
  function add_bot(name, index){
    let new_div = document.createElement('div');
    new_div.id = "entity_"+name;
    if (name.substring(0,4)=="auto"){
      new_div.className="duckiebot";
      new_div.innerHTML=name.replace("autobot","");
    } else {
      new_div.className="watchtower";
      new_div.innerHTML=name.replace("watchtower","");
    }
    new_div.onclick= function() { highlightBot(name);
                                  document.getElementById('tab_'+name).scrollIntoView(true);};
    document.getElementById("bots").appendChild(new_div);
    if (new_div.className=="duckiebot"){
      bots_positions[name]=[Math.floor(Math.random()*300),Math.floor(Math.random()*300),1,1];
    } else {
      try{
        bots_positions[name]=[watchtower_pos[name][0],watchtower_pos[name][1],0,0];
      } catch {
        bots_positions[name]=[Math.floor(Math.random()*300),Math.floor(Math.random()*300),0,0];
      }
    }

    let table = document.getElementById("duckie_list_body");
    let row = table.insertRow();
    row.id = "tab_"+name;
    row.onclick=function() { highlightBot(name); };
    row.style.height = "30px";
    let cell0 = row.insertCell(0);
    let cell1 = row.insertCell(1);
    let cell2 = row.insertCell(2);
    cell0.innerHTML = name;
    cell2.onclick= function() { iconPop(name); };
    cell1.innerHTML = detected_pings[index]+" ms";
    cell2.innerHTML = "Open information window";
    if (bots_moving == false){
      bots_moving=true;
      move_bots();
    }
  }

///// Remove an entity
  function remove_bot(){
    try {
      let name=document.getElementById('toRemove').value;
      document.getElementById("entity_"+name).remove();
      document.getElementById("tab_"+name).remove();
      document.getElementById('toRemove').value="";
    }catch{
      openAlert(type='warning', 'Removing not possible, entity doesn\'t exist!');
    }
  }

/////Function to highlight different bots by clicking
  function highlightBot(name) {
    if (prev_name != name){
      document.getElementById('tab_'+name).style.backgroundColor="#ED9C27";
      document.getElementById('entity_'+name).style.backgroundColor="#ED9C27";
      document.getElementById('toRemove').value=name;
      try{
        document.getElementById('tab_'+prev_name).style.backgroundColor="";
        document.getElementById('entity_'+prev_name).style.backgroundColor="";
      }catch{}
    } else {
      if (document.getElementById('tab_'+name).style.backgroundColor=="rgb(237, 156, 39)"){
        document.getElementById('tab_'+name).style.backgroundColor="";
        document.getElementById('entity_'+name).style.backgroundColor="";
        document.getElementById('toRemove').value="";
      } else {
        document.getElementById('tab_'+name).style.backgroundColor="#ED9C27";
        document.getElementById('entity_'+name).style.backgroundColor="#ED9C27";
        document.getElementById('toRemove').value=name;
      }
    }
    prev_name=name;
  }

/////Function to show popup on click
  function iconPop(name){
      current_popup = name;
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
    document.getElementById('raspi_stream').src="";
    document.getElementById('info_content').style.display="none";
    document.getElementById('camera_content').style.display="block";
    document.getElementById('history_content').style.display="none";
    document.getElementById('info_tab').classList.remove('active');
    document.getElementById('camera_tab').classList.add('active');
    document.getElementById('history_tab').classList.remove('active');

    if (ROS_connected){
      subscriber_camera = new ROSLIB.Topic({
        ros : window.ros,
        name : '/'+current_popup+'/imageSparse/compressed',
        messageType : 'sensor_msgs/CompressedImage',
        queue_size : 1,
      });
      publisher_request_image = new ROSLIB.Topic({
        ros : window.ros,
        name : '/'+current_popup+'/requestImage',
        messageType : 'std_msgs/Bool',
        queue_size : 1,
      });

      let stream = document.getElementById('raspi_stream');
      let get_image = new ROSLIB.Message({
        data : true
      });
      publisher_request_image.publish(get_image)
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
        let bot_object=eval("changelog."+current_popup);
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
