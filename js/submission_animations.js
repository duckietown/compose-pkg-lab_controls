/////Add html for loading animation
  function add_loading(element){
    document.getElementById(element).onclick="";
    document.getElementById(element).innerHTML='<div class="lds-ring"><div></div><div></div><div></div><div></div></div>';
  }

/////Add html for success animation
  function add_success(element){
    document.getElementById(element).onclick="";
    document.getElementById(element).innerHTML='<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">\
                                                <circle  class="circle" fill="none" stroke="#73AF55" stroke-width="10" stroke-miterlimit="10" cx="65.1" cy="65.1" r="62.1"/>\
                                                <polyline class="check" fill="none" stroke="#73AF55" stroke-width="10" stroke-linecap="round" stroke-miterlimit="10" points="100.2,40.2 51.5,88.8 29.8,67.5 "/>\
                                                </svg>';
    current_substeps+=1;
    if (current_substeps==necessary_substeps){
      document.getElementById(current_button).disabled = false;
    }
  }

/////Add html for failure animation
  function add_failure(element){
    document.getElementById(element).innerHTML='<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">\
                                                <circle class="circle" fill="none" stroke="#D06079" stroke-width="10" stroke-miterlimit="10" cx="65.1" cy="65.1" r="62.1"/>\
                                                <line class="line" fill="none" stroke="#D06079" stroke-width="10" stroke-linecap="round" stroke-miterlimit="10" x1="34.4" y1="37.9" x2="95.8" y2="92.3"/>\
                                                <line class="line" fill="none" stroke="#D06079" stroke-width="10" stroke-linecap="round" stroke-miterlimit="10" x1="95.8" y1="38" x2="34.4" y2="92.2"/>\
                                                </svg>';
  }

/////Add html for waiting animation
  function add_waiting(element){
    document.getElementById(element).onclick="";
    document.getElementById(element).innerHTML='<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">\
                                                <circle class="path circle" fill="none" stroke="#7D7D7D" stroke-width="10" stroke-miterlimit="10" cx="65.1" cy="65.1" r="62.1"/>\
                                                </svg>';
  }
