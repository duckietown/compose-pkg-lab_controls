/////Next submission Step (next tab in the popup)
  function next_submission_step(id){
    document.getElementById('submission_tab_'+id).classList.remove('active');
    document.getElementById('submission_tab_'+eval(id+1)).classList.add('active');
    document.getElementById('submission_step_'+id).style.display="none";
    document.getElementById('submission_step_'+eval(id+1)).style.display="block";
    //Actual submission evaluation starts here
    if (id==1){
      document.getElementById('submission_button').innerHTML="Currently evaluating";
      document.getElementById('cancel_submission').style.display="inline";
      submission_evaluating = true;
      let duckiebot_selection = document.getElementById("duckiebot_selection_body");
      if (current_submission_loop=="LF"){
        //TODO: Only for testing, LF needs other bot setup
        necessary_active_bots = 0;
        necessary_passive_bots = 1;
      } else {
        necessary_active_bots = 1;
        necessary_passive_bots = 2;
      }
      
      let html_necessary_bots = document.getElementById("necessary_bots");
      html_necessary_bots.innerHTML="Active bots needed: "+necessary_active_bots+" Passive bots needed: "+necessary_passive_bots;
      empty_body(duckiebot_selection);
      insert_duckiebot_selection_body(duckiebot_selection);
      if (active_bots.length==necessary_active_bots && passive_bots.length==necessary_passive_bots){
        document.getElementById('btn_bots_selected').disabled = false;
      } else {
        document.getElementById('btn_bots_selected').disabled = true;
      }
    }
    if (id==2){
      current_substeps=0;
      necessary_substeps=10;
      current_button="btn_submission_ready_to_start";
      agent_list = get_submission_watchtowers();

      let watchtowers=[];

      agent_list.forEach(function(entry){
        watchtowers.push(entry);
      });

      active_bots.forEach(function(entry){
        agent_list.push(entry);
      });
      passive_bots.forEach(function(entry){
        agent_list.push(entry);
      });

      logging_object.agent = {};

      watchtowers.forEach(function(entry){
        logging_object.agent[entry] = {};
        logging_object.agent[entry].type = "watchtower";
      });
      active_bots.forEach(function(entry){
        logging_object.agent[entry] = {};
        logging_object.agent[entry].type = "duckiebot";
        logging_object.agent[entry].role = "active";
      });
      passive_bots.forEach(function(entry){
        logging_object.agent[entry] = {};
        logging_object.agent[entry].type = "duckiebot";
        logging_object.agent[entry].role = "passive";
      });

      let debug_string = "Chose the following Duckiebots as active: <br> "+active_bots+"<br> Chose the following Duckiebots as passive: <br> "+passive_bots+"<br><br> ####################################### <br>";
      document.getElementById('debug_window').innerHTML += debug_string;
      document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

      add_waiting('ping_agents');
      add_waiting('check_lights');
      add_waiting('mount_usb');
      add_waiting('memory_check');
      add_waiting('restart_interface');
      add_waiting('duckiebot_hold');
      add_waiting('start_logging');
      add_waiting('start_passive_duckiebots');
      add_waiting('start_duckiebot_container');
      add_waiting('ready_to_move');

      submission_bots = [];
      active_bots.forEach(function(entry){
        submission_bots.push(entry);
      });
      passive_bots.forEach(function(entry){
        submission_bots.push(entry);
      });
      ping_list(mount_drives);
      reset_lights();
    }
    if (id==3){
      current_substeps=0;
      necessary_substeps=1;
      current_button="btn_submission_finished";
      let dt = new Date();
      start_timestamp = dt.getTime();

      let debug_string="Evaluation started with timestamp: "+start_timestamp+"<br><br> ####################################### <br>"
      document.getElementById('debug_window').innerHTML += debug_string;
      document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

      add_waiting('duckiebot_start');
      start_duckiebots();
      subscribe_cameras();
    }
    if (id==4){
      //Get Timestamp for log_stop
      //Stop logging
      //Stop duckiebots
      //Kill and remove duckiebot containers
      //Copy bags
      //Validate bags
      //Clear memory of agents
      let dt = new Date();
      stop_timestamp = dt.getTime();

      let debug_string="Evaluation stopped with timestamp: "+stop_timestamp+"<br><br> ####################################### <br>"
      document.getElementById('debug_window').innerHTML += debug_string;
      document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

      current_substeps=0;
      necessary_substeps=6;
      current_button="btn_upload_data_ipfs";
      add_waiting('stop_logging');
      add_waiting('duckiebot_stop')
      add_waiting('stop_duckiebot_containers');
      add_waiting('copy_bags');
      add_waiting('validate_bags');
      add_waiting('clear_memory');
      stop_logging(copy_bags);
      stop_duckiebots();
      stop_duckiebot_containers();
      unsubscribe_cameras();
    }
    if (id==5){
      //Upload bags to ipfs and finish job
      current_substeps=0;
      necessary_substeps=1;
      current_button="btn_finish_job";
      add_waiting('uploading_data');
      upload_data();
    }
  }
