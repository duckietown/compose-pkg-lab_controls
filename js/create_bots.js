/////Moving bots on the map (temporary function until watchtowers give positions)
  function move_bots() {
    let map = document.getElementById("map");
    let canvas_height = map.clientHeight-18;
    let canvas_width = map.clientWidth-18;
    setInterval(exec_move, 10);
    function exec_move() {
      let ancestor = document.getElementById('duckie_list_body'), descendents = ancestor.children;
      for(let i=0; i<descendents.length; i++){
        try{
          let name = descendents[i].cells[0].innerHTML;
          if (bots_positions[name][2] !=0){
            let bot = document.getElementById("entity_"+name);
            if (bots_positions[name][0] <= 0) {
              bots_positions[name][2] = 1;
            }
            if (bots_positions[name][0] >= canvas_height) {
              bots_positions[name][2] = -1;
            }
            if (bots_positions[name][1] <= 0) {
              bots_positions[name][3] = 1;
            }
            if (bots_positions[name][1] >= canvas_width) {
              bots_positions[name][3] = -1;
            }
            bots_positions[name][0]+=bots_positions[name][2];
            bots_positions[name][1]+=bots_positions[name][3];
            bot.style.top = bots_positions[name][0] + 'px';
            bot.style.left = bots_positions[name][1] + 'px';
          }
        } catch{}
      }
      if (document.getElementById('info_content').style.display=="block"){
        document.getElementById('info_content').innerHTML="My name is: "+current_popup+"<br>My position is: "+bots_positions[current_popup];
      }
    }
  }
///// Add a new entity
  function add_bot(name){
    let tmp = document.getElementById("tab_"+name);
    //If bot already known, only update its ping
    if (tmp){
      tmp.cells[1].innerHTML = detected_pings[name]+" ms";
    } else {
      let new_div = document.createElement('div');
      new_div.id = "entity_"+name;
      if (name.substring(0,4)=="auto"){
        new_div.className="duckiebot";
        new_div.innerHTML=name.replace("autobot","");
      } else {
        new_div.className="watchtower";
        new_div.innerHTML=name.replace("watchtower","");
      }
      new_div.onclick= function() { highlightBot(name);
                                    document.getElementById('tab_'+name).scrollIntoView(true);};
      document.getElementById("bots").appendChild(new_div);
      if (new_div.className=="duckiebot"){
        bots_positions[name]=[Math.floor(Math.random()*300),Math.floor(Math.random()*300),1,1];
      } else {
        try{
          bots_positions[name]=[watchtower_pos[name][0],watchtower_pos[name][1],0,0];
          new_div.style.top = bots_positions[name][0] + 'px';
          new_div.style.left = bots_positions[name][1] + 'px';
        } catch {
          bots_positions[name]=[Math.floor(Math.random()*300),Math.floor(Math.random()*300),0,0];
          new_div.style.top = bots_positions[name][0] + 'px';
          new_div.style.left = bots_positions[name][1] + 'px';
        }
      }

      let table = document.getElementById("duckie_list_body");
      let row = table.insertRow();
      row.id = "tab_"+name;
      row.onclick=function() { highlightBot(name); };
      row.style.height = "30px";
      let cell0 = row.insertCell(0);
      let cell1 = row.insertCell(1);
      let cell2 = row.insertCell(2);
      cell0.innerHTML = name;
      cell2.onclick= function() { information_pop_up(name); };
      cell1.innerHTML = detected_pings[name]+" ms";
      cell2.innerHTML = "Open information window";
      if (bots_moving == false){
        bots_moving=true;
        move_bots();
      }
    }
  }

///// Remove an entity
  function remove_bot(name){
    document.getElementById("entity_"+name).remove();
    document.getElementById("tab_"+name).remove();
  }

/////Function to highlight different bots by clicking
  function highlightBot(name) {
    if (prev_name != name){
      document.getElementById('tab_'+name).style.backgroundColor="#ED9C27";
      document.getElementById('entity_'+name).style.backgroundColor="#ED9C27";
      try{
        document.getElementById('tab_'+prev_name).style.backgroundColor="";
        document.getElementById('entity_'+prev_name).style.backgroundColor="";
      }catch{}
    } else {
      if (document.getElementById('tab_'+name).style.backgroundColor=="rgb(237, 156, 39)"){
        document.getElementById('tab_'+name).style.backgroundColor="";
        document.getElementById('entity_'+name).style.backgroundColor="";
      } else {
        document.getElementById('tab_'+name).style.backgroundColor="#ED9C27";
        document.getElementById('entity_'+name).style.backgroundColor="#ED9C27";
      }
    }
    prev_name=name;
  }
