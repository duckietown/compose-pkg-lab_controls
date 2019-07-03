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
      necessary_active_bots = 1;
      necessary_passive_bots = 0;
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
      //Ping bots
      //Check and/or Reset Lights
      //Mount USB
      //Check free memory
      //Start logging containers and check logging started
      //Start containers on duckiebots (in parallel with logging containers) and Check containers on duckiebots are ready
      current_substeps=0;
      necessary_substeps=8;
      current_button="btn_submission_ready_to_start";
      agent_list = get_submission_watchtowers();
      active_bots.forEach(function(entry){
        agent_list.push(entry);
      });
      passive_bots.forEach(function(entry){
        agent_list.push(entry);
      });
      element= document.getElementById('body_initialize_city');
      element.innerHTML=  '<table width="300px"><tbody><tr height="40px">\
                          <td>Pinging the agents</td>\
                          <td><span id="ping_agents"></span></td>\
                          </tr><tr height="40px">\
                          <td>Setting the room lights</td>\
                          <td><span id="check_lights"></span></td>\
                          </tr><tr height="40px">\
                          <td>Mounting the USB dives</td>\
                          <td><span id="mount_usb"></span></td>\
                          </tr><tr height="40px">\
                          <td>Checking memory</td>\
                          <td><span id="memory_check"></span></td>\
                          </tr><tr height="40px">\
                          <td>Preventing Duckiebot movement</td>\
                          <td><span id="duckiebot_stop"></span></td>\
                          </tr><tr height="40px">\
                          <td>Starting logging containers</td>\
                          <td><span id="start_logging"></span></td>\
                          </tr><tr height="40px">\
                          <td>Starting duckiebot containers</td>\
                          <td><span id="start_duckiebot"></span></td>\
                          </tr><tr height="40px">\
                          <td>Duckiebots ready to move</td>\
                          <td><span id="ready_to_move"></span></td>\
                          </tr></tbody></table>';
      add_waiting('ping_agents');
      add_waiting('check_lights');
      add_waiting('mount_usb');
      add_waiting('memory_check');
      add_waiting('duckiebot_stop');
      add_waiting('start_logging');
      add_waiting('start_duckiebot');
      add_waiting('ready_to_move');

      submission_bots = active_bots;
      passive_bots.forEach(function(entry){
        submission_bots.push(entry);
      });
      ping_list(mount_drives);
      reset_lights();
    }
    if (id==3){
      //wait for all duckiebots to be ready to send commands
      //Get Timestamp for log_start
      //Start duckiebots (set flag to start moving)
      let dt = new Date();
      start_timestamp = dt.getTime();
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
      current_substeps=0;
      necessary_substeps=5;
      current_button="btn_upload_data_ipfs";
      element= document.getElementById('body_submission_finished');
      element.innerHTML=  '<table width="300px"><tbody><tr height="40px">\
                          <td>Stop logging</td>\
                          <td><span id="stop_logging"></span></td>\
                          </tr><tr height="40px">\
                          <td>Stop Duckiebots</td>\
                          <td><span id="stop_duckiebot_containers"></span></td>\
                          </tr><tr height="40px">\
                          <td>Copy bags</td>\
                          <td><span id="copy_bags"></span></td>\
                          </tr><tr height="40px">\
                          <td>Validate bags</td>\
                          <td><span id="validate_bags"></span></td>\
                          </tr><tr height="40px">\
                          <td>Clear memory</td>\
                          <td><span id="clear_memory"></span></td>\
                          </tr></tbody></table>';
      add_waiting('stop_logging');
      add_waiting('stop_duckiebot_containers');
      add_waiting('copy_bags');
      add_waiting('validate_bags');
      add_waiting('clear_memory');
      stop_logging(copy_bags);
      stop_duckiebot_containers();
    }
    if (id==5){
      //Upload bags to ipfs and finish job
      current_substeps=0;
      necessary_substeps=1;
      current_button="btn_finish_job";
      element= document.getElementById('body_uploading_data');
      element.innerHTML=  '<table width="300px"><tbody><tr height="40px">\
                          <td>Uploading data</td>\
                          <td><span id="uploading_data"></span></td>\
                          </tr></tbody></table>';
      add_success('uploading_data');
    }
  }
