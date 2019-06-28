/////Update camera image at an interval of 1 sec
  setInterval(function() {
    let stream = document.getElementById('stream');
    stream.src = 'http://'+ip_addr_cam+':'+cam_port+'/cgi-bin/CGIProxy.fcgi?cmd=snapPicture2&usr='+cam_usr+'&pwd='+cam_pw+'&rdn='+Math.random();
  }, 200);

/////Create subscribers to highlight movement in the city
function subscriber_agents(){
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
      tf  = new ROSLIB.Topic({
        ros : window.ros,
        name : '/agent_poses',
        messageType : 'geometry_msgs/TransformStamped',
        queue_size : 1,
      });
      tf.subscribe(function(message) {
        try{
          if (message.child_frame_id.substring(0,4)=="duck"){
            tmp = parseInt(message.child_frame_id.replace('duckiebot_',''))-399;
            if (tmp<10){
              name = "autobot0"+tmp;
            } else {
              name = "autobot"+tmp;
            }
          }
          if (message.child_frame_id.substring(0,4)=="watc"){
            tmp = parseInt(message.child_frame_id.replace('watchtower_',''));
            if (tmp<10){
              name = "watchtower0"+tmp;
            } else {
              name = "watchtower"+tmp;
            }
          }
          bots_positions[name][0]=parseInt(680-message.transform.translation.y*100/58.5*35-9);
          bots_positions[name][1]=parseInt(message.transform.translation.x*100/58.5*35+14-9);
          bots_positions[name][2]=0;
          bots_positions[name][3]=0;
          let bot = document.getElementById("entity_"+name);
          bot.style.top = bots_positions[name][0] + 'px';
          bot.style.left = bots_positions[name][1] + 'px';
        } catch {}
        //alert(message.child_frame_id.toSource());
      });
    }
  }, 1000);
}

/////Flash evaluating button while evaluating
  setInterval(function() {
    if(submission_evaluating){
      let button = document.getElementById('submission_button');
      if (button.style.background==""){
        button.style.background="#ED9C27";
        button.style.color="white";
      } else {
        button.style.background="";
        button.style.color="";
      }
    }
  }, 500);

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
  //Currently selected submission id
  let selected_sub_id = "";
  //Flag for currently running submission
  let submission_evaluating = false;
  //Array of active bots
  let active_bots = [];
  //Array of passive bots
  let passive_bots = [];
  //Needed active bots
  let necessary_active_bots = -1;
  //Needed passive bots
  let necessary_passive_bots = -1;
  //Location of changelog file
  //let changelog_file = 'https://raw.githubusercontent.com/duckietown/ETHZ-autolab-fleet-roster/aido2/changelog/default.yaml';
  let changelog_file="https://raw.githubusercontent.com/duckietown/ETHZ-autolab-fleet-roster/webeben_test/changelog/default.yaml";
  //Detected pings
  let detected_pings = {};

/////Enlarge camera image
  function camera_size_toggle(){
    if (document.getElementById('stream').classList.contains('camera_click')){
      document.getElementById('stream').classList.remove('camera_click');
    } else {
      document.getElementById('stream').classList.add('camera_click');
    }
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
      let ancestor = document.getElementById('duckie_list_body'), descendents = ancestor.children;
      for(let i=0; i<descendents.length; i++){
        try{
          let name = descendents[i].cells[0].innerHTML;
          if (bots_positions[name][2] !=0){
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
          }
        } catch{}
      }
      if (document.getElementById('info_content').style.display=="block"){
        document.getElementById('info_content').innerHTML="My name is: "+current_popup+"<br>My position is: "+bots_positions[current_popup];
      }
    }
  }
///// Add a new entity
  function add_bot(name){
    let tmp = document.getElementById("tab_"+name);
    if (tmp){
      tmp.cells[1].innerHTML = detected_pings[name]+" ms";
    } else {
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
          new_div.style.top = bots_positions[name][0] + 'px';
          new_div.style.left = bots_positions[name][1] + 'px';
        } catch {
          bots_positions[name]=[Math.floor(Math.random()*300),Math.floor(Math.random()*300),0,0];
          new_div.style.top = bots_positions[name][0] + 'px';
          new_div.style.left = bots_positions[name][1] + 'px';
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
      cell2.onclick= function() { information_pop_up(name); };
      cell1.innerHTML = detected_pings[name]+" ms";
      cell2.innerHTML = "Open information window";
      if (bots_moving == false){
        bots_moving=true;
        move_bots();
      }
    }
  }

///// Remove an entity
  function remove_bot(name){
    document.getElementById("entity_"+name).remove();
    document.getElementById("tab_"+name).remove();
  }

/////Function to highlight different bots by clicking
  function highlightBot(name) {
    if (prev_name != name){
      document.getElementById('tab_'+name).style.backgroundColor="#ED9C27";
      document.getElementById('entity_'+name).style.backgroundColor="#ED9C27";
      try{
        document.getElementById('tab_'+prev_name).style.backgroundColor="";
        document.getElementById('entity_'+prev_name).style.backgroundColor="";
      }catch{}
    } else {
      if (document.getElementById('tab_'+name).style.backgroundColor=="rgb(237, 156, 39)"){
        document.getElementById('tab_'+name).style.backgroundColor="";
        document.getElementById('entity_'+name).style.backgroundColor="";
      } else {
        document.getElementById('tab_'+name).style.backgroundColor="#ED9C27";
        document.getElementById('entity_'+name).style.backgroundColor="#ED9C27";
      }
    }
    prev_name=name;
  }

/////Function to show popup on click
  function information_pop_up(name){
      current_popup = name;
      document.getElementById('duckiepopup').style.display="block";
      document.getElementById('blackoutdiv').style.display="block";
      document.getElementById('info_content').style.display="block";
      document.getElementById('camera_content').style.display="none";
      document.getElementById('history_content').style.display="none";
  }
/////Function to hide popup on click
  function close_information_window(){
      document.getElementById('duckiepopup').style.display="none";
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
          insert_changelog_body(bot_object.configuration,table_config);
        } catch {}
        try{
          insert_changelog_body(bot_object.calibration,table_calib);
        } catch {}
        try{
          insert_changelog_body(bot_object.experiment,table_experiment);
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
  function insert_changelog_body(content_object,table){
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

/////Alert before reloading (from https://stackoverflow.com/questions/7317273/warn-user-before-leaving-web-page-with-unsaved-changes)
  window.onload = function() {
      window.addEventListener("beforeunload", function (e) {
           if (!submission_evaluating) {
               return undefined;
           }

          var confirmationMessage = "This page is asking you to confirm that you want to leave - data you have entered may not be saved.";

          (e || window.event).returnValue = confirmationMessage; //Gecko + IE
          return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
      });
  };

/////Open submission popup
  function open_submission_popup(){10
    if (!submission_evaluating){
      initialize_submission_popup();
    }
    document.getElementById('submissionPopup').style.display="block";
    document.getElementById('submissionblackoutdiv').style.display="block";
  }

/////Initialize submission popup if no submission currently running
  function initialize_submission_popup(){
    let ancestor = document.getElementById('submission_steps'), descendents = ancestor.children;
    for(let i=1; i<=descendents.length; i++){
      document.getElementById('submission_step_'+i).style.display="none";
      document.getElementById('submission_tab_'+i).classList.remove('active');
    }
    document.getElementById('cancel_submission').style.display="none";
    document.getElementById('submission_step_1').style.display="block";
    document.getElementById('submission_tab_1').classList.add('active');
    document.getElementById('btn_start_job').disabled = true;
    let submission_table = document.getElementById("submission_table_body");
    //Fetch currently available submissions from server
    empty_body(submission_table);
    insert_submission_body(submission_table);
  }

/////Close submission popup
  function close_submission_popup(){
    document.getElementById('submissionPopup').style.display="none";
    document.getElementById('submissionblackoutdiv').style.display="none";
  }

/////Next submission Step (next tab in the popup)
  function next_submission_step(id){
    document.getElementById('submission_tab_'+id).classList.remove('active');
    document.getElementById('submission_tab_'+eval(id+1)).classList.add('active');
    document.getElementById('submission_step_'+id).style.display="none";
    document.getElementById('submission_step_'+eval(id+1)).style.display="block";
    //Actual submission evaluation starts here
    if (id==1){
      document.getElementById('submission_button').innerHTML="Currently evaluating";
      document.getElementById('cancel_submission').style.display="inline";
      submission_evaluating = true;
      let duckiebot_selection = document.getElementById("duckiebot_selection_body");
      necessary_active_bots = 0;
      necessary_passive_bots = 0;
      let html_necessary_bots = document.getElementById("necessary_bots");
      html_necessary_bots.innerHTML="Active bots needed: "+necessary_active_bots+" Passive bots needed: "+necessary_passive_bots;
      empty_body(duckiebot_selection);
      insert_duckiebot_selection_body(duckiebot_selection);
      if (active_bots.length==necessary_active_bots && passive_bots.length==necessary_passive_bots){
        document.getElementById('btn_bots_selected').disabled = false;
      } else {
        document.getElementById('btn_bots_selected').disabled = true;
      }
    }
    if (id==2){
      //Check and/or Reset Lights
      //Mount USB
      //Check free memory
      //Start logging containers
      //Check logging started
      //Start containers on duckiebots (in parallel with logging containers)
      //Check containers on duckiebots are ready
    }
    if (id==3){
      //Get Timestamp for log_start
      //Start duckiebots
    }
    if (id==4){
      //Get Timestamp for log_stop
      //Stop logging
      //Stop duckiebots
      //Kill and remove duckiebot containers (only active)
      //Copy bags
      //Validate bags
      //Clear memory of agents
    }
    if (id==5){
      //Upload bags to ipfs and finish job
    }
  }

/////Finish job
  function finish_job(status){
    reset_submission_view();
    if (status){
      openAlert(type='danger', 'Submission Nr. '+selected_sub_id+' failed with exit code '+status);
    } else {
      openAlert(type='success', 'Submission Nr. '+selected_sub_id+' successfully finished');
    }
  }

/////Cancel job
  function cancel_job(){
    reset_submission_view();
    openAlert(type='warning', 'Submission Nr. '+selected_sub_id+' canceled by the operator');
  }

/////Reset submission view after canceling or finishing
  function reset_submission_view(){
    document.getElementById('submissionPopup').style.display="none";
    document.getElementById('submissionblackoutdiv').style.display="none";
    document.getElementById('submission_button').innerHTML="Evaluate submission";
    document.getElementById('submission_button').style.background="";
    document.getElementById('submission_button').style.color="";
    submission_evaluating = false;
    document.getElementById('btn_start_job').disabled = true;
    document.getElementById('btn_bots_selected').disabled = true;
    document.getElementById('btn_submission_ready_to_start').disabled = true;
    document.getElementById('btn_submission_finished').disabled = true;
    document.getElementById('btn_upload_data_ipfs').disabled = true;
    document.getElementById('btn_finish_job').disabled = true;
    necessary_active_bots = -1;
    necessary_passive_bots = -1;
  }

/////Highlight submission from list
  function highlight_submission(id){
    if(selected_sub_id!==""){
      document.getElementById(selected_sub_id).style.backgroundColor="";
    }
    document.getElementById(id).style.backgroundColor="#ED9C27";
    document.getElementById('btn_start_job').disabled = false;
    selected_sub_id=id;
  }

/////Insert currently available submissions into submission table body
  function insert_submission_body(table){
    //Temporary until submissions can be fetched from server
    for(let i=0; i<20; i++){
      let row = table.insertRow();
      row.id=i;
      row.onclick= function() { highlight_submission(i);};
      row.style.height = "30px";
      let cell0 = row.insertCell(0);
      let cell1 = row.insertCell(1);
      cell0.innerHTML=i
      cell1.innerHTML="Test"+i;
    }
    call_server(table)
  }

/////Call server test Function, when working insert into insert_submission_body
  function call_server(table){
    $.ajax({
      url: "https://challenges.duckietown.org/v4/api/submissions-list",
      data: {},
      type: "GET",
      headers:{'X-Messaging-Token': dt_token},
      success: function(result) {
        //alert(result.toSource());
        result.result.forEach(function (i) {
          let row = table.insertRow();
          row.id=i;
          row.onclick= function() { highlight_submission(i);};
          row.style.height = "30px";
          let cell0 = row.insertCell(0);
          let cell1 = row.insertCell(1);
          cell0.innerHTML=i;
          cell1.innerHTML="Test"+i;
        });
      },
    });
  }

/////Insert currently available/pingeable duckiebots into body
  function insert_duckiebot_selection_body(table){
    active_bots=[];
    passive_bots=[];
    let ancestor = document.getElementById('duckie_list_body'), descendents = ancestor.children;
    for(let i=0; i<descendents.length; i++){
      let name=descendents[i].cells[0].innerHTML;
      if (name.substring(0,4)=="auto"){
        let row = table.insertRow();
        row.id="select_"+name;
        row.style.height = "30px";
        let cell0 = row.insertCell(0);
        let cell1 = row.insertCell(1);
        let cell2 = row.insertCell(2);
        let checkbox1 = document.createElement("INPUT");
        checkbox1.type = "checkbox";
        checkbox1.id = "active_"+name;
        checkbox1.name = name;
        let checkbox2 = document.createElement("INPUT");
        checkbox2.type = "checkbox";
        checkbox2.id = "passive_"+name;
        checkbox2.name = name;
        cell0.innerHTML = name;
        cell1.appendChild(checkbox1);
        checkbox1.onchange = function() {select_for_evaluation(this);};
        cell2.appendChild(checkbox2);
        checkbox2.onchange = function() {select_for_evaluation(this);};
      }
    }
  }

/////Select duckiebots for evaluation
  function select_for_evaluation(bot){
    let active = false;
    let checked = false;
    if (bot.id.substring(0,6)=="active"){
      active = true;
    }
    if (bot.checked){
      checked = true;
    }
    let active_box = document.getElementById('active_'+bot.name);
    let passive_box = document.getElementById('passive_'+bot.name);
    if (checked){
      if (active){
        passive_box.checked = false;
        active_bots.push(bot.name);
        let index = passive_bots.indexOf(bot.name);
        if (index>=0){
          passive_bots.splice(index,1);
        }
      } else {
        active_box.checked = false;
        passive_bots.push(bot.name);
        let index = active_bots.indexOf(bot.name);
        if (index>=0){
          active_bots.splice(index,1);
        }
      }
    } else {
      if (active){
        let index = active_bots.indexOf(bot.name);
        if (index>=0){
          active_bots.splice(index,1);
        }
      } else {
        let index = passive_bots.indexOf(bot.name);
        if (index>=0){
          passive_bots.splice(index,1);
        }
      }
    }
    active_bots.sort();
    passive_bots.sort();
    if (active_bots.length==necessary_active_bots && passive_bots.length==necessary_passive_bots){
      document.getElementById('btn_bots_selected').disabled = false;
    } else {
      document.getElementById('btn_bots_selected').disabled = true;
    }
  }

/////Ping hosts via Flex server and update the list and map
  function ping_bots(){
    document.getElementById('ping_message').style.display="block";

    $.ajax({
      url: "http://duckietown20.local:5000/ping",
      data: {},
      type: "GET",
      header: {},
      success: function(result) {
        let missing_hosts = [];
        result.hostname.forEach(function(entry, index){
          detected_pings[entry]=result.ping[index];
          if (detected_pings[entry] != 0){
            add_bot(entry);
          } else {
            try{
              remove_bot(entry);
              missing_hosts.push(entry);
            } catch {}
          }
        });
        if (missing_hosts.length!=0){
          openAlert(type='danger', 'The following hosts are no longer reachable: '+missing_hosts);
        }
        document.getElementById('ping_message').style.display="none";
        subscriber_agents();
      },
    });
  }

  function test_api(table){
    $.ajax({
      url: "https://challenges.duckietown.org/v4/api/submissions",
      data: {},
      type: "GET",
      headers:{'X-Messaging-Token': dt_token},
      success: function(result) {
        alert(result.toSource());
      },
    });
  }
