<?php
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => "HTTP://192.168.1.8/toggle",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => false,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "GET",
));

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

// if ($err) {
//   echo "cURL Error #:" . $err;
// } else {
//   $tmp= json_decode($response);
//   echo "Power at the time of pageload: ".intval($tmp->power)." W.<br>";
// }
?>
