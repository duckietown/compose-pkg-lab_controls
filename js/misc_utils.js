/////Alert before reloading (from https://stackoverflow.com/questions/7317273/warn-user-before-leaving-web-page-with-unsaved-changes)
  window.onload = function() {
      window.addEventListener("beforeunload", function (e) {
           if (!submission_evaluating) {
               return undefined;
           }
          var confirmationMessage = "This page is asking you to confirm that you want to leave - data you have entered may not be saved.";
          (e || window.event).returnValue = confirmationMessage; //Gecko + IE
          return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
      });
  };

/////In progress: controlling smart power switches
  function toggle_switch(id){
    $.ajax({
      url: flask_url+":"+flask_port+"/toggle_switch",
      data: "",
      dataType: "json",
      type: "GET",
      contentType: 'application/json',
      header: {},
      success: function(result) {
        alert(result["temperature"]);
      },
    });
  };

/////Wait function
  // From http://www.endmemo.com/js/pause.php
  function wait(ms){
    var d = new Date();
    var d2 = null;
    do { d2 = new Date(); }
    while(d2-d < ms);
  }