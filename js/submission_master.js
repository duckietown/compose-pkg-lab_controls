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
      let duckiebot_selection = document.getElementById("duckiebot_selection_body");
      if (current_submission_loop=="LF"){
        necessary_active_bots = 1;
        necessary_passive_bots = 0;
      } else {
        necessary_active_bots = 1;
        necessary_passive_bots = 2;
      }

      document.getElementById('submission_id_display').innerHTML = "Evaluating submission: "+ logging_object.job.submission_id;
      
      let html_necessary_bots = document.getElementById("necessary_bots");
      html_necessary_bots.innerHTML="Active bots needed: "+necessary_active_bots+" Passive bots needed: "+necessary_passive_bots;
      empty_body(duckiebot_selection);
      insert_duckiebot_selection_body(duckiebot_selection);
    }
    if (id==2){
      current_substeps=0;
      necessary_substeps=8;
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
        logging_object.agent[entry].lux = current_lux[entry];
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
      add_waiting('memory_check');
      add_waiting('restart_interface');
      add_waiting('duckiebot_hold');
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
      ping_list(memory_check);
      reset_lights();
    }
    if (id==3){
      current_substeps=0;
      necessary_substeps=2;
      current_button="btn_submission_finished";

      add_waiting('start_logging');
      add_waiting('duckiebot_start');
      subscribe_cameras();
      start_logging(start_duckiebots);
    }
    if (id==4){
      let dt = new Date();
      stop_timestamp = dt.getTime();

      let debug_string="Evaluation stopped with timestamp: "+stop_timestamp+"<br><br> ####################################### <br>"
      document.getElementById('debug_window').innerHTML += debug_string;
      document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

      current_substeps=0;
      necessary_substeps=5;
      current_button="btn_upload_data_ipfs";
      add_waiting('stop_logging');
      add_waiting('duckiebot_stop')
      add_waiting('stop_duckiebot_containers');
      add_waiting('process_bags')
      add_waiting('process_localization')
      stop_logging(process_bags);
      stop_duckiebots();
      stop_duckiebot_containers();
      unsubscribe_cameras();
    }
    if (id==5){
      //Upload bags to ipfs and finish job
      current_substeps=0;
      necessary_substeps=5;
      current_button="btn_finish_job";
      add_waiting('copy_roster');
      add_waiting('copy_map');
      add_waiting('creating_logfile');
      add_waiting('ipfs_hash');
      add_waiting('uploading_data');
      copy_roster(copy_map);
    }
  }
