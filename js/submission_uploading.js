/////Copy roster
function copy_roster(next_function){
  add_loading('copy_roster');
  let step_start_time = Date.now();
  let roster_mount = "/home/"+logging_server_username+"/ETHZ-autolab-fleet-roster";
  ajax_list["copy_roster"]=$.ajax({
    url: flask_url+":"+flask_port+"/copy_roster",
    data: JSON.stringify({list:agent_list, mount: logging_bag_mount+"/roster", roster_location: roster_mount}),
    dataType: "json",
    type: "POST",
    contentType: 'application/json',
    header: {},
    success: function(result) {
      delete ajax_list["copy_roster"];
      let roster_copied = true;
      let step_stop_time = Date.now();
      let debug_string = "";
      if (result.outcome=="Success"){
        debug_string = "Roster copied";
        logging_object.steps.copy_roster = {};
        logging_object.steps.copy_roster.step_start_time = step_start_time;
        logging_object.steps.copy_roster.step_stop_time = step_stop_time;
        logging_object.steps.copy_roster.duration = (step_stop_time-step_start_time)/1000;
      } else {
        roster_copied = false;
        debug_string = "Not able to copy roster";
      }
      debug_string+="</table><br><br> ####################################### <br>"
      document.getElementById('debug_window').innerHTML += debug_string;
      document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

     if (!roster_copied){
       add_failure('copy_roster');
       document.getElementById('copy_roster').onclick=function(){copy_roster(next_function);};
     } else {
       add_success('copy_roster');
       next_function(create_log);
     }
    },
  });
}

/////Copy map
function copy_map(next_function){
  add_loading('copy_map');
  let step_start_time = Date.now();
  let map_loc = "/home/"+logging_server_username+"/duckietown-world";
  let map_path = "src/duckietown_world/data/gd1/maps/robotarium2.yaml"
  ajax_list["copy_map"]=$.ajax({
    url: flask_url+":"+flask_port+"/copy_map",
    data: JSON.stringify({mount: logging_bag_mount+"/trajectories", map_location: map_loc, path: map_path}),
    dataType: "json",
    type: "POST",
    contentType: 'application/json',
    header: {},
    success: function(result) {
      delete ajax_list["copy_map"];
      let map_copied = true;
      let step_stop_time = Date.now();
      let debug_string = "";
      if (result.outcome=="Success"){
        debug_string = "Map copied";
        logging_object.steps.copy_map = {};
        logging_object.steps.copy_map.step_start_time = step_start_time;
        logging_object.steps.copy_map.step_stop_time = step_stop_time;
        logging_object.steps.copy_map.duration = (step_stop_time-step_start_time)/1000;
      } else {
        map_copied = false;
        debug_string = "Not able to copy map";
      }
      debug_string+="</table><br><br> ####################################### <br>"
      document.getElementById('debug_window').innerHTML += debug_string;
      document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

     if (!map_copied){
       add_failure('copy_map');
       document.getElementById('copy_map').onclick=function(){copy_map(next_function);};
     } else {
       add_success('copy_map');
       next_function(ipfs_hash)
     }
    },
  });
}

/////Create log file
  function create_log(next_function){
    add_loading('creating_logfile');
    let step_start_time = Date.now();
    ajax_list["create_log_file"]=$.ajax({
      url: flask_url+":"+flask_port+"/create_log",
      data: JSON.stringify({content:logging_object, filename:"log.yaml", mount: logging_bag_mount+"/experiment"}),
      dataType: "json",
      type: "POST",
      contentType: 'application/json',
      header: {},
      success: function(result) {
        delete ajax_list["create_log_file"];

        let step_stop_time = Date.now();
        let debug_string = "";
        if (result.outcome=="Success"){
          debug_string = "Log created";
          logging_object.steps.create_log = {};
          logging_object.steps.create_log.step_start_time = step_start_time;
          logging_object.steps.create_log.step_stop_time = step_stop_time;
          logging_object.steps.create_log.duration = (step_stop_time-step_start_time)/1000;
        } else {
          debug_string = "Not able to create log";
        }
        debug_string+="</table><br><br> ####################################### <br>"
        document.getElementById('debug_window').innerHTML += debug_string;
        document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

        add_success('creating_logfile');
        next_function(upload_data);
      },
    });
  }

/////Create ipfs hashes
  function ipfs_hash(next_function){
    add_loading('ipfs_hash');
    ajax_list["ipfs_hash"]=$.ajax({
      url: flask_url+":"+flask_port+"/ipfs_add",
      data: JSON.stringify({mount: logging_bag_mount}),
      dataType: "json",
      type: "POST",
      contentType: 'application/json',
      header: {},
      success: function(result) {
        delete ajax_list["ipfs_hash"];
        let debug_string = "";
        if (result.outcome!="Error"){
          debug_string = "IPFS hashes created created";
        } else {
          debug_string = "Not able to create IPFS hashes";
        }
        debug_string+="</table><br><br> ####################################### <br>"
        document.getElementById('debug_window').innerHTML += debug_string;
        document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

        if(result.data=="Error"){
          add_failure('ipfs_hash');
          document.getElementById('ipfs_hash').onclick=function(){ipfs_hash(next_function);};
        } else {
          ipfs_hashes=result.data;
          add_success('ipfs_hash');
          next_function();
        }
      },
    });
  }

/////Upload the data TODO: a lot of defaul variables ... add S3 implementation
  function upload_data(){
    add_loading('uploading_data');
    endpoint_string = "/api/take-submission";
    url_string = submission_server_url;
    let submission_result="success";
    let scores = {"distance":10,"time":20};
    let uploaded = {};
    $.ajax({
      url: flask_url+":"+flask_port+"/upload_data",
      data: JSON.stringify({token:dt_token,endpoint:endpoint_string,url:url_string,job_id:job_id,result:submission_result,ipfs_hashes:ipfs_hashes,scores:scores,uploaded:uploaded}),
      dataType: "json",
      type: "POST",
      contentType: 'application/json',
      header: {},
      success: function(result) {
        alert(result.toSource())
      },
    });
    add_success('uploading_data');
  }