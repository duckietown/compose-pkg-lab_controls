/////Highlight submission from list
  function highlight_submission(id){
    if(selected_sub_id!==""){
      document.getElementById(selected_sub_id).style.backgroundColor="";
    }
    document.getElementById(id).style.backgroundColor="#ED9C27";
    document.getElementById('btn_start_job').disabled = false;
    selected_sub_id=id;
    current_submission_container = document.getElementById(id).cells[1].innerHTML;
    current_submission_loop = document.getElementById(id).cells[2].innerHTML;
  }

/////Insert currently available submissions into submission table body
  function insert_submission_body(table){
    let debug_string = "Currently pinging the submission server <br><br>";
    document.getElementById('debug_window').innerHTML += debug_string;
    endpoint_string = "/api/take-submission";
    url_string = "http://localhost:6544";
    job_server_interval = setInterval(function() {
      let start_time_ajax = Date.now();
      $.ajax({
        url: flask_url+":"+flask_port+"/request_submission",
        data: JSON.stringify({token:dt_token,endpoint:endpoint_string,url:url_string}),
        dataType: "json",
        type: "POST",
        contentType: 'application/json',
        header: {},
        success: function(result) {
          let response = JSON.parse(result);
          let stop_time_ajax = Date.now();
          document.getElementById('server_answer_time').innerHTML=(stop_time_ajax-start_time_ajax)/1000;
          if (response.result.submission_id != null){
            document.getElementById('submission_server_time_info').style.display="none";
            clearInterval(job_server_interval);
            let row = table.insertRow();
            row.id=response.result.submission_id;
            row.onclick= function() { highlight_submission(response.result.submission_id);};
            row.style.height = "30px";
            let cell0 = row.insertCell(0);
            let cell1 = row.insertCell(1);
            let cell2 = row.insertCell(2);
            let docker_repo = response.result.parameters.locations[0];
            let container = docker_repo.registry+"/"+docker_repo.organization+"/"+docker_repo.repository+":"+docker_repo.tag;
            cell0.innerHTML=response.result.submission_id;
            cell1.innerHTML=container;
            let challenge_name = response.result.challenge_name;
            if (challenge_name=="aido2-LF-real-validation" || challenge_name=="aido2-LF-real-testing"){
              cell2.innerHTML="LF";
            } else if (challenge_name=="aido2-LFV-real-validation" || challenge_name=="aido2-LFV-real-testing") {
              cell2.innerHTML="LFV";
            }
            else {
              cell2.innerHTML="LFVI";
            }
            let debug_string = "Received submission from the server: <br> "+response.toSource()+
                                "<br><br>Running on the "+cell2.innerHTML+" loop."+
                                "<br><br> ####################################### <br>";
            document.getElementById('debug_window').innerHTML += debug_string;
            document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;
          }
          
        },
      });
    }, 1000);
  }


/////Watchtowers necessary for certain job
  function get_submission_watchtowers(){
    if (current_submission_loop=="LF" || current_submission_loop=="LFV")
    {
      return ["watchtower21","watchtower22","watchtower23","watchtower24","watchtower25","watchtower26","watchtower27","watchtower28","watchtower29","watchtower30","watchtower31","watchtower32","watchtower33","watchtower34","watchtower35"]
    } else {
      return ["watchtower01","watchtower02","watchtower03","watchtower04","watchtower05","watchtower06","watchtower07","watchtower08","watchtower09","watchtower10","watchtower11","watchtower12","watchtower13","watchtower14","watchtower15","watchtower16"]
    }
  }


  // function call_server(table){
  //   let job_server_interval=null;

  //   let features = {'disk_available_mb': 100000,
  //               'disk_total_mb': 256000,
  //               'processor_free_percent' : 95,
  //               'nduckiebots' : 6,
  //               'x86_64' : 1,
  //               'processor_frequency_mhz' : 3500,
  //               'map_aido2_LF_pub': 1,
  //               'map_aido2_LFV_pub': 1,
  //               'map_aido2_LFVI_pub': 1,
  //               'gpu': 0,
  //               'mac': 0,
  //               'armv7l': 0,
  //               'ram_total_mb':16000,
  //               'ram_available_mb':10000,
  //               'nprocessors':12,
  //               'p1': 1,
  //               'picamera': 0,
  //               'ipfs': 1};

  //   let data_get = {'submission_id': null,
  //               'machine_id': 'autolab_server',
  //               'process_id': 'autolab_server-1',
  //               'evaluator_version': 1,
  //               'features': features,
  //               'reset': false};
  //   job_server_interval = setInterval(function() {
  //     $.ajax({
  //       url: submission_server_url+"/api/take-submission",
  //       dataType: "json",
  //       type: "GET",
  //       headers:{'X-Messaging-Token': dt_token},
  //       contentType: "application/json; charset=utf-8",
  //       data: data_get,
  //       success: function(result) {
  //         // result.result.forEach(function (i) {
  //         //   let row = table.insertRow();
  //         //   row.id=i;
  //         //   row.onclick= function() { highlight_submission(i);};
  //         //   row.style.height = "30px";
  //         //   let cell0 = row.insertCell(0);
  //         //   let cell1 = row.insertCell(1);
  //         //   let cell2 = row.insertCell(2);
  //         //   cell0.innerHTML=i;
  //         //   cell1.innerHTML="Test"+i;
  //         //   cell2.innerHTML="LFVI";
  //         // });
  //       },
  //     });
  //     // if (ROS_connected){
  //     //   clearInterval(job_server_interval);
  //     //}
  //   }, 1000);
  // }