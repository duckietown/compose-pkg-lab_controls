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

  .map_tab {
    width: 40%;
    position: relative;
  }
  .camera_tab {
    width: 60%;
    height: 40%;
  }
  .controls_tab {
    width: 60%;
    height: 20%;
    padding-top: 10px;
    padding-bottom: 10px;

  }
  .duckies_tab {
    width: 100%;
    overflow: scroll;
    display: block;
    max-height: 220px;
  }

  .entity {
    width: 18px;
    height: 18px;
    position: absolute;
    background-color: red;
    border-radius: 50%;
    left: 0px;
    top: 0px;
    text-align: center;
    vertical-align: middle;
    color: #ffffff;
  }

  .camera {
    width: 100%;
  }

  .map {
    width: 98%;
  }

  .duckie_list {
    width: 100%;
    height: 100%;
    vertical-align: top;
    text-align: center;
  }



</style>

<!-- Main html body -->
  <table style="width: 100%; height:100%">
  <tbody>
  <tr>
    <td rowspan=3 class="map_tab">
      <div id="bots">
      </div>
      <img src="http://0.0.0.0/images/map.png" alt="No map available" class=map id="map">
    </td>
    <td class="camera_tab">
      <img src="" alt="No camera image available, please change the settings page" id="stream" class=camera>
    </td>
  </tr>
  <tr>
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

<script>
/////Update camera image at an interval
  setInterval(function() {
    let stream = document.getElementById('stream');
    stream.src = 'http://'+ip_addr_cam+':'+cam_port+'/cgi-bin/CGIProxy.fcgi?cmd=snapPicture2&usr='+cam_usr+'&pwd='+cam_pw+'&rdn='+Math.random();
  }, 1000);

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

////Define constants from settings
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


/////Define variables
  //Number of moving bots
  let number_bots = 0;
  //Bots are moving
  let bots_moving = false;
  //Array of bot positions (and movements, only temporary)
  let bots_positions = [];

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

  function move_bots() {
    let map = document.getElementById("map");
    let canvas_height = map.clientHeight-18;
    let canvas_width = map.clientWidth-18;
    setInterval(exec_move, 10);
    function exec_move() {
      for(let i=0; i<number_bots; i++){
        let bot = document.getElementById("bot_"+i);
        if (bots_positions[i][0] <= 0) {
          bots_positions[i][2] = 1;
        }
        if (bots_positions[i][0] >= canvas_height) {
          bots_positions[i][2] = -1;
        }
        if (bots_positions[i][1] <= 0) {
          bots_positions[i][3] = 1;
        }
        if (bots_positions[i][1] >= canvas_width) {
          bots_positions[i][3] = -1;
        }
        bots_positions[i][0]+=bots_positions[i][2];
        bots_positions[i][1]+=bots_positions[i][3];
        bot.style.top = bots_positions[i][0] + 'px';
        bot.style.left = bots_positions[i][1] + 'px';
      }
    }
  }

  function test(id){
    alert("My ID is: "+id+"\nMy position is: "+bots_positions[id]);
  }

  function add_bot(){
    let new_div = document.createElement('div');
    let id = number_bots;
    new_div.id = "bot_"+id;
    new_div.className="entity";
    new_div.innerHTML=id;
    new_div.onclick= function() { test(id); };
    document.getElementById("bots").appendChild(new_div);
    bots_positions.push([0,0,1,1]);
    let table = document.getElementById("duckie_list_body");
    let row = table.insertRow();
    row.id = "tab_"+id;
    row.style.height = "30px";
    let cell0 = row.insertCell(0);
    let cell1 = row.insertCell(1);
    let cell2 = row.insertCell(2);
    cell0.innerHTML = id;
    cell1.innerHTML = "Active";
    cell2.innerHTML = "Test";

    number_bots++;
    if (bots_moving == false){
      bots_moving=true;
      move_bots();
    }
  }

</script>
