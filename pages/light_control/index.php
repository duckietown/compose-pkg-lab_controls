<!--
//This is php
  /////Calling the Hue API via php
  function request($url,$method,$data)
  {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    if ($method == "PUT")
      curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    $response = curl_exec($ch);
    return $response;
  }

  $hue_ip='192.168.1.5';
  $api_key='MZk4CALygJdoNboE1dalDeEZP5TQPTLLG0FOshOQ';
  $bulb_id=6;
  $url = 'http://'.$hue_ip.'/api/'.$api_key.'/lights/'.$bulb_id.'/state/';
  #$url = 'http://'.$hue_ip.'/api/'.$api_key.'/lights/'.$bulb_id;
  $data = array("on"=>true);
  $data = json_encode($data);
  $method = "PUT";
  $test=request($url,$method,$data);

//////Executing a python script via php
  $py_script = __DIR__.'/../../modules/light_control.py';
  $cmd = sprintf('python3 "%s" 2>&1', $py_script);

  exec($cmd, $output, $exit_code);
  echoArray($exit_code);
  echoArray($output);
-->

<!-- Get parameters from the settings tab -->
  <?php
    use \system\classes\Core;
    $param_ip = Core::getSetting("ip_hub", "lab_controls");
    $param_api = Core::getSetting("api_key", "lab_controls");
    $param_light_nbr = Core::getSetting("light_nbr", "lab_controls");
    $param_ip_cam = Core::getSetting("ip_cam", "lab_controls");
    $param_cam_usr = Core::getSetting("cam_usr", "lab_controls");
    $param_cam_pw = Core::getSetting("cam_pw", "lab_controls");
    $param_cam_port = Core::getSetting("cam_port", "lab_controls");
  ?>

<!-- Style sheet for sliders -->
  <style>
  .slider {
    -webkit-appearance: none;
    width: 80%;
    height: 15px;
    border-radius: 5px;
    background: #dddddd;
    outline: none;
    opacity: 0.7;
    -webkit-transition: .2s;
    transition: opacity .2s;
  }

  .slider:hover {
    opacity: 1;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #ED9C27;
    cursor: pointer;
  }

  .slider::-moz-range-thumb {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: #ED9C27;
    cursor: pointer;
  }

  .map {
    width: 40%;
  }
  .camera {
    width: 60%;
    height: 50%
  }
  .controls {
    width: 60%;
    height: 20%;
    padding-top: 10px;
    padding-bottom: 10px;
  }
  .duckies {
    width: 60%;
    height: 30;
    background-color:#ffffff;
  }

  </style>

<!-- Main html body -->
  <table style="width: 100%; height:100%;" cellpadding="1">
  <tbody>
  <tr>
    <td rowspan=3 class="map">&nbsp;
      <img src="http://0.0.0.0/images/map.png" alt="No map available" width=98%>
    </td>
    <td class="camera">&nbsp;
      <img src="" alt="No camera image available, please change the settings page" id="stream" width=100%>
    </td>
  </tr>
  <tr>
    <td class="controls">
      <table style="width: 100%;" cellpadding="1">
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
    <td class="duckies">
      <table style="width: 100%; height: 100%; vertical-align: top; text-align: center;" cellpadding="1" border="2">
      <tbody>
      <tr style="background-color: #dddddd; height:30px;">
        <td>
          <h2>Duckiebot</h2>
        </td>
        <td>
          <h2>Status</h2>
        </td>
        <td>
          <h2>Actions</h2>
        </td>
      </tr>
      <tr>
        <td>
          d
        </td>
        <td>
          e
        </td>
        <td>
          f
        </td>
      </tr>
      <tr>
        <td>
          g
        </td>
        <td>
          h
        </td>
        <td>
          i
        </td>
      </tr>
      <tr>
        <td>
          j
        </td>
        <td>
          k
        </td>
        <td>
          l
        </td>
      </tr>
      </tbody>
      </table>
    </td>
  </tr>
  </tbody>
  </table>




<script>
/////Setting and reading slider positions
  //Adapted from https://www.w3schools.com/howto/howto_js_rangeslider.asp
  let slider_int = document.getElementById("intensity");
  let output_int = document.getElementById("intensity_out");
  let slider_col = document.getElementById("color");
  let output_col = document.getElementById("color_out");
  output_int.innerHTML = slider_int.value;
  output_col.innerHTML = slider_col.value;

  let color = slider_col.value;
  let intensity = slider_int.value;

  slider_int.oninput = function() {
    output_int.innerHTML = this.value;
    intensity = slider_int.value;
  }

  slider_col.oninput = function() {
    output_col.innerHTML = this.value;
    color = slider_col.value;
  }

////Define constants
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


/////Wait function
  // From http://www.endmemo.com/js/pause.php
  function wait(ms){
    var d = new Date();
    var d2 = null;
    do { d2 = new Date(); }
    while(d2-d < ms);
  }

/////Call Hue API with ajax
//adapted from https://stackoverflow.com/questions/48830933/ajax-put-request-to-phillips-hue-hub-local -->
  $('#on').submit(function(e){
    e.preventDefault();
    for(let i=1;i<light_nbr+1;i++){
      let url_name = 'http://'+ip_addr+'/api/'+api_key+'/lights/'+i+'/state';
      $.ajax({
        url: url_name,
        type:'PUT',
        data: JSON.stringify({on:true, bri:254, ct:153}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        failure: function(errMsg) {alert(errMsg);}
      });
      wait(100);
    }
    slider_int.value=254;
    slider_col.value=153;
    output_int.innerHTML = 254;
    output_col.innerHTML = 153;
    openAlert(type='success', 'All lights turned on!');
  });

  $('#off').submit(function(e){
    e.preventDefault();
    for(let i=1;i<light_nbr+1;i++){
      let url_name = 'http://'+ip_addr+'/api/'+api_key+'/lights/'+i+'/state';
      $.ajax({
        url: url_name,
        type:'PUT',
        data: JSON.stringify({on:false}),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        failure: function(errMsg) {alert(errMsg);}
      });
      wait(100);
    }
    openAlert(type='success', 'All lights turned off!');
  });

  $('#change').submit(function(e){
    e.preventDefault();
    let api_data = {on:true, bri:parseInt(intensity, 10), ct:parseInt(color, 10)};
    for(let i=1;i<light_nbr+1;i++){
      let url_name = 'http://'+ip_addr+'/api/'+api_key+'/lights/'+i+'/state';
      $.ajax({
        url: url_name,
        type:'PUT',
        data: JSON.stringify(api_data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        failure: function(errMsg) {alert(errMsg);}
      });
      wait(100);
    }
    openAlert(type='success', 'Lights were changed!');
  });

/////Update camera image at an interval
  setInterval(function() {
    let stream = document.getElementById('stream');
    stream.src = 'http://'+ip_addr_cam+':'+cam_port+'/cgi-bin/CGIProxy.fcgi?cmd=snapPicture2&usr='+cam_usr+'&pwd='+cam_pw+'&rdn='+Math.random();
  }, 1000);

</script>
