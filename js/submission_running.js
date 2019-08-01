/////Enable Duckiebot movement again
function start_duckiebots(){
    add_loading('duckiebot_start');
    if (ROS_connected){
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
        
        let debug_string = "<table style='width:100%'><tr><td><b>Hostname</b></td><td><b>Emergency stop</b></td></tr>";
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