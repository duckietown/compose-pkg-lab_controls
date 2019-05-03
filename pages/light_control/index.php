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
-->

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
</tr>
</tbody>
</table>

<script>
//Define constants
// Number of lightbulbs
let light_nbr = 21;
//Ip address of the Hue hub
let ip_addr = "192.168.1.5";
//API Key for the Hue hub
let api_key = "MZk4CALygJdoNboE1dalDeEZP5TQPTLLG0FOshOQ";

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
  let i=1;
  for(;i<light_nbr+1;i++){
    let url_name = 'http://'+ip_addr+'/api/'+api_key+'/lights/'+i+'/state';
    $.ajax({
      url: url_name,
      type:'PUT',
      data: JSON.stringify({on:true}),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      failure: function(errMsg) {alert(errMsg);}
    });
    wait(100);
  }
  openAlert(type='success', 'All lights turned on!')
});

$('#off').submit(function(e){
  e.preventDefault();
  let i=1;
  for(;i<light_nbr+1;i++){
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
  openAlert(type='success', 'All lights turned off!')
});

</script>

<?php
$py_script = __DIR__.'/../../modules/light_control.py';
$cmd = sprintf('python3 "%s" 2>&1', $py_script);

// $output = "";
// $exit_code = 0;
exec($cmd, $output, $exit_code);
echoArray($exit_code);
echoArray($output);
 ?>
