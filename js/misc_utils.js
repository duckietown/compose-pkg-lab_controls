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


//TODO: remove if no longer needed
/////Test for emergency stop
function test_emergency_stop(){
  publisher_emergency = new ROSLIB.Topic({
    ros : window.ros,
    name : '/autobot03/toggleEmergencyStop',
    messageType : 'std_msgs/Bool',
    queue_size : 1,
  });
  let emergency = new ROSLIB.Message({
    data : true
  });
  publisher_emergency.publish(emergency)
}
