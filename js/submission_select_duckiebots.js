/////Insert currently available/pingeable duckiebots into body
  function insert_duckiebot_selection_body(table){
    active_bots=[];
    passive_bots=[];
    let ancestor = document.getElementById('duckie_list_body'), descendents = ancestor.children;
    for(let i=0; i<descendents.length; i++){
      let name=descendents[i].cells[0].innerHTML;
      if (name.substring(0,4)=="auto"){
        let row = table.insertRow();
        row.id="select_"+name;
        row.style.height = "30px";
        let cell0 = row.insertCell(0);
        let cell1 = row.insertCell(1);
        let cell2 = row.insertCell(2);
        let checkbox1 = document.createElement("INPUT");
        checkbox1.type = "checkbox";
        checkbox1.id = "active_"+name;
        checkbox1.name = name;
        let checkbox2 = document.createElement("INPUT");
        checkbox2.type = "checkbox";
        checkbox2.id = "passive_"+name;
        checkbox2.name = name;
        cell0.innerHTML = name;
        cell1.appendChild(checkbox1);
        checkbox1.onchange = function() {select_for_evaluation(this);};
        cell2.appendChild(checkbox2);
        checkbox2.onchange = function() {select_for_evaluation(this);};
      }
    }
  }

/////Select duckiebots for evaluation
  function select_for_evaluation(bot){
    let active = false;
    let checked = false;
    if (bot.id.substring(0,6)=="active"){
      active = true;
    }
    if (bot.checked){
      checked = true;
    }
    let active_box = document.getElementById('active_'+bot.name);
    let passive_box = document.getElementById('passive_'+bot.name);
    if (checked){
      if (active){
        passive_box.checked = false;
        active_bots.push(bot.name);
        let index = passive_bots.indexOf(bot.name);
        if (index>=0){
          passive_bots.splice(index,1);
        }
      } else {
        active_box.checked = false;
        passive_bots.push(bot.name);
        let index = active_bots.indexOf(bot.name);
        if (index>=0){
          active_bots.splice(index,1);
        }
      }
    } else {
      if (active){
        let index = active_bots.indexOf(bot.name);
        if (index>=0){
          active_bots.splice(index,1);
        }
      } else {
        let index = passive_bots.indexOf(bot.name);
        if (index>=0){
          passive_bots.splice(index,1);
        }
      }
    }
    active_bots.sort();
    passive_bots.sort();
    if (active_bots.length==necessary_active_bots && passive_bots.length==necessary_passive_bots){
      document.getElementById('btn_bots_selected').disabled = false;
    } else {
      document.getElementById('btn_bots_selected').disabled = true;
    }
  }