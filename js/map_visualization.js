/////Ping hosts via Flex server and update the list and map
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
          // TODO: better coordinate transform
          bots_positions[name][0]=parseInt(680-message.transform.translation.y*100/58.5*35-9);
          bots_positions[name][1]=parseInt(message.transform.translation.x*100/58.5*35+14-9);
          // bots_positions[name][2]=0;
          // bots_positions[name][3]=0;
          let bot = document.getElementById("entity_"+name);
          bot.style.top = bots_positions[name][0] + 'px';
          bot.style.left = bots_positions[name][1] + 'px';
        } catch {}
      });
    }
  }, 1000);
}
