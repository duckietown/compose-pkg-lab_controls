/////Start the logging containers
function start_logging(next_function){
    add_loading('start_logging');
    let step_start_time = Date.now();
    let time = new Date();
    let time_stamp = String(time.getFullYear())+String(time.getMonth()+1)+String(time.getDate())+"_"+String(time.getHours())+String(time.getMinutes())+String(time.getSeconds());
    logging_bag_name = "submission"+logging_object.job.submission_id+"_"+logging_object.job.step_name+"_"+time_stamp;
    logging_bag_mount = "/home/"+logging_server_username+"/AIDO3_experiment_data/submission"+logging_object.job.submission_id+"/"+logging_object.job.step_name;
    ajax_list["start_logging"]=$.ajax({
      url: flask_url+":"+flask_port+"/start_logging",
      data: JSON.stringify({device_list:agent_list, "computer":logging_server_hostname, "filename":logging_bag_name, "mount_folder":logging_bag_mount}),
      dataType: "json",
      type: "POST",
      contentType: 'application/json',
      header: {},
      success: function(result) {
         delete ajax_list["start_logging"];
         let logging_started = true;
         let step_stop_time = Date.now();
   
         let debug_string="";
         if (result.outcome=="Success"){
           debug_string = "Logging started";
           logging_object.steps.start_logging = {};
           logging_object.steps.start_logging.step_start_time = step_start_time;
           logging_object.steps.start_logging.step_stop_time = step_stop_time;
           logging_object.steps.start_logging.duration = (step_stop_time-step_start_time)/1000;
         } else {
           logging_started = false;
           debug_string = "Not able to start logging!";
         }
   
         document.getElementById('debug_window').innerHTML += debug_string;
         document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;
   
        if (!logging_started){
          add_failure('start_logging');
          document.getElementById('start_logging').onclick=function(){start_logging(next_function);};
        } else {
          add_success('start_logging');
          wait(3000);
          next_function();
        }
      },
    });
   }

/////Enable Duckiebot movement again
function start_duckiebots(){
    add_loading('duckiebot_start');
    if (ROS_connected){

        let dt = new Date();
        start_timestamp = dt.getTime();

        let debug_string="Evaluation started with timestamp: "+start_timestamp+"<br><br> ####################################### <br>"
        document.getElementById('debug_window').innerHTML += debug_string;
        document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

        let emergency = new ROSLIB.Message({
            data : false
        });
        submission_bots.forEach(function(entry){
            if (!(entry in pub_emergency_stop)){
                pub_emergency_stop[entry] = new ROSLIB.Topic({
                    ros : window.ros,
                    name : '/'+entry+'/toggleEmergencyStop',
                    messageType : 'std_msgs/Bool',
                    queue_size : 1,
                });
            }
            pub_emergency_stop[entry].publish(emergency)
        });
        add_success('duckiebot_start');
        
        debug_string = "<table style='width:100%'><tr><td><b>Hostname</b></td><td><b>Emergency stop</b></td></tr>";
        submission_bots.forEach(function(entry){
            debug_string+="<tr><td>"+entry+"</td><td>Emergency stop released</td></tr>";
        });
        debug_string+="</table><br><br> ####################################### <br>"
        document.getElementById('debug_window').innerHTML += debug_string;
        document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;
    }
  }

/////Subscribe to the first 4 submission Duckiebot cameras
function subscribe_cameras(){
    if (ROS_connected){
        try {
            submission_bots.forEach(function(entry, index){
                if (!(entry in sub_duckiebot_cameras)){
                    sub_duckiebot_cameras[entry] = new ROSLIB.Topic({
                        ros : window.ros,
                        name : '/'+entry+'/imageSparse/compressed',
                        messageType : 'sensor_msgs/CompressedImage',
                        queue_size : 1,
                    });
                }
                let stream = document.getElementById('submission_bot_stream'+index);
                document.getElementById('submission_bot_title'+index).innerHTML=entry;
                sub_duckiebot_cameras[entry].subscribe(function(message) {
                    stream.src = "data:image/jpeg;charset=utf-8;base64,"+message.data;
                });
                if (index == 3){
                    throw Exception
                }
            });
        } catch {}
    }
}

/////When exiting, unsubscribe from all cameras
function unsubscribe_cameras(){
    try {
        submission_bots.forEach(function(entry, index){
            sub_duckiebot_cameras[entry].unsubscribe();
            if (index == 3){
                throw Exception
            }
        });
    } catch {}
    document.getElementById('submission_bot_stream0').src="";
    document.getElementById('submission_bot_stream1').src="";
    document.getElementById('submission_bot_stream2').src="";
    document.getElementById('submission_bot_stream3').src="";
    document.getElementById('submission_bot_title0').innerHTML="";
    document.getElementById('submission_bot_title1').innerHTML="";
    document.getElementById('submission_bot_title2').innerHTML="";
    document.getElementById('submission_bot_title3').innerHTML="";
}