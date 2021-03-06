/////Define variables
  //Bots are moving
  // let bots_moving = false;
  //Array of bot positions (and movements, only temporary)
  let bots_positions = {};
  //Current Popup name
  let current_popup;
  //Previous highlighted entity
  let prev_name = "";
  //Currently selected submission id
  let selected_sub_id = "";
  //Flag for currently running submission
  let submission_evaluating = false;
  //Array of active bots
  let active_bots = [];
  //Array of passive bots
  let passive_bots = [];
  //Array of all the bots (active and passive) running in the submissions
  let submission_bots = [];
  //Needed active bots
  let necessary_active_bots = -1;
  //Needed passive bots
  let necessary_passive_bots = -1;
  //Detected pings
  let detected_pings = {};
  //Necessary job substeps to procede to the next Step
  let necessary_substeps = 0;
  //Currently successfully executed jobsteps
  let current_substeps = 0;
  //Currently disabled job button
  let current_button = "";
  //Loop the current submission should be run in
  let current_submission_loop = "";
  //Container to use in the current submission 
  let current_submission_container = "";
  //Agents necessary to run the submissions
  let agent_list = [];
  //List of currently running ajax requests
  let ajax_list = {};
  // Timestamp at start of logging
  let start_timestamp = 0;
  // Timestamp at stop of logging
  let stop_timestamp = 0;
  //List of emergency stop publishers
  let pub_emergency_stop = {}
  //List of subscribers to check if the autobot is ready to move
  let sub_ready_to_move = {}
  //List of autobot readiness to move
  let i_am_ready = {}
  //List of autobot camera subscribers
  let sub_duckiebot_cameras = {}
  //Interval object to ping the server for new submissions
  let job_server_interval=null;
  //Object to store information to be written into the logfile
  let logging_object = {};
  //Array of entities to be called in docker maintenance
  let docker_hosts = [];
  //Needed to enable shift clicking inside the docker host selection for docker maintenance
  let last_clicked_docker_host = "";
  //Logging bag name
  let logging_bag_name = "";
  //Logging bag mount directory
  let logging_bag_mount = "";
  //Current demo to be run on duckiebots
  let current_demo = "";
  //Interval to check if bag processing is done
  let check_process_interval=null;
  //Interval to check if bag processing is done
  let check_localization_interval=null;
  //Flag to start blinking the start button when all bots are ready
  let all_bots_ready = false;
  //Camera ros subscriber
  let ip_cam_subscriber_interval = null;
  // Object to store the current lux values
  let current_lux = {};
  //Object to store aws_config information
  let aws_config = {};
  //Object to store ipfs hashes
  let ipfs_hashes = {};
  //Object to store s3 hashes
  let uploaded_s3 = {};
  //ID of the currently evaluating job
  let job_id = 0;
  //Distance in meters driven during the submission
  let submission_dist = 0;