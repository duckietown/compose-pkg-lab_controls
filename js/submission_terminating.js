/////Function to stop logging
function stop_logging(next_function) {
  //Animation might not be loaded when used to cancel job
  try {
    add_loading('stop_logging');
  } catch { }
  let step_start_time = Date.now();
  ajax_list["stop_logging"] = $.ajax({
    url: flask_url + ":" + flask_port + "/stop_logging",
    data: JSON.stringify({ "computer": logging_server_hostname }),
    dataType: "json",
    type: "POST",
    contentType: 'application/json',
    header: {},
    success: function (result) {
      delete ajax_list["stop_logging"];
      if (next_function === undefined) {
        //Executed when canceling the job
      } else {
        let logging_stopped = true;
        let debug_string = ""
        if (result.outcome == "Success") {
          debug_string = "Stopped logging successfully";
        } else {
          debug_string = "Error while stopping the logger";
          logging_stopped = false;
        }
        debug_string += "<br><br> ####################################### <br>"
        document.getElementById('debug_window').innerHTML += debug_string;
        document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

        let step_stop_time = Date.now();
        logging_object.steps.stop_logging = {};
        logging_object.steps.stop_logging.step_start_time = step_start_time;
        logging_object.steps.stop_logging.step_stop_time = step_stop_time;
        logging_object.steps.stop_logging.duration = (step_stop_time - step_start_time) / 1000;

        if (!logging_stopped) {
          add_failure('stop_logging');
          document.getElementById('stop_logging').onclick = function () {
            add_loading('stop_logging');
            stop_logging(process_bags);
          };
        } else {
          add_success('stop_logging');
          next_function(process_localization);
        }
      }
    },
  });
}

/////Stop the containers from duckiebots (active duckiebots should their container get removed)
function stop_duckiebot_containers() {
  if (passive_bots.length != 0) {
    add_loading('stop_duckiebot_containers');
    let step_start_time = Date.now();
    ajax_list["stop_duckiebot_containers"] = $.ajax({
      url: flask_url + ":" + flask_port + "/stop_passive_bots",
      data: JSON.stringify({ list: passive_bots, demo: current_demo }),
      dataType: "json",
      type: "POST",
      contentType: 'application/json',
      header: {},
      success: function (result) {
        let not_stopped = false;
        delete ajax_list["stop_duckiebot_containers"];
        result.container.forEach(function (entry, index) {
          if (entry != "Success") {
            not_stopped = true;
          }
        });

        let debug_string = "<table style='width:100%'><tr><td><b>Hostname</b></td><td><b>Demo stopped</b></td></tr>";
        result.hostname.forEach(function (entry, index) {
          debug_string += "<tr><td>" + entry + "</td><td>" + result.container[index] + "</td></tr>";
          logging_object.agent[entry].demo_stopped = result.container[index];
        });
        debug_string += "</table><br><br> ####################################### <br>"
        document.getElementById('debug_window').innerHTML += debug_string;
        document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

        let step_stop_time = Date.now();
        logging_object.steps.stop_passive_containers = {};
        logging_object.steps.stop_passive_containers.step_start_time = step_start_time;
        logging_object.steps.stop_passive_containers.step_stop_time = step_stop_time;
        logging_object.steps.stop_passive_containers.duration = (step_stop_time - step_start_time) / 1000;

        if (not_stopped) {
          add_failure('stop_duckiebot_containers');
          document.getElementById('stop_duckiebot_containers').onclick = function () { stop_duckiebot_containers(); };
        } else {
          add_success('stop_duckiebot_containers');
        }
      },
    });
  } else {
    add_success('stop_duckiebot_containers');
  }
}


/////Process the bags generated during the experiment
function process_bags(next_function) {
  add_loading('process_bags');
  wait(3000);
  let step_start_time = Date.now();
  ajax_list["process_bags"] = $.ajax({
    url: flask_url + ":" + flask_port + "/start_bag_processing",
    data: JSON.stringify({
      device_list: agent_list,
      input_bag_name: logging_bag_name,
      output_bag_name: "processed",
      mount_computer_side: logging_bag_mount + "/logs_raw",
      mount_container_side: "/data"
    }),
    dataType: "json",
    type: "POST",
    contentType: 'application/json',
    header: {},
    success: function (result) {
      delete ajax_list["process_bags"];
      let process_successfull = true;
      let debug_string = ""
      if (result.outcome == "Success") {
        debug_string = "Started experiment bag processing successfully";
      } else {
        debug_string = "Error while processing bag";
        process_successfull = false;
      }
      debug_string += "<br><br> ####################################### <br>"
      document.getElementById('debug_window').innerHTML += debug_string;
      document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

      logging_object.steps.process_bags = {};
      logging_object.steps.process_bags.step_start_time = step_start_time;

      if (!process_successfull) {
        add_failure('process_bags');
        document.getElementById('process_bags').onclick = function () {
          add_loading('process_bags');
          process_bags(next_function);
        };
      } else {
        check_process_interval = setInterval(function () {
          check_process_bags(next_function)
        }, 1000);
      }
    },
  });
}

/////Check progress of bag processing
function check_process_bags(next_function) {
  ajax_list["check_process_bags"] = $.ajax({
    url: flask_url + ":" + flask_port + "/check_bag_processing",
    data: JSON.stringify({ "output_bag_name": "processed", "mount_computer_origin": logging_bag_mount + "/logs_raw", "mount_computer_destination": logging_bag_mount + "/logs_processed" }),
    dataType: "json",
    type: "POST",
    contentType: 'application/json',
    header: {},
    success: function (result) {
      delete ajax_list["check_process_bags"];
      let process_successfull = true;
      if (result.outcome == "Success") {
        let debug_string = "Bag processing finished successfully";
        debug_string += "<br><br> ####################################### <br>"
        document.getElementById('debug_window').innerHTML += debug_string;
        document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;
      } else {
        process_successfull = false;
      }
      let step_stop_time = Date.now();
      if (!process_successfull) {
        let tmp_time = (step_stop_time - logging_object.steps.process_bags.step_start_time) / 1000;
        document.getElementById('process_bags_update').innerHTML = "Running for " + tmp_time + " seconds, getting status update from the server";
      } else {
        clearInterval(check_process_interval);
        add_success('process_bags');
        document.getElementById('process_bags_update').innerHTML = "";
        logging_object.steps.process_bags.step_stop_time = step_stop_time;
        logging_object.steps.process_bags.duration = (step_stop_time - logging_object.steps.process_bags.step_start_time) / 1000;
        next_function();
      }
    },
  });
}

/////Process the bags generated during the experiment
function process_localization() {
  add_loading('process_localization');
  let step_start_time = Date.now();
  ajax_list["process_localization"] = $.ajax({
    url: flask_url + ":" + flask_port + "/process_localization",
    data: JSON.stringify({ "input_bag_name": "processed", "output_dir": "/data", "mount_computer_side": logging_bag_mount + "/logs_processed", "mount_container_side": "/data" }),
    dataType: "json",
    type: "POST",
    contentType: 'application/json',
    header: {},
    success: function (result) {
      delete ajax_list["process_localization"];
      let process_successfull = true;
      let debug_string = ""
      if (result.outcome == "Success") {
        debug_string = "Localization started successfully";
      } else {
        debug_string = "Error while processing localization";
        process_successfull = false;
      }
      debug_string += "<br><br> ####################################### <br>"
      document.getElementById('debug_window').innerHTML += debug_string;
      document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

      logging_object.steps.localization = {};
      logging_object.steps.localization.step_start_time = step_start_time;

      if (!process_successfull) {
        add_failure('process_localization');
        document.getElementById('process_localization').onclick = function () {
          add_loading('process_localization');
          process_localization();
        };
      } else {
        check_localization_interval = setInterval(function () {
          check_localization()
        }, 1000);
      }
    },
  });
}

/////Check progress of bag processing
function check_localization() {
  ajax_list["check_localization"] = $.ajax({
    url: flask_url + ":" + flask_port + "/check_localization",
    data: JSON.stringify({ "active_bot": active_bots, "passive_bots": passive_bots, "origin_path": logging_bag_mount + "/logs_processed", "destination_path": logging_bag_mount + "/trajectories" }),
    dataType: "json",
    type: "POST",
    contentType: 'application/json',
    header: {},
    success: function (result) {
      delete ajax_list["check_localization"];
      let process_successfull = true;
      if (result.outcome == "Success") {
        let debug_string = "Localization finished successfully";
        debug_string += "<br><br> ####################################### <br>"
        document.getElementById('debug_window').innerHTML += debug_string;
        document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;
      } else {
        process_successfull = false;
      }
      let step_stop_time = Date.now();
      if (!process_successfull) {
        let tmp_time = (step_stop_time - logging_object.steps.localization.step_start_time) / 1000;
        document.getElementById('localization_update').innerHTML = "Running for " + tmp_time + " seconds, getting status update from the server";
      } else {
        clearInterval(check_localization_interval);
        add_success('process_localization');
        show_trajectory();
        document.getElementById('localization_update').innerHTML = "";
        logging_object.steps.localization.step_stop_time = step_stop_time;
        logging_object.steps.localization.duration = (step_stop_time - logging_object.steps.localization.step_start_time) / 1000;
      }
    },
  });
}
