/////Highlight submission from list
  function highlight_submission(id){
    if(selected_sub_id!==""){
      document.getElementById(selected_sub_id).style.backgroundColor="";
    }
    document.getElementById(id).style.backgroundColor="#ED9C27";
    document.getElementById('btn_start_job').disabled = false;
    selected_sub_id=id;
    current_submission_loop=document.getElementById(id).cells[2].innerHTML;
  }

/////Insert currently available submissions into submission table body
  function insert_submission_body(table){
    //Temporary until submissions can be fetched from server
    for(let i=0; i<20; i++){
      let row = table.insertRow();
      row.id=i;
      row.onclick= function() { highlight_submission(i);};
      row.style.height = "30px";
      let cell0 = row.insertCell(0);
      let cell1 = row.insertCell(1);
      let cell2 = row.insertCell(2);
      cell0.innerHTML=i
      cell1.innerHTML="Test"+i;
      cell2.innerHTML="LFVI";
    }
    call_server(table)
  }

/////Call server test Function, when working insert into insert_submission_body
  function call_server(table){
    $.ajax({
      url: "https://challenges.duckietown.org/v4/api/submissions-list",
      data: {},
      type: "GET",
      headers:{'X-Messaging-Token': dt_token},
      success: function(result) {
        result.result.forEach(function (i) {
          let row = table.insertRow();
          row.id=i;
          row.onclick= function() { highlight_submission(i);};
          row.style.height = "30px";
          let cell0 = row.insertCell(0);
          let cell1 = row.insertCell(1);
          let cell2 = row.insertCell(2);
          cell0.innerHTML=i;
          cell1.innerHTML="Test"+i;
          cell2.innerHTML="LFVI";
        });
      },
    });
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
