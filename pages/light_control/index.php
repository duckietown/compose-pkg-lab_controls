<!--
//This is php
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

//The URL that we want to send a PUT request to
$hue_ip='192.168.1.5';
$api_key='MZk4CALygJdoNboE1dalDeEZP5TQPTLLG0FOshOQ';
$bulb_id=6;
$url = 'http://'.$hue_ip.'/api/'.$api_key.'/lights/'.$bulb_id.'/state/';
#$url = 'http://'.$hue_ip.'/api/'.$api_key.'/lights/'.$bulb_id;
$data = array("on"=>true);
$data = json_encode($data);
$method = "PUT";
$test=request($url,$method,$data);

$py_script = __DIR__.'/../../modules/light_control.py';
$cmd = sprintf('python3 "%s" 2>&1', $py_script);

exec($cmd, $output, $exit_code);
echoArray($exit_code);
echoArray($output);
-->
<?php
  use \system\classes\Core;
  $param_ip = Core::getSetting("ip_hub", "lab_controls");
  $param_api = Core::getSetting("api_key", "lab_controls");
  $param_light_nbr = Core::getSetting("light_nbr", "lab_controls");
 ?>

<style>
.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 15px;
  border-radius: 5px;
  background: #d3d3d3;
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
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: #4CAF50;
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: #4CAF50;
  cursor: pointer;
}
</style>

<table>
<tbody>
<tr>
<td>
  <form id="on">
    <button type="submit">Turn Light on</button>
  </form>
</td>
<td>
  <object hspace="10">
</td>
<td>
  <form id="off">
    <button type="submit">Turn Light off</button>
  </form>
</td>
<td>
  <object hspace="10">
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

<script>
//Adapted from https://www.w3schools.com/howto/howto_js_rangeslider.asp
let slider_int = document.getElementById("intensity");
let output_int = document.getElementById("intensity_out");
let slider_col = document.getElementById("color");
let output_col = document.getElementById("color_out");
output_int.innerHTML = slider_int.value;
output_col.innerHTML = slider_col.value;

let col = slider_col.value;
let inten = slider_int.value;

slider_int.oninput = function() {
  output_int.innerHTML = this.value;
  inten = slider_int.value;
}

slider_col.oninput = function() {
  output_col.innerHTML = this.value;
  col = slider_col.value;
}

//Define constants
// Number of lightbulbs
let light_nbr = <?php echo $param_light_nbr?>;
//Ip address of the Hue hub
let ip_addr = "<?php echo $param_ip?>";
//API Key for the Hue hub
//let api_key = "MZk4CALygJdoNboE1dalDeEZP5TQPTLLG0FOshOQ";
let api_key = "<?php echo $param_api?>";

// From http://www.endmemo.com/js/pause.php
function wait(ms){
  var d = new Date();
  var d2 = null;
  do { d2 = new Date(); }
  while(d2-d < ms);
}

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
  let api_data = {on:true, bri:parseInt(inten, 10), ct:parseInt(col, 10)};
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

</script>
