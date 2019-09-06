/////Flash evaluating button while evaluating
  setInterval(function() {
    if(submission_evaluating){
      let button = document.getElementById('submission_button');
      if (button.style.background==""){
        button.style.background="#ED9C27";
        button.style.color="white";
      } else {
        button.style.background="";
        button.style.color="";
      }
      if (all_bots_ready){
        button = document.getElementById('btn_submission_ready_to_start');
        if (button.style.background==""){
          button.style.background="#00bd2c";
          button.style.color="white";
        } else {
          button.style.background="";
          button.style.color="";
        }
      }
    }

  }, 500);

/////Open submission popup
  function open_submission_popup(){
    if (!submission_evaluating){
      initialize_submission_popup();
    }
    document.getElementById('submissionPopup').style.display="block";
    document.getElementById('submissionblackoutdiv').style.display="block";
  }

/////Initialize submission popup if no submission currently running
  function initialize_submission_popup(){
    logging_object = {};
    let ancestor = document.getElementById('submission_steps'), descendents = ancestor.children;
    for(let i=1; i<=descendents.length; i++){
      document.getElementById('submission_step_'+i).style.display="none";
      document.getElementById('submission_tab_'+i).classList.remove('active');
    }
    all_bots_ready = false;
    document.getElementById('btn_submission_ready_to_start').style.background="";
    document.getElementById('btn_submission_ready_to_start').style.color="";
    document.getElementById('debug_window').innerHTML="";
    document.getElementById('cancel_submission').style.display="none";
    document.getElementById('submission_step_1').style.display="block";
    document.getElementById('submission_server_time_info').style.display="block";
    document.getElementById('server_answer_time').innerHTML=999;
    document.getElementById('submission_tab_1').classList.add('active');
    document.getElementById('btn_start_job').disabled = true;
    let submission_table = document.getElementById("submission_table_body");
    document.getElementById('process_bags_update').innerHTML = "";
    document.getElementById('localization_update').innerHTML = "";
    document.getElementById('initialization_map').src = "";
    //Fetch currently available submissions from server
    empty_body(submission_table);
    fetch_submission(submission_table);
  }

/////Close submission popup
  function close_submission_popup(){
    clearInterval(job_server_interval);
    document.getElementById('btn_open_debug').innerHTML="Open debug";
    document.getElementById('debug_window').style.display="none";
    document.getElementById('submissionPopup').style.display="none";
    document.getElementById('submissionblackoutdiv').style.display="none";
  }

/////Reset submission view after canceling or finishing
  function reset_submission_view(){
    close_submission_popup();
    document.getElementById('submission_id_display').innerHTML = "";
    document.getElementById('submission_button').innerHTML="Evaluate submission";
    document.getElementById('submission_button').style.background="";
    document.getElementById('submission_button').style.color="";
    submission_evaluating = false;
    document.getElementById('btn_start_job').disabled = true;
    document.getElementById('btn_bots_selected').disabled = true;
    document.getElementById('btn_submission_ready_to_start').disabled = true;
    document.getElementById('btn_upload_data_ipfs').disabled = true;
    document.getElementById('btn_finish_job').disabled = true;
    necessary_active_bots = -1;
    necessary_passive_bots = -1;
    clearInterval(check_process_interval);
    clearInterval(check_localization_interval);
  }

/////Cancel job
  function cancel_job(){
    for (let ajax_call in ajax_list){
      ajax_list[ajax_call].abort();
    }
    stop_logging();
    submission_bots.forEach(function(bot){
      try{
        sub_ready_to_move[bot].unsubscribe();
      } catch {}
    });
    reset_submission_view();
    unsubscribe_cameras();
    openAlert(type='warning', 'Submission Nr. '+selected_sub_id+' canceled by the operator');
  }

/////Finish job
  function finish_job(status){
    reset_submission_view();
    if (status){
      openAlert(type='danger', 'Submission Nr. '+selected_sub_id+' failed with exit code '+status);
    } else {
      openAlert(type='success', 'Submission Nr. '+selected_sub_id+' successfully finished');
    }
  }

/////Open debug window
  function toggle_debug(){
    if (document.getElementById('debug_window').style.display=="block"){
      document.getElementById('btn_open_debug').innerHTML="Open debug";
      document.getElementById('debug_window').style.display="none";
    } else {
      document.getElementById('btn_open_debug').innerHTML="Close debug";
      document.getElementById('debug_window').style.display="block";
    }
  }
