<!-- Get parameters from the settings tab -->
  <?php
    use \system\classes\Core;
    use \system\packages\duckietown_duckiebot\Duckiebot;
    use \system\packages\ros\ROS;
    ROS::connect();

    $param_ip = Core::getSetting("ip_hub", "lab_controls");
    $param_api = Core::getSetting("api_key", "lab_controls");
    $param_light_nbr = Core::getSetting("light_nbr", "lab_controls");
    $param_ip_cam = Core::getSetting("ip_cam", "lab_controls");
    $param_cam_usr = Core::getSetting("cam_usr", "lab_controls");
    $param_cam_pw = Core::getSetting("cam_pw", "lab_controls");
    $param_cam_port = Core::getSetting("cam_port", "lab_controls");
    $param_plug_loc = __DIR__.'/test/test.php';

    //Gathering of this array should be done in JS as soon as possible
    $py_script = __DIR__.'/../../modules/ping.py';
    $cmd = sprintf('python3 "%s" 2>&1', $py_script);
    exec($cmd, $output, $exit_code);
    $detection_array=explode(', ',substr(substr(str_replace("'","",end($output)),1),0,-1));
    $detection_ping=explode(',',preg_replace("/[^0-9,.]/", "", prev($output)));
  ?>
<!-- Import stylesheet -->
  <link href="<?php echo Core::getCSSstylesheetURL('style.css', 'lab_controls') ?>" rel="stylesheet">

<!-- Main html body -->
  <table style="width: 100%; height:100%">
  <tbody>
  <tr>
    <!-- Map of Duckietown -->
    <td rowspan=3 class="map_tab">
      <div id="bots">
      </div>
      <img src="<?php echo Core::getImageURL('map.png', 'lab_controls') ?>" alt="No map available" class=map id="map" onload=start_bots()>
    </td>
    <!-- Camera image from Duckietown -->
    <td class="camera_tab">
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
        <form id="on">
          <button type="submit" class="btn btn-default">Turn Light on</button>
        </form>
      </td>
      <td>
        <form id="off">
          <button type="submit" class="btn btn-default">Turn Light off</button>
        </form>
      </td>
      <td>
        <input type="range" min="1" max="254" value="254" class="slider" id="intensity">
        <p>Intensity: <span id="intensity_out"></span></p>
        <input type="range" min="153" max="500" value="153" class="slider" id="color">
        <p>Color: <span id="color_out"></span></p>
        <form id="change">
          <button type="submit" class="btn btn-default">Change lights</button>
        </form>
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
          Duckiebot
        </td>
        <td>
          Ping
        </td>
        <td>
          Actions
        </td>
      </thead>
      <tbody style="background-color: #ffffff" id="duckie_list_body">

      </tbody>
      </table>
    </td>
  </tr>
  </tbody>
  </table>

  <button id="submission_button" type="button" class="btn btn-default" onclick="open_submission_popup()">Evaluate submission</button>
  <button type="button" class="btn btn-default" onclick="toggle_switch(7)">Toggle switch 1</button>
  <button type="button" class="btn btn-default" onclick="toggle_switch(8)">Toggle switch 2</button>
  <div id="test"></div>

  <!-- Popup info for Duckiebots -->
  <!-- Adapted from http://jafty.com/blog/tag/javascript-popup-onclick/ -->
  <div onclick="iconUnPop();" id="blackoutdiv" class=blackout></div>
  <div id="duckiepopup" class=popup>
    <ul class="nav nav-pills">
      <li id="info_tab" role="presentation" class="active" onclick="showInfo();"><a href="#">Info</a></li>
      <li id="camera_tab" role="presentation" onclick="showCamera();"><a href="#">Camera</a></li>
      <li id="history_tab" role="presentation" onclick="showHistory();"><a href="#">Changelog</a></li>
    </ul>

    <span id="info_content" class="popup_content">
    </span>
    <span id="camera_content" class="popup_content">
      <img src="" alt="No camera image available, are you sure rosbridge is running?" id="raspi_stream" class=raspi_camera>
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

  <div onclick="close_submission_popup()" id="submissionblackoutdiv" class=blackout></div>
  <div id="submissionPopup" class=popup>
    <button id="cancel_submission" type="button" class="btn btn-default" onclick="cancel_submission()">Cancel submission</button><br><br>
    <span id="submission_tabs" class="popup_content">
      <ul class="nav nav-pills">
        <li id="submission_tab_1" role="presentation" class="active" onclick=""><a href="#">Step 1</a></li>
        <li id="submission_tab_2" role="presentation" onclick=""><a href="#">Step 2</a></li>
        <li id="submission_tab_3" role="presentation" onclick=""><a href="#">Step 3</a></li>
        <li id="submission_tab_4" role="presentation" onclick=""><a href="#">Step 4</a></li>
        <li id="submission_tab_5" role="presentation" onclick=""><a href="#">Step 5</a></li>
        <li id="submission_tab_6" role="presentation" onclick=""><a href="#">Step 6</a></li>
      </ul>
    </span>
    <br>
    <span id="submission_steps" class="">
      <span id="submission_step_1" class="">
        <button id="start_submission" type="button" class="btn btn-default" onclick="next_submission_step(1)" disabled>Start submission evaluation</button>
        <br><br>
        <span class="submission_tab">
          <table id="submission_table" class="history_list" cellpadding="1" border="0" >
            <thead style="background-color: #dddddd;">
              <td style="width:20%">
                Submission number
              </td>
              <td>
                Description
              </td>
            </thead>
            <tbody style="background-color: #ffffff;" id="submission_table_body">

            </tbody>
          </table>
        </span>
      </span>
      <span id="submission_step_2" class="">
        <button type="button" class="btn btn-default" onclick="next_submission_step(2)">Goto step 3</button>
      </span>
      <span id="submission_step_3" class="">
        <button type="button" class="btn btn-default" onclick="next_submission_step(3)">Goto step 4</button>
      </span>
      <span id="submission_step_4" class="">
        <button type="button" class="btn btn-default" onclick="next_submission_step(4)">Goto step 5</button>
      </span>
      <span id="submission_step_5" class="">
        <button type="button" class="btn btn-default" onclick="next_submission_step(5)">Goto step 6</button>
      </span>
      <span id="submission_step_6" class="">
        <button type="button" class="btn btn-default" onclick="finish_submission()">Finish submission</button>
      </span>
    </span>
  </div>

<!-- JS to import settings from php -->
  <script>
    // Number of lightbulbs
    let light_nbr = <?php echo $param_light_nbr?>;
    //Ip address of the Hue hub
    let ip_addr = "<?php echo $param_ip?>";
    //API Key for the Hue hub
    let api_key = "<?php echo $param_api?>";
    //IP address of the Foscam
    let ip_addr_cam = "<?php echo $param_ip_cam?>";
    //Foscam port
    let cam_port = "<?php echo $param_cam_port?>";
    //Foscam user
    let cam_usr = "<?php echo $param_cam_usr?>";
    //Foscam pw
    let cam_pw = "<?php echo $param_cam_pw?>";
    //Worker file for light control
    let lights_worker_file = "<?php echo Core::getJSscriptURL('worker_lights.js', 'lab_controls') ?>";
    //Initialize Rosbridge
    let ROS_connected = false;
    $( document ).on("<?php echo ROS::$ROSBRIDGE_CONNECTED ?>", function(evt){
      ROS_connected = true;
    });
    let detected_hosts = <?php echo json_encode($detection_array); ?>;
    let detected_pings = <?php echo json_encode($detection_ping); ?>;
  </script>

<!-- Import js-yaml.min.js file (sourced from https://github.com/nodeca/js-yaml/blob/master/dist/js-yaml.min.js)-->
  <script src="<?php echo Core::getJSscriptURL('js-yaml.min.js', 'lab_controls') ?>" type="text/javascript"></script>
<!-- Import main JS file and param files-->
  <script src="<?php echo Core::getJSscriptURL('watchtower_locations.js', 'lab_controls') ?>" type="text/javascript"></script>
  <script src="<?php echo Core::getJSscriptURL('script.js', 'lab_controls') ?>" type="text/javascript"></script>
