//Worker for lightcontrol

/////Wait function
  // From http://www.endmemo.com/js/pause.php
  function wait(ms){
    var d = new Date();
    var d2 = null;
    do { d2 = new Date(); }
    while(d2-d < ms);
  }

self.addEventListener('message', function(e) {
    let url = e.data.url;
    let light_nbr = e.data.light_nbr;
    for(let i=1;i<light_nbr+1;i++){
      let xhr = new XMLHttpRequest();
      xhr.open("PUT", url+i+'/state', true);
      xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
      xhr.send(e.data.command);
      wait(100);
    }
  self.postMessage("The lights were changed!");
}, false);
