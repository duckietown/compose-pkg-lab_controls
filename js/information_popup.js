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
