/////Highlight submission from list
function highlight_submission(id) {
  document.getElementById(id).style.backgroundColor = "#ED9C27";
  document.getElementById('btn_start_job').disabled = false;
  selected_sub_id = id;
  current_submission_container = document.getElementById(id).cells[1].innerHTML;
  current_submission_container = current_submission_container.replace("localhost", "duckietown20.local")
  current_submission_loop = document.getElementById(id).cells[2].innerHTML;
}

/////Fetch submission map from submission container and display it
function get_submission_map(map_container, challenge_name, step_name) {
  ajax_list["get_map"] = $.ajax({
    url: flask_url + ":" + flask_port + "/get_map",
    data: JSON.stringify({ container: map_container, name: challenge_name, step: step_name }),
    dataType: "json",
    type: "POST",
    contentType: 'application/json',
    header: {},
    success: function (result) {
      delete ajax_list["get_map"];
      document.getElementById('initialization_map').src = flask_url + ":" + flask_port + result.data + "#svgView(viewBox(5, 0, 240, 490))";
    },
  });
}

/////Get the next submission from the serverr
function fetch_submission(table) {
  let debug_string = "Currently pinging the submission server <br><br>";
  let step_start_time = Date.now();
  document.getElementById('debug_window').innerHTML += debug_string;
  endpoint_string = "/api/take-submission";
  url_string = submission_server_url;
  job_server_interval = setInterval(function () {
    let start_time_ajax = Date.now();
    $.ajax({
      url: flask_url + ":" + flask_port + "/request_submission",
      data: JSON.stringify({ token: dt_token, endpoint: endpoint_string, url: url_string }),
      dataType: "json",
      type: "POST",
      contentType: 'application/json',
      header: {},
      success: function (result) {
        let response = JSON.parse(result);
        let stop_time_ajax = Date.now();
        document.getElementById('server_answer_time').innerHTML = (stop_time_ajax - start_time_ajax) / 1000;
        if (response.result.submission_id != null) {
          let step_stop_time = Date.now();
          submission_evaluating = true;
          document.getElementById('submission_server_time_info').style.display = "none";
          clearInterval(job_server_interval);
          let row = table.insertRow();
          row.id = response.result.submission_id;
          row.onclick = function () { highlight_submission(response.result.submission_id); };
          row.style.height = "30px";
          let cell0 = row.insertCell(0);
          let cell1 = row.insertCell(1);
          let cell2 = row.insertCell(2);
          let docker_repo = response.result.parameters.locations[0];
          let container = docker_repo.registry + "/" + docker_repo.organization + "/" + docker_repo.repository + ":" + docker_repo.tag;
          aws_config = response.result.aws_config;
          job_id = response.result.job_id;
          cell0.innerHTML = response.result.submission_id;
          cell1.innerHTML = container;
          map_container = response.result.challenge_parameters.services.evaluator.image;
          map_container = map_container.substring(0, map_container.indexOf('@'));
          map_container = map_container.replace("localhost", "duckietown20.local")
          let challenge_name = response.result.challenge_name;
          let step_name = response.result.step_name;
          get_submission_map(map_container, challenge_name, step_name);
          if (challenge_name == "aido3-LF-real-validation" || challenge_name == "aido3-LF-real-testing") {
            cell2.innerHTML = "LF";
            current_demo = "lane_following"
          } else if (challenge_name == "aido3-LFV-real-validation" || challenge_name == "aido3-LFV-real-testing") {
            cell2.innerHTML = "LFV";
            current_demo = "lane_following"
          }
          else {
            cell2.innerHTML = "LFVI";
            current_demo = "indefinite_navigation"
          }
          let debug_string = "Received submission from the server: <br> " + response.toSource() +
            "<br><br>Running on the " + cell2.innerHTML + " loop." +
            "<br><br> ####################################### <br>";
          document.getElementById('debug_window').innerHTML += debug_string;
          document.getElementById('debug_window').scrollTop = document.getElementById('debug_window').scrollHeight;

          logging_object.job = {};
          logging_object.job.submission_id = response.result.submission_id;
          logging_object.job.step_name = step_name;
          logging_object.job.container = container;
          logging_object.job.challenge_name = challenge_name;
          logging_object.steps = {};
          logging_object.steps.job_selection = {};
          logging_object.steps.job_selection.step_start_time = step_start_time;
          logging_object.steps.job_selection.step_stop_time = step_stop_time;
          logging_object.steps.job_selection.duration = (step_stop_time - step_start_time) / 1000;
        }

      },
    });
  }, 1000);
}


/////Watchtowers necessary for certain job
function get_submission_watchtowers() {
  if (current_submission_loop == "LF" || current_submission_loop == "LFV") {
    return ["watchtower21", "watchtower22", "watchtower23", "watchtower24", "watchtower25", "watchtower26", "watchtower27", "watchtower28", "watchtower29", "watchtower30", "watchtower31", "watchtower32", "watchtower33", "watchtower34", "watchtower35", "watchtower36"]
  } else {
    //TODO remove comment, when watchtower07 is working again
    // return ["watchtower01","watchtower02","watchtower03","watchtower04","watchtower05","watchtower06","watchtower07","watchtower08","watchtower09","watchtower10","watchtower11","watchtower12","watchtower13","watchtower14","watchtower15","watchtower16"]
    return ["watchtower01", "watchtower02", "watchtower03", "watchtower04", "watchtower05", "watchtower06", "watchtower08", "watchtower09", "watchtower10", "watchtower11", "watchtower12", "watchtower13", "watchtower14", "watchtower15", "watchtower16", "watchtower17", "watchtower18"]
  }
}
