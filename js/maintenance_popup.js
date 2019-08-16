/////Open the popup window for docker maintenance
    function open_docker_maintenance_popup(){
        document.getElementById('docker_maintenance').style.display="block";
        document.getElementById('maintenance_blackout_div').style.display="block";
        document.getElementById('start_docker_command').disabled = true;
        last_clicked_docker_host = "";
        let ancestor = document.getElementById('duckie_list_body'), descendents = ancestor.children;
        for(let i=0; i<descendents.length; i++){
            let name=descendents[i].cells[0].innerHTML;
            var div = document.createElement("div");
            div.innerHTML = name;
            div.id = "docker_"+name;
            div.className = "docker_entity";
            div.onclick= function() { select_for_docker(event,name);};
            document.getElementById("docker_entitites").appendChild(div);
        }
    }

/////Close the popup window for docker maintenance
    function close_docker_maintenance_popup(){
        document.getElementById('docker_maintenance').style.display="none";
        document.getElementById('maintenance_blackout_div').style.display="none";
        document.getElementById("docker_entitites").innerHTML="";
        docker_hosts = [];
    }

/////Function to select entities to be affected by the docker command
    function select_for_docker(event,name){
        if (event.shiftKey && last_clicked_docker_host!="") {
            let divs = document.getElementById("docker_entitites").querySelectorAll("div");
            let start_found = false;
            for (let i = 0; i < divs.length; i++) {
                let entry = divs[i];
                if (entry.innerHTML==name){
                    break;
                }
                if (start_found){
                    select_for_docker_shift(entry.innerHTML);
                };
                if (entry.innerHTML == last_clicked_docker_host){
                    start_found = true;
                }
            }  
        }
        if (document.getElementById("docker_"+name).style.backgroundColor=="rgb(237, 156, 39)"){
            let index = docker_hosts.indexOf(name);
            docker_hosts.splice(index,1);
            document.getElementById("docker_"+name).style.backgroundColor="";
        } else {
            docker_hosts.push(name);
            document.getElementById("docker_"+name).style.backgroundColor="#ED9C27";
        }
        if (docker_hosts.length>=1){
            document.getElementById('start_docker_command').disabled = false;
        } else {
            document.getElementById('start_docker_command').disabled = true;
        }
        last_clicked_docker_host = name;
    }

/////Function to select entities to be affected by the docker command with shift clicking
function select_for_docker_shift(name){
    if (document.getElementById("docker_"+name).style.backgroundColor=="rgb(237, 156, 39)"){
        let index = docker_hosts.indexOf(name);
        docker_hosts.splice(index,1);
        document.getElementById("docker_"+name).style.backgroundColor="";
    } else {
        docker_hosts.push(name);
        document.getElementById("docker_"+name).style.backgroundColor="#ED9C27";
    }
}

/////Execute docker command via API
function start_docker_command(){
    let cmd = document.getElementById('docker_command').value;
    document.getElementById('start_docker_command').disabled = true;
    $.ajax({
      url: flask_url+":"+flask_port+"/docker_maintenance",
      data: JSON.stringify({device_list:docker_hosts,command:cmd}),
      dataType: "json",
      type: "POST",
      contentType: 'application/json',
      header: {},
      success: function(result) {
        let success = true;
        let problematic_hosts = [];
        result.outcome.forEach(function(entry, index){
            if (entry == "0"){
                success = false;
                problematic_hosts.push(result.hostname[index]);
            }
        });
        if (success){
            alert("Success");
        } else {
            alert("Problem executing the command on the following hosts: "+problematic_hosts.toSource());
        }
        document.getElementById('start_docker_command').disabled = false;
      },
    });
  }