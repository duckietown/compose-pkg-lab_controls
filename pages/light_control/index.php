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
    //include_once $param_plug_loc;
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
      <img src="<?php echo Core::getImageURL('map.png', 'lab_controls') ?>" alt="No map available" class=map id="map">
    </td>
    <!-- Camera image from Duckietown -->
    <td class="camera_tab">
      <img src="" alt="No camera image available, please change the settings page" id="stream" class=camera>
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
          <button type="submit">Turn Light on</button>
        </form>
      </td>
      <td>
        <form id="off">
          <button type="submit">Turn Light off</button>
        </form>
      </td>
      <td>
        <input type="range" min="1" max="254" value="254" class="slider" id="intensity">
        <p>Intensity: <span id="intensity_out"></span></p>
        <input type="range" min="153" max="500" value="153" class="slider" id="color">
        <p>Color: <span id="color_out"></span></p>
        <form id="change">
          <button type="submit">Change lights</button>
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
          Status
        </td>
        <td>
          Actions
        </td>
      </thead>
      <tbody style="background-color: #ffffff; height: 50px" id="duckie_list_body">

      </tbody>
      </table>
    </td>
  </tr>
  </tbody>
  </table>

  <button type="submit" onclick="add_bot()">Add entity</button>
  <input type="text" id="toRemove" style="width:60px;text-align: right;">
  <button type="submit" onclick="remove_bot()">Remove entity</button>

  <button type="button" onclick="toggle_switch(1)">Toggle switch 1</button>
  <button type="button" onclick="toggle_switch(2)">Toggle switch 2</button>
  <div id="test"></div>

  <!-- Popup info for Duckiebots -->
  <!-- Adapted from http://jafty.com/blog/tag/javascript-popup-onclick/ -->
  <div onclick="iconUnPop();" id="blackoutdiv" class=blackout></div>
  <div id="thepopup" class=popup><span id="popcontent"></span></div>

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
    //Location of php file to execute
    let plug_loc = "<?php echo $param_plug_loc?>";

    $( document ).on("<?php echo ROS::$ROSBRIDGE_CONNECTED ?>", function(evt){
      // Subscribe to the given topic
      subscriber = new ROSLIB.Topic({
        ros : window.ros,
        name : '/connected_clients',
        messageType : 'rosbridge_msgs/ConnectedClients',
        queue_size : 1,
      });

      subscriber.subscribe(function(message) {
        $.each(message.clients, function(i) {
          test = message.clients[i];
          console.log("Connected IP: "+test.ip_address);
        });
      });
    });

  </script>

<!-- Import main JS file -->
  <script src="<?php echo Core::getJSscriptURL('script.js', 'lab_controls') ?>" type="text/javascript"></script>
