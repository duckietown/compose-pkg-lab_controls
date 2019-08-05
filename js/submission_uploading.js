/////Upload the data
  function upload_data(){
    add_loading('uploading_data');
    //TODO The magic happens here
    add_success('uploading_data');
  }

/////Create log file
  function create_log(){
    ajax_list["create_log_file"]=$.ajax({
      url: flask_url+":"+flask_port+"/create_log",
      data: JSON.stringify({content:logging_object, filename:"test2.yaml"}),
      dataType: "json",
      type: "POST",
      contentType: 'application/json',
      header: {},
      success: function(result) {
        delete ajax_list["create_log_file"];
        alert(result.outcome)
      },
    });
  }