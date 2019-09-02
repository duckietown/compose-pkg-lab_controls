/////Update camera image at an interval of 0.2 sec
ip_cam_subscriber_interval = setInterval(function() {
    // let stream = document.getElementById('stream');
    // //let cam_src = 'http://'+current_ip_cam+':'+cam_port+'/cgi-bin/CGIProxy.fcgi?cmd=snapPicture2&usr='+cam_usr+'&pwd='+cam_pw+'&rdn='+Math.random();
    // let cam_src = 'http://'+current_ip_cam+'/snap.jpeg/&rdn='+Math.random();
    // if (document.getElementById('submissionPopup').style.display!="block" && document.getElementById('docker_maintenance').style.display!="block" && document.getElementById('duckiepopup').style.display!="block"){
    //   stream.src = cam_src;
    //   stream.alt = "Camera at ip "+current_ip_cam+" not available";
    // }
    // if (document.getElementById('submission_step_4').style.display=="block"){
    //   document.getElementById('submission_ip_cam').src = cam_src;
    // }
    if (ROS_connected){
      clearInterval(ip_cam_subscriber_interval);
      let image_topic = new ROSLIB.Topic({
        ros : window.ros,
        name : '/rtsp_driver_node/image',
        messageType : 'sensor_msgs/CompressedImage',
        queue_size : 1,
      });
      image_topic.subscribe(function(message) {
        if (document.getElementById('submissionPopup').style.display!="block" && document.getElementById('docker_maintenance').style.display!="block" && document.getElementById('duckiepopup').style.display!="block"){
          let stream = document.getElementById('stream');
          stream.src = "data:image/jpeg;charset=utf-8;base64,"+message.data;
          stream.alt = "Camera at ip "+current_ip_cam+" not available";
        }
        if (document.getElementById('submission_step_4').style.display=="block"){
          document.getElementById('submission_ip_cam').src = "data:image/jpeg;charset=utf-8;base64,"+message.data;
        }
      });
    }
  }, 200);

/////Enlarge camera image
  function camera_size_toggle(){
    if (document.getElementById('stream').classList.contains('camera_click')){
      document.getElementById('stream').classList.remove('camera_click');
    } else {
      document.getElementById('stream').classList.add('camera_click');
    }
  }

/////Change between ip cameras
  function change_camera(cam_id){
    current_ip_cam = ip_addr_cam[cam_id];
    if (ROS_connected){
      let change_camera = new ROSLIB.Topic({
        ros : window.ros,
        name : '/rtsp_driver_node/camera_switch',
        messageType : 'std_msgs/String',
        queue_size : 1,
      });

      let new_camera = new ROSLIB.Message({
        data : "rtsp://"+current_ip_cam+":554/s0"
      });
      change_camera.publish(new_camera)
    }
  }
