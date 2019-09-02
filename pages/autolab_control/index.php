<!-- Get parameters from the settings tab -->
  <?php
    use \system\classes\Core;
    use \system\packages\duckietown_duckiebot\Duckiebot;
    use \system\packages\ros\ROS;
    ROS::connect();

    $param_ip = Core::getSetting("ip_hub", "lab_controls");
    $param_api = Core::getSetting("api_key", "lab_controls");
    $param_light_nbr = Core::getSetting("light_nbr", "lab_controls");
    $param_ip_cam = str_getcsv(Core::getSetting("ip_cam", "lab_controls"));
    $param_cam_usr = Core::getSetting("cam_usr", "lab_controls");
    $param_cam_pw = Core::getSetting("cam_pw", "lab_controls");
    $param_cam_port = Core::getSetting("cam_port", "lab_controls");
    $param_dt_token = Core::getSetting("dt_token", "lab_controls");
    $param_flask_url = Core::getSetting("flask_url", "lab_controls");
    $param_flask_port = Core::getSetting("flask_port", "lab_controls");
    $param_changelog_file = Core::getSetting("changelog_file", "lab_controls");
    $param_submission_server = Core::getSetting("submission_server_url", "lab_controls");
    $param_logging_server_hostname = Core::getSetting("logging_server_hostname", "lab_controls");
    $param_logging_server_username = Core::getSetting("logging_server_username", "lab_controls");
    $param_plug_loc = __DIR__.'/test/test.php';
  ?>

  <!-- JS to import settings from php -->
  <script>
    // Number of lightbulbs
    let light_nbr = <?php echo $param_light_nbr?>;
    //Ip address of the Hue hub
    let ip_addr = "<?php echo $param_ip?>";
    //API Key for the Hue hub
    let api_key = "<?php echo $param_api?>";
    //IP address of the Foscam
    let ip_addr_cam = [];
    ip_addr_cam[0]= "<?php echo $param_ip_cam[0]?>";
    ip_addr_cam[1]= "<?php echo $param_ip_cam[1]?>";
    ip_addr_cam[2]= "<?php echo $param_ip_cam[2]?>";
    ip_addr_cam[3]= "<?php echo $param_ip_cam[3]?>";
    let current_ip_cam = ip_addr_cam[0];
    //Foscam port
    let cam_port = "<?php echo $param_cam_port?>";
    //Foscam user
    let cam_usr = "<?php echo $param_cam_usr?>";
    //Foscam pw
    let cam_pw = "<?php echo $param_cam_pw?>";
    //DT token
    let dt_token = "<?php echo $param_dt_token?>";
    //Flask url
    let flask_url = "<?php echo $param_flask_url?>";
    //Flask port
    let flask_port = "<?php echo $param_flask_port?>";
    //Flask port
    let changelog_file = "<?php echo $param_changelog_file?>";
    //Submission server url
    let submission_server_url = "<?php echo $param_submission_server?>";
    //Logging server hostname
    let logging_server_hostname = "<?php echo $param_logging_server_hostname?>";
    //Logging server username
    let logging_server_username = "<?php echo $param_logging_server_username?>";
    //Worker file for light control
    let lights_worker_file = "<?php echo Core::getJSscriptURL('worker_lights.js', 'lab_controls') ?>";
    //Initialize Rosbridge
    let ROS_connected = false;
    $( document ).on("<?php echo ROS::$ROSBRIDGE_CONNECTED ?>", function(evt){
      ROS_connected = true;
    });
  </script>

<!-- Import js-yaml.min.js file (sourced from https://github.com/nodeca/js-yaml/blob/master/dist/js-yaml.min.js)-->
  <script src="<?php echo Core::getJSscriptURL('js-yaml.min.js', 'lab_controls') ?>" type="text/javascript"></script>
<!-- Import main JS file and param files-->
  <script src="<?php echo Core::getJSscriptURL('watchtower_locations.js', 'lab_controls') ?>" type="text/javascript"></script>
  <script src="<?php echo Core::getJSscriptURL('global_variables.js', 'lab_controls') ?>" type="text/javascript"></script>
  <script src="<?php echo Core::getJSscriptURL('ip_cam.js', 'lab_controls') ?>" type="text/javascript"></script>
  <script src="<?php echo Core::getJSscriptURL('information_popup.js', 'lab_controls') ?>" type="text/javascript"></script>
  <script src="<?php echo Core::getJSscriptURL('create_bots.js', 'lab_controls') ?>" type="text/javascript"></script>
  <script src="<?php echo Core::getJSscriptURL('map_visualization.js', 'lab_controls') ?>" type="text/javascript"></script>
  <script src="<?php echo Core::getJSscriptURL('misc_utils.js', 'lab_controls') ?>" type="text/javascript"></script>
  <script src="<?php echo Core::getJSscriptURL('submission_popup.js', 'lab_controls') ?>" type="text/javascript"></script>
  <script src="<?php echo Core::getJSscriptURL('submission_master.js', 'lab_controls') ?>" type="text/javascript"></script>
  <script src="<?php echo Core::getJSscriptURL('submission_select_job.js', 'lab_controls') ?>" type="text/javascript"></script>
  <script src="<?php echo Core::getJSscriptURL('submission_select_duckiebots.js', 'lab_controls') ?>" type="text/javascript"></script>
  <script src="<?php echo Core::getJSscriptURL('submission_animations.js', 'lab_controls') ?>" type="text/javascript"></script>
  <script src="<?php echo Core::getJSscriptURL('submission_initialization.js', 'lab_controls') ?>" type="text/javascript"></script>
  <script src="<?php echo Core::getJSscriptURL('submission_running.js', 'lab_controls') ?>" type="text/javascript"></script>
  <script src="<?php echo Core::getJSscriptURL('submission_terminating.js', 'lab_controls') ?>" type="text/javascript"></script>
  <script src="<?php echo Core::getJSscriptURL('submission_uploading.js', 'lab_controls') ?>" type="text/javascript"></script>
  <script src="<?php echo Core::getJSscriptURL('maintenance_popup.js', 'lab_controls') ?>" type="text/javascript"></script>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-csv/0.71/jquery.csv-0.71.min.js"></script>

<!-- Import stylesheet -->
  <link href="<?php echo Core::getCSSstylesheetURL('style.css', 'lab_controls') ?>" rel="stylesheet">

<!-- Main html body -->
  <!-- Logos of Duckietown and AIDO -->
  <img src="<?php echo Core::getImageURL('duckietown_logo.png', 'lab_controls') ?>" alt="Duckietown logo not available" class="logo logo_left">
  <img src="<?php echo Core::getImageURL('AIDO_logo.png', 'lab_controls') ?>" alt="AIDO logo not available" class="logo logo_right">

  <table style="width: 100%; height:100%">
  <tbody>
  <tr>
    <!-- Map of Duckietown -->
    <td rowspan=3 class="map_tab">
      <div id="bots">
      </div>
      <div id="ping_message" class="hosts_loading"><span style="line-height: 55px; font-weight: bold;">Currently pinging hosts, please wait ...</span></div>
      <img src="<?php echo Core::getImageURL('map.png', 'lab_controls') ?>" alt="No map available" class=map id="map" onload=ping_bots()>
      <canvas id="bot_visualization" width="380" height="694" style="position: relative; z-index:8;"></canvas>
    </td>
    <!-- Camera image from Duckietown -->
    <td class="camera_tab">
      <div class="dropdown">
        <button class="btn btn-default dropdown-toggle" type="button" style="margin-bottom:5px;" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
          Select camera
          <span class="caret"></span>
        </button>
        <button id="submission_button" type="button" class="btn btn-default" style="margin-bottom:5px;" onclick="open_submission_popup()" disabled>Evaluate submission</button>
        <button type="button" class="btn btn-default" style="margin-bottom:5px;" onclick="open_docker_maintenance_popup()">Docker maintenance</button>
        <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
          <li><a href="#" onclick=change_camera(0)>Camera 1</a></li>
          <li><a href="#" onclick=change_camera(1)>Camera 2</a></li>
          <li><a href="#" onclick=change_camera(2)>Camera 3</a></li>
          <li><a href="#" onclick=change_camera(3)>Camera 4</a></li>
        </ul>
      </div>

      

      <img src="" alt="No camera image available, please change the settings page" id="stream" class=camera onclick=camera_size_toggle()>
    </td>
  </tr>
  <tr>
    <!-- Light control -->
    <td class="controls_tab">
      <table style="width: 100%;">
      <tbody>
      <tr>
      <td>
        <button type="button" class="btn btn-default" onclick="lights_on()">Turn Light on</button>
      </td>
      <td>
        <button type="button" class="btn btn-default" onclick="lights_off()">Turn Light off</button>
      </td>
      <td>
        <input type="range" min="1" max="254" value="254" class="slider" id="intensity">
        <p>Intensity: <span id="intensity_out"></span></p>
        <input type="range" min="153" max="500" value="153" class="slider" id="color">
        <p>Color: <span id="color_out"></span></p>
        <button type="button" class="btn btn-default" onclick="lights_change()">Change lights</button>
      </td>
      </tr>
      </tbody>
      </table>
    </td> 
  </tr>
  <tr>
    <!-- Different Duckiebots currently in town -->
    <td class="duckies_tab">
      <table id="duckie_list" class="duckie_list" cellpadding="1" border="0">
      <thead style="background-color: #dddddd;">
        <td>
          Hostname
        </td>
        <td>
          Ping
        </td>
        <td>
          Actions <span class="glyphicon glyphicon-repeat" aria-hidden="true" style="cursor: pointer;" onclick="ping_bots()">
        </td>
      </thead>
      <tbody style="background-color: #ffffff" id="duckie_list_body">

      </tbody>
      </table>
    </td>
  </tr>
  </tbody>
  </table>
  <table>
  <tbody>
    <tr>
      <td style="padding-right: 10px; padding-top:5px;"><div id="Watchtower_legend" class="watchtower" style="position: relative">XX</div> Watchtower number XX</td>
      <td style="padding-right: 10px; padding-top:5px;"><div id="Duckiebot_legend" class="duckiebot" style="position: relative">XX</div> Duckiebot number XX</td>
      <td style="padding-top:5px;"><div id="Duckiebot_legend" class="duckiebot" style="position: relative; background-color: rgb(237, 156, 39);">XX</div> Highlighted Duckiebot/Watchtower number XX</td>
    </tr>
  </tbody>
  </table>

  <button type="button" class="btn btn-default" style="margin-bottom:5px;" onclick="show_trajectory()">Test API</button>

  <!-- Popup info for Duckiebots -->
  <!-- Adapted from http://jafty.com/blog/tag/javascript-popup-onclick/ -->
  <div onclick="close_information_window();" id="blackoutdiv" class=blackout></div>
  <div id="duckiepopup" class=popup>
    <ul class="nav nav-pills">
      <li id="info_tab" role="presentation" class="active" onclick="showInfo();"><a href="#">Info</a></li>
      <li id="camera_tab" role="presentation" onclick="showCamera();"><a href="#">Camera</a></li>
      <li id="history_tab" role="presentation" onclick="showHistory();"><a href="#">Changelog</a></li>
    </ul>

    <span id="info_content" class="popup_content">
    </span>
    <span id="camera_content" class="popup_content">
      <img src="" alt="No camera image available, are you sure rosbridge and acquisition-bridge are running?" id="raspi_stream" class=raspi_camera>
    </span>
    <span id="history_content" class="popup_content">
      <h4>Configuration history </h4>
      <span class="history_tab">
        <table id="duckiebot_config" class="history_list" cellpadding="1" border="0">
          <thead style="background-color: #dddddd;">
            <td style="width:20%">
              Date
            </td>
            <td>
              Description
            </td>
          </thead>
          <tbody style="background-color: #ffffff;" id="config_list_body">

          </tbody>
        </table>
      </span>
      <h4>Calibration history </h4>
      <span class="history_tab">
        <table id="duckiebot_calib" class="history_list" cellpadding="1" border="0">
          <thead style="background-color: #dddddd;">
            <td style="width:20%">
              Date
            </td>
            <td>
              Description
            </td>
          </thead>
          <tbody style="background-color: #ffffff;" id="calib_list_body">

          </tbody>
        </table>
      </span>
      <h4>Experiment history </h4>
      <span class="history_tab">
        <table id="duckiebot_experiment" class="history_list" cellpadding="1" border="0">
          <thead style="background-color: #dddddd;">
            <td style="width:20%">
              Date
            </td>
            <td>
              Description
            </td>
          </thead>
          <tbody style="background-color: #ffffff;" id="experiment_list_body">

          </tbody>
        </table>
      </span>
    </span>
  </div>

 <!-- Popup for Submissions -->
  <div onclick="close_submission_popup()" id="submissionblackoutdiv" class=blackout></div>
  <div id="submissionPopup" class=popup>
    <button id="cancel_submission" type="button" class="btn btn-default" onclick="cancel_job()">Cancel submission</button>
    <span id="submission_id_display"></span>
    <button id="btn_open_debug" type="button" class="btn btn-default pull-right" onclick="toggle_debug()">Open debug</button><br><br>
    <span id="submission_tabs" class="popup_content">
      <ul class="nav nav-pills">
        <li id="submission_tab_1" role="presentation" class="active no_hover" onclick=""><a href="#">Select job</a></li>
        <li id="submission_tab_2" role="presentation" class="no_hover" onclick=""><a href="#">Select duckiebots</a></li>
        <li id="submission_tab_3" role="presentation" class="no_hover" onclick=""><a href="#">Initialize city</a></li>
        <li id="submission_tab_4" role="presentation" class="no_hover" onclick=""><a href="#">Run submission</a></li>
        <li id="submission_tab_5" role="presentation" class="no_hover" onclick=""><a href="#">Evaluation finished</a></li>
        <li id="submission_tab_6" role="presentation" class="no_hover" onclick=""><a href="#">Upload Data</a></li>
      </ul>
    </span>
    <br>
    <span id="submission_steps" class="">
      <span id="submission_step_1" class="">
        <button id="btn_start_job" type="button" class="btn btn-default" onclick="next_submission_step(1)" disabled>Select job</button>
        <br><br>
        <span id="submission_server_time_info">Currently pinging the submission server. The server answers in <span id="server_answer_time">999</span> seconds. Please wait</span>
        <span class="submission_tab">
          <table id="submission_table" class="history_list" cellpadding="1" border="0" >
            <thead style="background-color: #dddddd;">
              <td style="width:20%">
                Submission number
              </td>
              <td>
                Container Name
              </td>
              <td>
                Type
              </td>
            </thead>
            <tbody style="background-color: #ffffff;" id="submission_table_body">

            </tbody>
          </table>
        </span>
      </span>
      <span id="submission_step_2" class="">
        <button id="btn_bots_selected" type="button" class="btn btn-default" onclick="next_submission_step(2)" disabled>Select Duckiebots</button>
        <span id="necessary_bots"></span>
        <br><br>
        <span class="submission_tab">
          <table id="duckiebot_selection" class="history_list" cellpadding="1" border="0" >
            <thead style="background-color: #dddddd;">
              <td style="width:20%">
                Duckiebot
              </td>
              <td>
                Active
              </td>
              <td>
                Passive
              </td>
            </thead>
            <tbody style="background-color: #ffffff;" id="duckiebot_selection_body">

            </tbody>
          </table>
        </span>
      </span>
      <span id="submission_step_3" class="">
        <button id="btn_submission_ready_to_start" type="button" class="btn btn-default" onclick="next_submission_step(3)" disabled>Start submission</button>
        <br><br>
        <span id="body_initialize_city">
          <table width="300px"><tbody>
            <tr height="40px">
              <td>Pinging the agents</td>
              <td><span id="ping_agents"></span></td>
            </tr><tr height="40px">
              <td>Setting the room lights</td>
              <td><span id="check_lights"></span></td>
            </tr><tr height="40px">
              <td>Checking memory</td>
              <td><span id="memory_check"></span></td>
            </tr><tr height="40px">
              <td>Restart Duckiebot interface</td>
              <td><span id="restart_interface"></span></td>
            </tr><tr height="40px">
              <td>Preventing Duckiebot movement</td>
              <td><span id="duckiebot_hold"></span></td>
            </tr><tr height="40px">
              <td>Starting passive Duckiebots</td>
              <td><span id="start_passive_duckiebots"></span></td>
            </tr><tr height="40px">
              <td>Starting active Duckiebots</td>
              <td><span id="start_duckiebot_container"></span></td>
            </tr><tr height="40px">
              <td>Duckiebots ready to move</td>
              <td><span id="ready_to_move"></span></td>
            </tr>
          </tbody></table>
        </span>
      </span>
      <span id="submission_step_4" class="">
        <button id="btn_submission_finished" type="button" class="btn btn-default" onclick="next_submission_step(4)" disabled>Stop submission</button>
        <br><br>
        <span id="body_submission_running">
          The submission is currently running. Press the \'Stop submission\' button as soon as the active bot/s drive/s out of the city
          <table width="300px"><tbody>
            </tr><tr height="40px">
                <td>Starting logging</td>
                <td><span id="start_logging"></span></td>
            <tr height="40px">
              <td>Enabling Duckiebot movement</td>
              <td><span id="duckiebot_start"></span></td>
            </tr>
          </tbody></table>
          <table width=100%><tbody>
            <tr>
              <td width=25%>
                <span id="submission_bot_title0"></span>
              </td>
              <td width=25%>
                <span id="submission_bot_title1"></span>
              </td>
              <td rowspan=4 width=50%>
              <img src="" alt="No camera image available" id="submission_ip_cam" class=raspi_camera>
              </td>
            </tr>
            <tr>
              <td width=25%>
                <img src="" alt="No camera image available" id="submission_bot_stream0" class=raspi_camera>
              </td>
              <td width=25%>
                <img src="" alt="No camera image available" id="submission_bot_stream1" class=raspi_camera>
              </td>
            </tr>
            <tr>
              <td width=25%>
                <span id="submission_bot_title2"></span>
              </td>
              <td width=25%>
                <span id="submission_bot_title3"></span>
              </td>
            </tr>
            <tr>
              <td width=25%>
                <img src="" alt="No camera image available" id="submission_bot_stream2" class=raspi_camera>
              </td>
              <td width=25%>
                <img src="" alt="No camera image available" id="submission_bot_stream3" class=raspi_camera>
              </td>
            </tr>
          </tbody></table>
        </span>
      </span>
      <span id="submission_step_5" class="">
        <button id="btn_upload_data_ipfs" type="button" class="btn btn-default" onclick="next_submission_step(5)" disabled>Upload data</button>
        <br><br>
        <span id="body_submission_finished">
          <table width="300px">
            <tbody><tr height="40px">
              <td>Stop logging</td>
              <td><span id="stop_logging"></span></td>
            </tr><tr height="40px">
              <td>Stop Duckiebots</td>
              <td><span id="duckiebot_stop"></span></td>
            </tr><tr height="40px">
              <td>Stop Duckiebot containers</td>
              <td><span id="stop_duckiebot_containers"></span></td>
            </tr><tr height="40px">
              <td>Process bags</td>
              <td><span id="process_bags"></span><span id="process_bags_update"></span></td>
            </tr><tr height="40px">
              <td>Process localization</td>
              <td><span id="process_localization"></span><span id="localization_update"></span></td>
            </tr>
          </tbody></table>
        </span>
      </span>
      <span id="submission_step_6" class="">
        <button id="btn_finish_job" type="button" class="btn btn-default" onclick="finish_job()" disabled>Finish job</button>
        <br><br>
        <span id="body_uploading_data">
          <table width="300px"><tbody>
            <tr height="40px">
                <td>Copying roster</td>
                <td><span id="copy_roster"></span></td>
            <tr height="40px">
                <td>Creating logfile</td>
                <td><span id="creating_logfile"></span></td>
            <tr height="40px">
              <td>Uploading data</td>
              <td><span id="uploading_data"></span></td>
            </tr>
          </tbody></table>
        </span>
      </span>
    </span>
  </div>

  <div id="debug_window" class=popup_debug>

  </div>
  <div onclick="close_docker_maintenance_popup()" id="maintenance_blackout_div" class=blackout></div>
  <div id="docker_maintenance" class=popup>
    Enter docker command: 
    <div class="input-group">
      <span class="input-group-addon" id="basic-addon1">docker -H Hostname </span>
      <input id="docker_command" type="text" class="form-control" placeholder="command" aria-describedby="basic-addon1">
    </div>
    <br>
    <div class = "docker_entities" id="docker_entitites">

    </div>
    <br>
    <button id="start_docker_command" type="button" class="btn btn-default" onclick="start_docker_command()">Execute docker command</button>
  </div>
<!-- Must be called after HTML load -->
  <script src="<?php echo Core::getJSscriptURL('light_control.js', 'lab_controls') ?>" type="text/javascript"></script>