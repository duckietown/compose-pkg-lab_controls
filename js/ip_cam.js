/////Update camera image at an interval of 1 sec
  setInterval(function() {
    let stream = document.getElementById('stream');
    stream.src = 'http://'+ip_addr_cam+':'+cam_port+'/cgi-bin/CGIProxy.fcgi?cmd=snapPicture2&usr='+cam_usr+'&pwd='+cam_pw+'&rdn='+Math.random();
  }, 200);

/////Enlarge camera image
  function camera_size_toggle(){
    if (document.getElementById('stream').classList.contains('camera_click')){
      document.getElementById('stream').classList.remove('camera_click');
    } else {
      document.getElementById('stream').classList.add('camera_click');
    }
  }
