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

/////Worker for running tasks in the background
  let worker_lights = new Worker(lights_worker_file);
  //URL called by the worker
  let url = 'http://'+ip_addr+'/api/'+api_key+'/lights/';

  worker_lights.addEventListener('message', function(e) {
    openAlert(type='success', e.data);
  }, false);

/////Call Hue API (using workers)
  function lights_on(){
    let command = JSON.stringify({on:true, bri:254, ct:153});
    worker_lights.postMessage({'url': url, 'light_nbr': light_nbr, 'command': command});

    slider_int.value=254;
    slider_col.value=153;
    output_int.innerHTML = 254;
    output_col.innerHTML = 153;
  }

  function lights_off(){
    let command = JSON.stringify({on:false, bri:254, ct:153});
    worker_lights.postMessage({'url': url, 'light_nbr': light_nbr, 'command': command});

    slider_int.value=254;
    slider_col.value=153;
    output_int.innerHTML = 254;
    output_col.innerHTML = 153;
  }

  function lights_change(){
    let command = JSON.stringify({on:true, bri:parseInt(intensity, 10), ct:parseInt(color, 10)});
    worker_lights.postMessage({'url': url, 'light_nbr': light_nbr, 'command': command});
  }
