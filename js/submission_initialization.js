/////Ping specific list
  function ping_list(next_function){
    add_loading('ping_agents');
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
    ajax_list["reset_lights"]=$.ajax({
      url: flask_url+":"+flask_port+"/lights_on",
      data: {},
      type: "GET",
      header: {},
      success: function(result) {
        delete ajax_list["reset_lights"];
        if(result.success){
          add_success('check_lights');
        } else {
          add_failure('check_lights');
          document.getElementById('check_lights').onclick=function(){reset_lights();};
        }
      },
    });
  }

/////Mount drives
  function mount_drives(next_function){
    add_loading('mount_usb');
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
        if (device_not_mountable){
          add_failure('mount_usb');
          document.getElementById('mount_usb').onclick=function(){mount_drives(next_function);};
        } else {
          add_success('mount_usb');
          next_function(start_logging, stop_duckiebots);
        }
      },
    });
  }

/////Check available memory
  function memory_check(next_function1, next_function2){
    add_loading('memory_check');
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
        if (not_enough_memory){
          add_failure('memory_check');
          document.getElementById('memory_check').onclick=function(){
            add_loading('memory_check');
            clear_memory(mount_drives);
          };
        } else {
          add_success('memory_check');
          next_function1();
          next_function2(start_duckiebot_container);
        }
      },
    });
  }

/////Start the logging containers
  function start_logging(){
    add_loading('start_logging');
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
  if (next_function == start_duckiebot_container){
    next_function(wait_for_all_bots)
    add_success('duckiebot_hold');
  } else {
    add_success('duckiebot_stop');
  }
}

/////Start containers on the Duckiebots
  function start_duckiebot_container(next_function){
    add_loading('start_duckiebot_container');
    ajax_list["start_active_containers"]=$.ajax({
      url: flask_url+":"+flask_port+"/start_active_bots",
      data: JSON.stringify({list:active_bots, container: current_submission_container, duration: 60}),
      dataType: "json",
      type: "POST",
      contentType: 'application/json',
      header: {},
      success: function(result) {
        let not_started = false;
        result.container.forEach(function(entry, index){
          if (entry!="Started evaluation"){
              not_started = true;
          }
        });
        if (not_started){
          add_failure('start_duckiebot_container');
          document.getElementById('start_duckiebot_container').onclick=function(){
            add_loading('start_duckiebot_container');
            start_duckiebot_container(next_function);
          };
        } else {
          add_success('start_duckiebot_container');
          next_function();
        }
      },
    });
  }

/////Wait until all bots are ready to move
  function wait_for_all_bots(){
    add_loading('ready_to_move');
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
            submission_bots.forEach(function(bot){
              sub_ready_to_move[bot].unsubscribe();
            });
          }
        });
      });
    }
  }


  function start_duckiebot_container_test(){
    add_loading('start_duckiebot_container');
    active_bots = ["autobot03"];
    current_submission_container = "localhost:5000/webbe035/aido-submissions:2019_07_23_15_41_34";
    ajax_list["start_active_containers"]=$.ajax({
      url: flask_url+":"+flask_port+"/start_active_bots",
      data: JSON.stringify({list:active_bots, container: current_submission_container, duration: 60}),
      dataType: "json",
      type: "POST",
      contentType: 'application/json',
      header: {},
      success: function(result) {
        alert(result.toSource())
        let not_started = false;
        result.container.forEach(function(entry, index){
          if (entry!="Started evaluation"){
              not_started = true;
          }
        });
        if (not_started){
          alert("Failure");
        } else {
          alert("Success");
        }
      },
    });
  }