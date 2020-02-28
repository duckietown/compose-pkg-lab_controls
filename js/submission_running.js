/////Start containers on the Duckiebots
function start_duckiebot_container(next_function) {
  if (active_bots.length != 0) {
    add_loading('start_duckiebot_container');
    stop_duckiebots();

    let step_start_time = Date.now();
    ajax_list["start_active_containers"] = $.ajax({
      url: flask_url + ":" + flask_port + "/start_active_bots",
      data: JSON.stringify({ list: active_bots, container: current_submission_container, duration: 60 }),
      dataType: "json",
      type: "POST",
      contentType: 'application/json',
      header: {},
      success: function (result) {
        let not_started = false;
        delete ajax_list["start_active_containers"];
        result.container.forEach(function (entry, index) {
          if (entry != "Started evaluation") {
            not_started = true;
          }
        });

        let debug_string = "<table style='width:100%'><tr><td><b>Hostname</b></td><td><b>Active Container</b></td></tr>";
        result.hostname.forEach(function (entry, index) {
          debug_string += "<tr><td>" + entry + "</td><td>" + result.container[index] + "</td></tr>";
          logging_object.agent[entry].evaluation = result.container[index];
        });
        debug_string += "</table><br><br> ####################################### <br>"
        document.getElementById('debug_window').innerHTML += debug_string;
        document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

        let step_stop_time = Date.now();
        logging_object.steps.start_active_containers = {};
        logging_object.steps.start_active_containers.step_start_time = step_start_time;
        logging_object.steps.start_active_containers.step_stop_time = step_stop_time;
        logging_object.steps.start_active_containers.duration = (step_stop_time - step_start_time) / 1000;

        if (not_started) {
          add_failure('start_duckiebot_container');
          document.getElementById('start_duckiebot_container').onclick = function () { start_duckiebot_container(next_function); };
        } else {

          next_function(start_logging);
        }
      },
    });
  } else {
    //If no active bots wanted, i.e. standard DEMO started from the interface
    add_success('start_duckiebot_container');

    let emergency = new ROSLIB.Message({
      data: true
    });
    submission_bots.forEach(function (entry) {
      if (!(entry in pub_emergency_stop)) {
        pub_emergency_stop[entry] = new ROSLIB.Topic({
          ros: window.ros['local'],
          name: '/' + entry + '/toggleEmergencyStop',
          messageType: 'std_msgs/Bool',
          queue_size: 1,
        });
      }
      pub_emergency_stop[entry].publish(emergency)
    });

    next_function(start_logging);
  }
}

/////Wait for active bots

/////Wait until all passive bots are ready to move
function wait_for_active_bots(next_function) {
  if (ROS_connected) {
    active_bots.forEach(function (entry) {
      if (!(entry in sub_ready_to_move)) {
        sub_ready_to_move[entry] = new ROSLIB.Topic({
          ros: window.ros['local'],
          name: '/' + entry + '/ready_to_start',
          messageType: 'std_msgs/Bool',
          queue_size: 1,
        });
      }
      i_am_ready[entry] = false
      sub_ready_to_move[entry].subscribe(function (message) {
        if (message.data) {
          if (i_am_ready[entry] == false) {
            let debug_string = entry + " ready to move<br><br> ####################################### <br>"
            document.getElementById('debug_window').innerHTML += debug_string;
            document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;
            logging_object.agent[entry].ready_to_move = true;
          }
          i_am_ready[entry] = true;
        }
        let ready = true;
        active_bots.forEach(function (bot) {
          if (!i_am_ready[bot]) {
            ready = false;
          }
        });
        if (ready) {
          let debug_string = "All active bots ready to move, evaluation can be started<br><br> ####################################### <br>"
          document.getElementById('debug_window').innerHTML += debug_string;
          document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;
          add_success('start_duckiebot_container');
          next_function(start_duckiebots);

          active_bots.forEach(function (bot) {
            sub_ready_to_move[bot].unsubscribe();
          });
        }
      });
    });
  }
}


/////Start the logging containers
function start_logging(next_function) {
  add_loading('start_logging');

  let emergency = new ROSLIB.Message({
    data: true
  });
  submission_bots.forEach(function (entry) {
    if (!(entry in pub_emergency_stop)) {
      pub_emergency_stop[entry] = new ROSLIB.Topic({
        ros: window.ros['local'],
        name: '/' + entry + '/toggleEmergencyStop',
        messageType: 'std_msgs/Bool',
        queue_size: 1,
      });
    }
    pub_emergency_stop[entry].publish(emergency)
  });

  let step_start_time = Date.now();
  let time = new Date();
  let time_stamp = time.getFullYear().toString() + (time.getMonth() + 1).toString().padStart(2, '0') + time.getDate().toString().padStart(2, '0') + "_" + time.getHours().toString().padStart(2, '0') + time.getMinutes().toString().padStart(2, '0') + time.getSeconds().toString().padStart(2, '0');
  logging_bag_name = "raw";
  // logging_bag_mount = "/home/" + logging_server_username + "/AIDO3_experiment_data/submission_" + logging_object.job.submission_id + "/" + logging_object.job.step_name + "/" + time_stamp + "/data";
  logging_bag_mount = "/home/{0}/AIDO3_experiment_data/submission_{1}/{2}/{3}/data".format(
    logging_server_username,
    logging_object.job.submission_id,
    logging_object.job.step_name,
    time_stamp
  );
  let debug_string = "";
  debug_string += "</table><br><br>  <br>" + logging_bag_mount + "<br>"
  document.getElementById('debug_window').innerHTML += debug_string;
  ajax_list["start_logging"] = $.ajax({
    url: flask_url + ":" + flask_port + "/start_logging",
    data: JSON.stringify({
      device_list: agent_list,
      // computer: logging_server_hostname,
      filename: logging_bag_name,
      mount_folder: logging_bag_mount + "/logs_raw"
    }),
    dataType: "json",
    type: "POST",
    contentType: 'application/json',
    header: {},
    success: function (result) {
      delete ajax_list["start_logging"];
      let logging_started = true;
      let step_stop_time = Date.now();

      let debug_string = "";
      if (result.outcome == "Success") {
        debug_string = "Logging started";
        logging_object.steps.start_logging = {};
        logging_object.steps.start_logging.step_start_time = step_start_time;
        logging_object.steps.start_logging.step_stop_time = step_stop_time;
        logging_object.steps.start_logging.duration = (step_stop_time - step_start_time) / 1000;
      } else {
        logging_started = false;
        debug_string = "Not able to start logging!" + result.outcome;
      }
      debug_string += "</table><br><br> ####################################### <br>"
      document.getElementById('debug_window').innerHTML += debug_string;
      document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

      if (!logging_started) {
        add_failure('start_logging');
        document.getElementById('start_logging').onclick = function () { start_logging(next_function); };
      } else {
        add_success('start_logging');
        wait(6000);
        for (i = 0; i < agent_list.length; i++) {


          publisher_request_image = new ROSLIB.Topic({
            ros: window.ros['local'],
            name: '/' + agent_list[i] + '/requestImage',
            messageType: 'std_msgs/Bool',
            queue_size: 1,
          });

          let stream = document.getElementById('raspi_stream');
          let get_image = new ROSLIB.Message({
            data: true
          });
          publisher_request_image.publish(get_image)
        }
        next_function();
      }
    },
  });
}

/////Enable Duckiebot movement again
function start_duckiebots() {
  add_loading('duckiebot_start');
  if (ROS_connected) {
    // TODO: what is this wait for?
    wait(1000);
    let dt = new Date();
    start_timestamp = dt.getTime();

    let debug_string = "Evaluation started with timestamp: " + start_timestamp + "<br><br> ####################################### <br>"
    document.getElementById('debug_window').innerHTML += debug_string;
    document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

    let emergency = new ROSLIB.Message({
      data: false
    });
    submission_bots.forEach(function (entry) {
      if (!(entry in pub_emergency_stop)) {
        pub_emergency_stop[entry] = new ROSLIB.Topic({
          ros: window.ros['local'],
          name: '/' + entry + '/toggleEmergencyStop',
          messageType: 'std_msgs/Bool',
          queue_size: 1,
        });
      }
      pub_emergency_stop[entry].publish(emergency)
    });
    add_success('duckiebot_start');

    debug_string = "<table style='width:100%'><tr><td><b>Hostname</b></td><td><b>Emergency stop</b></td></tr>";
    submission_bots.forEach(function (entry) {
      debug_string += "<tr><td>" + entry + "</td><td>Emergency stop released</td></tr>";
    });
    debug_string += "</table><br><br> ####################################### <br>"
    document.getElementById('debug_window').innerHTML += debug_string;
    document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;
  }
}

/////Subscribe to the first 4 submission Duckiebot cameras
function subscribe_cameras() {
  if (ROS_connected) {
    try {
      submission_bots.forEach(function (entry, index) {
        if (!(entry in sub_duckiebot_cameras)) {
          sub_duckiebot_cameras[entry] = new ROSLIB.Topic({
            ros: window.ros['local'],
            name: '/' + entry + '/imageSparse/compressed',
            messageType: 'sensor_msgs/CompressedImage',
            queue_size: 1,
          });
        }
        let stream = document.getElementById('submission_bot_stream' + index);
        document.getElementById('submission_bot_title' + index).innerHTML = entry;
        sub_duckiebot_cameras[entry].subscribe(function (message) {
          stream.src = "data:image/jpeg;charset=utf-8;base64," + message.data;
        });
        if (index == 3) {
          throw Exception
        }
      });
    } catch { }
  }
}

/////When exiting, unsubscribe from all cameras
function unsubscribe_cameras() {
  try {
    submission_bots.forEach(function (entry, index) {
      sub_duckiebot_cameras[entry].unsubscribe();
      if (index == 3) {
        throw Exception
      }
    });
  } catch { }
  document.getElementById('submission_bot_stream0').src = "";
  document.getElementById('submission_bot_stream1').src = "";
  document.getElementById('submission_bot_stream2').src = "";
  document.getElementById('submission_bot_stream3').src = "";
  document.getElementById('submission_bot_title0').innerHTML = "";
  document.getElementById('submission_bot_title1').innerHTML = "";
  document.getElementById('submission_bot_title2').innerHTML = "";
  document.getElementById('submission_bot_title3').innerHTML = "";
}
