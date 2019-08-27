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

      document.getElementById('debug_window').innerHTML += debug_string;
      document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

     if (!roster_copied){
       add_failure('copy_roster');
       document.getElementById('copy_roster').onclick=function(){copy_roster(next_function);};
     } else {
       add_success('copy_roster');
       next_function(upload_data);
     }
    },
  });
}

/////Create log file
  function create_log(next_function){
    add_loading('creating_logfile');
    ajax_list["create_log_file"]=$.ajax({
      url: flask_url+":"+flask_port+"/create_log",
      data: JSON.stringify({content:logging_object, filename:logging_bag_name+".yaml", mount: logging_bag_mount}),
      dataType: "json",
      type: "POST",
      contentType: 'application/json',
      header: {},
      success: function(result) {
        delete ajax_list["create_log_file"];
        add_success('creating_logfile');
        next_function();
      },
    });
  }

/////Upload the data
  function upload_data(){
    add_loading('uploading_data');
    //TODO The magic happens here
    add_success('uploading_data');
  }