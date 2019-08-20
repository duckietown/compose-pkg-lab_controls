/////Function to stop logging
  function stop_logging(next_function){
    //Animation might not be loaded when used to cancel job
    try{
      add_loading('stop_logging');
    } catch {}
    ajax_list["stop_logging"]=$.ajax({
      url: flask_url+":"+flask_port+"/stop_logging",
      data: JSON.stringify({"computer":logging_server_hostname}),
      dataType: "json",
      type: "POST",
      contentType: 'application/json',
      header: {},
      success: function(result) {
        delete ajax_list["stop_logging"];
        if (next_function === undefined){
          //Executed when canceling the job
        } else {
          let logging_stopped = true;
          let debug_string = ""
          if (result.outcome=="Success"){
            debug_string = "Stopped logging successfully";
          } else {
            debug_string = "Error while stopping the logger";
            logging_stopped = false;
          }
          debug_string+="<br><br> ####################################### <br>"
          document.getElementById('debug_window').innerHTML += debug_string;
          document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

          if (!logging_stopped){
            add_failure('stop_logging');
            document.getElementById('stop_logging').onclick=function(){
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
  function stop_duckiebot_containers(){
    if (passive_bots.length!=0){
      add_loading('stop_duckiebot_containers');
      let step_start_time = Date.now();
      ajax_list["stop_duckiebot_containers"]=$.ajax({
        url: flask_url+":"+flask_port+"/stop_passive_bots",
        data: JSON.stringify({list:passive_bots, demo:current_demo}),
        dataType: "json",
        type: "POST",
        contentType: 'application/json',
        header: {},
        success: function(result) {
          let not_stopped = false;
          delete ajax_list["stop_duckiebot_containers"];
          result.container.forEach(function(entry, index){
            if (entry!="Success"){
              not_stopped = true;
            }
          });
  
          let debug_string = "<table style='width:100%'><tr><td><b>Hostname</b></td><td><b>Demo stopped</b></td></tr>";
          result.hostname.forEach(function(entry, index){
              debug_string+="<tr><td>"+entry+"</td><td>"+result.container[index]+"</td></tr>";
              logging_object.agent[entry].demo_stopped = result.container[index];
          });
          debug_string+="</table><br><br> ####################################### <br>"
          document.getElementById('debug_window').innerHTML += debug_string;
          document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;
  
          let step_stop_time = Date.now();
          logging_object.steps.stop_passive_containers = {};
          logging_object.steps.stop_passive_containers.step_start_time = step_start_time;
          logging_object.steps.stop_passive_containers.step_stop_time = step_stop_time;
          logging_object.steps.stop_passive_containers.duration = (step_stop_time-step_start_time)/1000;
  
          if (not_stopped){
            add_failure('stop_duckiebot_containers');
            document.getElementById('stop_duckiebot_containers').onclick=function(){stop_duckiebot_containers();};
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
function process_bags(next_function){
  add_loading('process_bags');
  wait(3000);
  ajax_list["process_bags"]=$.ajax({
    url: flask_url+":"+flask_port+"/start_bag_processing",
    data: JSON.stringify({"input_bag_name":logging_bag_name,"output_bag_name":"processed_"+logging_bag_name, "mount_computer_side":logging_bag_mount, "mount_container_side":"/data" }),
    dataType: "json",
    type: "POST",
    contentType: 'application/json',
    header: {},
    success: function(result) {
      delete ajax_list["process_bags"];
      let process_successfull = true;
      let debug_string = ""
      alert(result.toSource());
      if (result.outcome=="Success"){
        debug_string = "Processed experiment bag successfully";
      } else {
        debug_string = "Error while processing bag";
        process_successfull = false;
      }
      debug_string+="<br><br> ####################################### <br>"
      document.getElementById('debug_window').innerHTML += debug_string;
      document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

      if (!process_successfull){
        add_failure('process_bags');
        document.getElementById('process_bags').onclick=function(){
          add_loading('process_bags');
          process_bags(next_function);
        };
      } else {
        add_success('process_bags');
        next_function();
      }
    },
  });
}

/////Process the bags generated during the experiment
function process_localization(){
  add_loading('process_localization');
  ajax_list["process_localization"]=$.ajax({
    url: flask_url+":"+flask_port+"/process_localization",
    data: JSON.stringify({"input_bag_name":"processed_"+logging_bag_name,"output_dir":"/data", "mount_computer_side":logging_bag_mount, "mount_container_side":"/data" }),
    dataType: "json",
    type: "POST",
    contentType: 'application/json',
    header: {},
    success: function(result) {
      delete ajax_list["process_localization"];
      let process_successfull = true;
      let debug_string = ""
      if (result.outcome=="Success"){
        debug_string = "Localization computed successfully";
      } else {
        debug_string = "Error while processing localization";
        process_successfull = false;
      }
      debug_string+="<br><br> ####################################### <br>"
      document.getElementById('debug_window').innerHTML += debug_string;
      document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

      if (!process_successfull){
        add_failure('process_localization');
        document.getElementById('process_localization').onclick=function(){
          add_loading('process_localization');
          process_localization();
        };
      } else {
        add_success('process_localization');
      }
    },
  });
}