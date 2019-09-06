/////Tool to change metric coordinates into pixel coordinates for the map
function transform_coordinates(y,x){
  let trafo_x = parseInt(680-y*100/58.5*35);
  let trafo_y = parseInt(x*100/58.5*35+9)
  return {x: trafo_x, y:trafo_y} 
}

/////Ping all hosts via Flex server and update the list and map
  function ping_bots(){
    document.getElementById('ping_message').style.display="block";
    document.getElementById('submission_button').disabled = true;
    $.ajax({
      url: flask_url+":"+flask_port+"/ping",
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
        document.getElementById('submission_button').disabled = false;
        subscriber_agents();
      },
    });
  }
  
/////Create subscribers to highlight (maskNorm) and track (tf) movement in the city
function subscriber_agents(){
  let sub_interval=null;
  sub_interval = setInterval(function() {
    if (ROS_connected){
      clearInterval(sub_interval);
      let subs = {};
      let light_subs = {};
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
              bot.style.backgroundColor= "LightSkyBlue";
            }else{
              bot.style.backgroundColor= document.getElementById('tab_'+name).style.backgroundColor;
            }
          });
          light_subs[name]  = new ROSLIB.Topic({
            ros : window.ros,
            name : '/'+name+'/current_lux',
            messageType : 'std_msgs/Int16',
            queue_size : 1,
          });
          light_subs[name].subscribe(function(message) {
            current_lux[name] = message.data;
            let opacity_value = message.data/200.0;
            if (opacity_value > 0.5){
              opacity_value = 0.5;
            }
            if (opacity_value < 0){
              opacity_value = 0;
            }
            document.getElementById("light_"+name).style.opacity = opacity_value;
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

          let pixel_coordinates = transform_coordinates(message.transform.translation.y, message.transform.translation.x);
          bots_positions[name][0]=pixel_coordinates.x-9;
          bots_positions[name][1]=pixel_coordinates.y-9;
          // bots_positions[name][2]=0;
          // bots_positions[name][3]=0;
          let bot = document.getElementById("entity_"+name);
          bot.style.top = bots_positions[name][0] + 'px';
          bot.style.left = bots_positions[name][1] + 'px';
          if (name.substring(0,4)=="watc"){
            let light = document.getElementById("light_"+name);
            light.style.top = eval(bots_positions[name][0]-6) + 'px';
            light.style.left = eval(bots_positions[name][1]-6) + 'px';
          }
        } catch {}
      });
    }
  }, 1000);
}

function show_trajectory(){
  // TODO change default variables
  $.ajax({
    url: flask_url+":"+flask_port+"/request_csv",
    data: JSON.stringify({mount: logging_bag_mount, duckiebot: "405"}),
    dataType: "json",
    type: "POST",
    contentType: 'application/json',
    header: {},
    success: function(result) {
      data = $.csv.toArrays(result.data);
      let c = document.getElementById("bot_visualization");
      let ctx = c.getContext("2d");
      ctx.globalCompositeOperation='destination-over';
      ctx.strokeStyle = "#b300b3";
      ctx.lineWidth = 3;
      let x = null;
      let y = null;
      let x_old = null;
      let y_old = null;
      let dist = 0;
      data.forEach(function(entry, index){
        if (index < 1) return;
        if (index > 1){
          x_old = x;
          y_old = y;
        }
        x = entry[1];
        y = entry[2];
        let trafo = transform_coordinates(y,x);
        if (index>1){
          dist += Math.sqrt(Math.pow((x-x_old),2)+Math.pow((y-y_old),2))
          ctx.lineTo(parseInt(trafo.y), parseInt(trafo.x));
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(parseInt(trafo.y), parseInt(trafo.x));
        }
      });
      openAlert(type='success', "Total distance driven by the Duckiebot: "+dist.toFixed(2)+" m");
    },
  });
}


///// Toggle light_map visualization
function toggle_light_sensors(){
  if(document.getElementById('light_map').style.display=="none"){
    document.getElementById('light_map').style.display="block";
    document.getElementById('light_sensor_toggle').style.color="yellow";
  } else {
    document.getElementById('light_map').style.display="none";
    document.getElementById('light_sensor_toggle').style.color="white";
  }
}