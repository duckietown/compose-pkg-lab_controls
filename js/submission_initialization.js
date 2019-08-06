/////Ping specific list
  function ping_list(next_function){
    add_loading('ping_agents');
    let step_start_time = Date.now();
    ajax_list["ping_list"]=$.ajax({
      url: flask_url+":"+flask_port+"/ping",
      data: JSON.stringify({list:agent_list}),
      dataType: "json",
      type: "POST",
      contentType: 'application/json',
      header: {},
      success: function(result) {
        delete ajax_list["ping_list"];
        let agent_not_reachable = false;
        result.ping.forEach(function(entry){
          if (entry == 0){
            agent_not_reachable = true;
          }
        });

        let debug_string = "<table style='width:100%'><tr><td><b>Hostname</b></td><td align='right'><b>Ping</b></td></tr>";
        result.hostname.forEach(function(entry, index){
          logging_object.agent[entry].ping = parseFloat(result.ping[index]);
          if (result.ping[index]==0){
            debug_string+="<tr><td>"+entry+"</td><td align='right'>Not reachable</td></tr>";
          } else {
            debug_string+="<tr><td>"+entry+"</td><td align='right'>"+result.ping[index]+" ms</td></tr>";
          }
        });
        debug_string+="</table><br><br> ####################################### <br>"
        document.getElementById('debug_window').innerHTML += debug_string;
        document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

        let step_stop_time = Date.now();
        logging_object.steps.ping = {};
        logging_object.steps.ping.step_start_time = step_start_time;
        logging_object.steps.ping.step_stop_time = step_stop_time;
        logging_object.steps.ping.duration = (step_stop_time-step_start_time)/1000;

        if (agent_not_reachable){
          add_failure('ping_agents');
          document.getElementById('ping_agents').onclick=function(){ping_list(next_function);};
        } else {
          add_success('ping_agents');
          next_function(memory_check);
        }
      },
    });
  }

/////Control lights for submission
  function reset_lights(){
    add_loading('check_lights');
    let step_start_time = Date.now();
    lights_on();
    let debug_string="Lights turned on<br><br> ####################################### <br>"
    document.getElementById('debug_window').innerHTML += debug_string;
    document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;
    add_success('check_lights');
    let step_stop_time = Date.now();
    logging_object.steps.lights = {};
    logging_object.steps.lights.step_start_time = step_start_time;
    logging_object.steps.lights.step_stop_time = step_stop_time;
    logging_object.steps.lights.duration = (step_stop_time-step_start_time)/1000;
  }

/////Mount drives
  function mount_drives(next_function){
    add_loading('mount_usb');
    let step_start_time = Date.now();
    ajax_list["mount_drives"]=$.ajax({
      url: flask_url+":"+flask_port+"/logging_checks",
      data: JSON.stringify({list:agent_list}),
      dataType: "json",
      type: "POST",
      contentType: 'application/json',
      header: {},
      success: function(result) {
        delete ajax_list["mount_drives"];
        let device_not_mountable = false;
        result.logging_check.forEach(function(entry){
          if (!(entry == "No USB Device" || entry == "Writable USB")){
            device_not_mountable = true;
          }
        });

        let debug_string = "<table style='width:100%'><tr><td><b>Hostname</b></td><td><b>USB device</b></td></tr>";
        result.hostname.forEach(function(entry, index){
            debug_string+="<tr><td>"+entry+"</td><td>"+result.logging_check[index]+"</td></tr>";
            logging_object.agent[entry].drive_mount = result.logging_check[index];
        });
        debug_string+="</table><br><br> ####################################### <br>"
        document.getElementById('debug_window').innerHTML += debug_string;
        document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

        let step_stop_time = Date.now();
        logging_object.steps.mount_drives = {};
        logging_object.steps.mount_drives.step_start_time = step_start_time;
        logging_object.steps.mount_drives.step_stop_time = step_stop_time;
        logging_object.steps.mount_drives.duration = (step_stop_time-step_start_time)/1000;

        if (device_not_mountable){
          add_failure('mount_usb');
          document.getElementById('mount_usb').onclick=function(){mount_drives(next_function);};
        } else {
          add_success('mount_usb');
          next_function(restart_duckiebot_interface);
        }
      },
    });
  }

/////Check available memory
  function memory_check(next_function){
    add_loading('memory_check');
    let step_start_time = Date.now();
    ajax_list["memory_check"]=$.ajax({
      url: flask_url+":"+flask_port+"/storage_space_checks",
      data: JSON.stringify({list:agent_list}),
      dataType: "json",
      type: "POST",
      contentType: 'application/json',
      header: {},
      success: function(result) {
        delete ajax_list["memory_check"];
        let not_enough_memory = false;
        result.space_check.forEach(function(entry, index){
          if (result.hostname[index].substring(0,4)=="watc"){
            let size = parseInt(entry.substring(5,entry.indexOf(',')-1));
            if (size<80){
              not_enough_memory = true;
            }
          } else {
            let size = parseInt(entry.substring(entry.indexOf(',')+7,entry.length-1));
            if (size<25){
              not_enough_memory = true;
            }
          }
        });

        let debug_string = "<table style='width:100%'><tr><td><b>Hostname</b></td><td><b>Memory</b></td></tr>";
        result.hostname.forEach(function(entry, index){
            debug_string+="<tr><td>"+entry+"</td><td>"+result.space_check[index]+"</td></tr>";
            logging_object.agent[entry].memory = result.space_check[index];
        });
        debug_string+="</table><br><br> ####################################### <br>"
        document.getElementById('debug_window').innerHTML += debug_string;
        document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

        let step_stop_time = Date.now();
        logging_object.steps.memory_check = {};
        logging_object.steps.memory_check.step_start_time = step_start_time;
        logging_object.steps.memory_check.step_stop_time = step_stop_time;
        logging_object.steps.memory_check.duration = (step_stop_time-step_start_time)/1000;

        if (not_enough_memory){
          add_failure('memory_check');
          document.getElementById('memory_check').onclick=function(){
            add_waiting('memory_check');
            clear_memory(mount_drives);
          };
        } else {
          add_success('memory_check');
          next_function(stop_duckiebots, start_logging);
        }
      },
    });
  }

/////Restart duckiebot interface and acquisition node
  function restart_duckiebot_interface(next_function1, next_function2){
    add_loading('restart_interface');
    let step_start_time = Date.now();
    ajax_list["restart_interface"]=$.ajax({
      url: flask_url+":"+flask_port+"/reset_duckiebot",
      data: JSON.stringify({list:submission_bots}),
      dataType: "json",
      type: "POST",
      contentType: 'application/json',
      header: {},
      success: function(result) {
        delete ajax_list["restart_interface"];
        let not_started = false;
        result.outcome.forEach(function(entry, index){
          if (entry!="Duckiebot reset"){
              not_started = true;
          }
        });

        let debug_string = "<table style='width:100%'><tr><td><b>Hostname</b></td><td><b>Duckiebot-interface Status</b></td></tr>";
        result.hostname.forEach(function(entry, index){
            debug_string+="<tr><td>"+entry+"</td><td>"+result.outcome[index]+"</td></tr>";
            logging_object.agent[entry].interface = result.outcome[index];
        });
        debug_string+="</table><br><br> ####################################### <br>"
        document.getElementById('debug_window').innerHTML += debug_string;
        document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

        let step_stop_time = Date.now();
        logging_object.steps.restart_interface = {};
        logging_object.steps.restart_interface.step_start_time = step_start_time;
        logging_object.steps.restart_interface.step_stop_time = step_stop_time;
        logging_object.steps.restart_interface.duration = (step_stop_time-step_start_time)/1000;

        if (not_started){
          add_failure('restart_interface');
          document.getElementById('restart_interface').onclick=function(){
            restart_duckiebot_interface(next_function1, next_function2);
          };
        } else {
          add_success('restart_interface');
          next_function1(start_passive_duckiebots);
          next_function2();
        }
      }
    });
  }

/////Start the logging containers
  function start_logging(){
     add_loading('start_logging');
    //let step_start_time = Date.now();
    // ajax_list["start_logging"]=$.ajax({
    //   url: flask_url+":"+flask_port+"/start_logging",
    //   data: JSON.stringify({list:agent_list}),
    //   dataType: "json",
    //   type: "POST",
    //   contentType: 'application/json',
    //   header: {},
    //   success: function(result) {
    //     delete ajax_list["start_logging"];
    //     let logging_started = true;
    //     result.logging_start.forEach(function(entry){
    //       if (!(entry == "Started container")){
    //         logging_started = false;
    //       }
    //     });

    //       let debug_string = "<table style='width:100%'><tr><td><b>Hostname</b></td><td><b>Logging status</b></td></tr>";
    //       result.hostname.forEach(function(entry, index){
    //           debug_string+="<tr><td>"+entry+"</td><td>"+result.logging_start[index]+"</td></tr>";
    //           logging_object.agent[entry].logging_start = result.logging_start[index];
    //       });
    //       debug_string+="</table><br><br> ####################################### <br>"
    //       document.getElementById('debug_window').innerHTML += debug_string;
    //       document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

    //       let step_stop_time = Date.now();
    //       logging_object.steps.start_logging = {};
    //       logging_object.steps.start_logging.step_start_time = step_start_time;
    //       logging_object.steps.start_logging.step_stop_time = step_stop_time;
    //       logging_object.steps.start_logging.duration = (step_stop_time-step_start_time)/1000;

    //     if (!logging_started){
    //       add_failure('start_logging');
    //       document.getElementById('start_logging').onclick=function(){start_logging();};
    //     } else {
    //       add_success('start_logging');
    //     }
    //   },
    // });
    add_success('start_logging');
  }

/////Engage the emergency stop of all duckiebots
  function stop_duckiebots(next_function){
    if (next_function == start_duckiebot_container){
      add_loading('duckiebot_hold');
    } else {
      add_loading('duckiebot_stop');
    }
    let step_start_time = Date.now();
    if (ROS_connected){
      let emergency = new ROSLIB.Message({
        data : true
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
    }

    let debug_string = "<table style='width:100%'><tr><td><b>Hostname</b></td><td><b>Emergency stop</b></td></tr>";
    submission_bots.forEach(function(entry){
        debug_string+="<tr><td>"+entry+"</td><td>Emergency stop engaged</td></tr>";
        logging_object.agent[entry].emergency_stop_pre_evaluation = "engaged";
    });
    debug_string+="</table><br><br> ####################################### <br>"
    document.getElementById('debug_window').innerHTML += debug_string;
    document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

    let step_stop_time = Date.now();
    logging_object.steps.prevent_movement_pre_evaluation = {};
    logging_object.steps.prevent_movement_pre_evaluation.step_start_time = step_start_time;
    logging_object.steps.prevent_movement_pre_evaluation.step_stop_time = step_stop_time;
    logging_object.steps.prevent_movement_pre_evaluation.duration = (step_stop_time-step_start_time)/1000;

    if (next_function == start_passive_duckiebots){
      next_function(start_duckiebot_container)
      add_success('duckiebot_hold');
    } else {
      add_success('duckiebot_stop');
    }
  }

/////Start containers on the Duckiebots
function start_passive_duckiebots(next_function){
  if (passive_bots.length!=0){
    add_loading('start_passive_duckiebots');
    let step_start_time = Date.now();
    ajax_list["start_passive_duckiebots"]=$.ajax({
      url: flask_url+":"+flask_port+"/start_passive_bots",
      data: JSON.stringify({list:passive_bots, demo:"indefinite_navigation"}),
      dataType: "json",
      type: "POST",
      contentType: 'application/json',
      header: {},
      success: function(result) {
        let not_started = false;
        delete ajax_list["start_passive_duckiebots"];
        result.container.forEach(function(entry, index){
          if (entry!="Started demo"){
              not_started = true;
          }
        });

        let debug_string = "<table style='width:100%'><tr><td><b>Hostname</b></td><td><b>Demo status</b></td></tr>";
        result.hostname.forEach(function(entry, index){
            debug_string+="<tr><td>"+entry+"</td><td>"+result.container[index]+"</td></tr>";
            logging_object.agent[entry].demo = result.container[index];
        });
        debug_string+="</table><br><br> ####################################### <br>"
        document.getElementById('debug_window').innerHTML += debug_string;
        document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

        let step_stop_time = Date.now();
        logging_object.steps.start_passive_containers = {};
        logging_object.steps.start_passive_containers.step_start_time = step_start_time;
        logging_object.steps.start_passive_containers.step_stop_time = step_stop_time;
        logging_object.steps.start_passive_containers.duration = (step_stop_time-step_start_time)/1000;

        if (not_started){
          add_failure('start_passive_duckiebots');
          document.getElementById('start_passive_duckiebots').onclick=function(){start_passive_duckiebots(next_function);};
        } else {
          add_success('start_passive_duckiebots');
          next_function(wait_for_all_bots);
        }
      },
    });
  } else {
    add_success('start_passive_duckiebots');
    next_function(wait_for_all_bots);
  }
  
}

/////Start containers on the Duckiebots
  function start_duckiebot_container(next_function){
    if (active_bots.length!=0){
      add_loading('start_duckiebot_container');
      let step_start_time = Date.now();
      ajax_list["start_active_containers"]=$.ajax({
        url: flask_url+":"+flask_port+"/start_active_bots",
        data: JSON.stringify({list:active_bots, container: current_submission_container, duration: 60}),
        dataType: "json",
        type: "POST",
        contentType: 'application/json',
        header: {},
        success: function(result) {
          let not_started = false;
          delete ajax_list["start_active_containers"];
          result.container.forEach(function(entry, index){
            if (entry!="Started evaluation"){
                not_started = true;
            }
          });

          let debug_string = "<table style='width:100%'><tr><td><b>Hostname</b></td><td><b>Active Container</b></td></tr>";
          result.hostname.forEach(function(entry, index){
              debug_string+="<tr><td>"+entry+"</td><td>"+result.container[index]+"</td></tr>";
              logging_object.agent[entry].evaluation = result.container[index];
          });
          debug_string+="</table><br><br> ####################################### <br>"
          document.getElementById('debug_window').innerHTML += debug_string;
          document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

          let step_stop_time = Date.now();
          logging_object.steps.start_active_containers = {};
          logging_object.steps.start_active_containers.step_start_time = step_start_time;
          logging_object.steps.start_active_containers.step_stop_time = step_stop_time;
          logging_object.steps.start_active_containers.duration = (step_stop_time-step_start_time)/1000;

          if (not_started){
            add_failure('start_duckiebot_container');
            document.getElementById('start_duckiebot_container').onclick=function(){start_duckiebot_container(next_function);};
          } else {
            add_success('start_duckiebot_container');
            next_function();
          }
        },
      });
    } else {
      //If no active bots wanted, i.e. standard DEMO started from the interface
      add_success('start_duckiebot_container');
      next_function();
    }
  }

/////Wait until all bots are ready to move
  function wait_for_all_bots(){
    add_loading('ready_to_move');
    let step_start_time = Date.now();
    if (ROS_connected){
      submission_bots.forEach(function(entry){
        if (!(entry in sub_ready_to_move)){
          sub_ready_to_move[entry] = new ROSLIB.Topic({
            ros : window.ros,
            name : '/'+entry+'/ready_to_start',
            messageType : 'std_msgs/Bool',
            queue_size : 1,
          });
        }
        i_am_ready[entry] = false
        sub_ready_to_move[entry].subscribe(function(message) {
          if (message.data){
            if (i_am_ready[entry]== false){
              let debug_string=entry+" ready to move<br><br> ####################################### <br>"
              document.getElementById('debug_window').innerHTML += debug_string;
              document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;
              logging_object.agent[entry].ready_to_move = true;
            }
            i_am_ready[entry] = true;
          }
          let ready = true;
          submission_bots.forEach(function(bot){
            if(!i_am_ready[bot]){
              ready = false;
            }
          });
          if (ready){
            add_success('ready_to_move');

            let debug_string="All submission bots ready to move, evaluation can be started<br><br> ####################################### <br>"
            document.getElementById('debug_window').innerHTML += debug_string;
            document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

            let step_stop_time = Date.now();
            logging_object.steps.ready_to_move = {};
            logging_object.steps.ready_to_move.step_start_time = step_start_time;
            logging_object.steps.ready_to_move.step_stop_time = step_stop_time;
            logging_object.steps.ready_to_move.duration = (step_stop_time-step_start_time)/1000;

            submission_bots.forEach(function(bot){
              sub_ready_to_move[bot].unsubscribe();
            });
          }
        });
      });
    }
  }