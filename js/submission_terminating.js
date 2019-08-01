/////Function to stop logging
  function stop_logging(next_function){
    //Animation might not be loaded when used to cancel job
    try{
      add_loading('stop_logging');
    } catch {}
    ajax_list["stop_logging"]=$.ajax({
      url: flask_url+":"+flask_port+"/stop_logging",
      data: JSON.stringify({list:agent_list}),
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
          result.logging_stop.forEach(function(entry, index){
            if (!(entry=="Already stopped"||entry=="Stopped")){
              logging_stopped = false;
            }
          });

          let debug_string = "<table style='width:100%'><tr><td><b>Hostname</b></td><td><b>Logging status</b></td></tr>";
          result.hostname.forEach(function(entry, index){
              debug_string+="<tr><td>"+entry+"</td><td>"+result.logging_stop[index]+"</td></tr>";
          });
          debug_string+="</table><br><br> ####################################### <br>"
          document.getElementById('debug_window').innerHTML += debug_string;
          document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

          if (!logging_stopped){
            add_failure('stop_logging');
            document.getElementById('memory_check').onclick=function(){
              add_loading('stop_logging');
              stop_logging(mount_drives);
            };
          } else {
            add_success('stop_logging');
            next_function(validate_bags);
          }
        }
      },
    });
  }

/////Stop the containers from duckiebots (active duckiebots should their container get removed)
  function stop_duckiebot_containers(){
    add_loading('stop_duckiebot_containers');
    add_success('stop_duckiebot_containers');
  }

/////Copy the bags to the server
  function copy_bags(next_function){
    add_loading('copy_bags');
    add_success('copy_bags');
    next_function(clear_memory)
  }

/////Validate the bags pulled from the agents
function validate_bags(next_function){
  add_loading('validate_bags');
  add_success('validate_bags');
  next_function();
}

/////Function to clear the memory
function clear_memory(next_function){
  //Animation might not be loaded when used to check memory size during initialization
  try{
    add_loading('clear_memory');
  } catch {}
  ajax_list["clear_memory"]=$.ajax({
    url: flask_url+":"+flask_port+"/clear_memory",
    data: JSON.stringify({list:agent_list}),
    dataType: "json",
    type: "POST",
    contentType: 'application/json',
    header: {},
    success: function(result) {
      delete ajax_list["clear_memory"];
      if (next_function == mount_drives){
        //Need to substract as mount_drives will be reexecuted (and was already successfull)
        current_substeps-=1;
        next_function(memory_check);
      } else {
        let memory_cleared = true;
        result.clear_memory.forEach(function(entry, index){
          if (!(entry=="Success")){
            memory_cleared = false;
          }
        });

        let debug_string = "<table style='width:100%'><tr><td><b>Hostname</b></td><td><b>Memory cleared</b></td></tr>";
        result.hostname.forEach(function(entry, index){
            debug_string+="<tr><td>"+entry+"</td><td>"+result.clear_memory[index]+"</td></tr>";
        });
        debug_string+="</table><br><br> ####################################### <br>"
        document.getElementById('debug_window').innerHTML += debug_string;
        document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

        if (!memory_cleared){
          add_failure('clear_memory');
          document.getElementById('clear_memory').onclick=function(){
            add_loading('clear_memory');
            clear_memory();
          };
        } else {
          add_success('clear_memory');
        }
      }
    },
  });
}