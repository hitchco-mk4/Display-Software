const electron = require('electron');
const fork = require('child_process').fork;
const exec = require('child_process').exec;
const exec_sync = require('child_process').execSync;
var powerOff = require('power-off');
const path = require('path');
const url = require('url');
const app = electron.app;
const {ipcMain} = require('electron');
var fs = require('fs');

var initial_odometer_count;
var previous_miles_this_trip = 0;

var arduino_thread_ready = true;

var backup_cam_on = true;
var making_window_change = false; 

var last_print_time = 0;


const BrowserWindow = electron.BrowserWindow; // Module to create native browser window.

const processConfig = {
	silent: false // setting to true will disable arduino debug info to log
}

var hardware_process = fork('./arduino_reader.js', options=processConfig);

function log_function(message) {
	// wraps log messages so messages from each file can be distinguished
	
	console.log("main.js - " + String(message));
}

function run_command_get_output(command) {
	// runs a command line command and returns it's output, can raise errors
	
	return exec_sync(command).toString().trim();
}

function start_backup_camera() {
	// launches the mplayer process that streams the backup camera
	
	exec('mplayer -framedrop  -vf mirror -xy 600 -input file=/home/pi/Display-Software/mplayer.settings  tv://device=/dev/video0:width=300:height=220');
}

function stop_backup_camera(){
	// force-kills the backup camera process
	
	exec('killall mplayer');
}

function is_mplayer_running() {
	// checks to see if mplayer is running, pgrep returns an error pipe if the name isn't found
	
	var output = false;
	
	try {
		if (run_command_get_output('pgrep -x "mplayer"') > 0) {
			output = true;
		}
	}
	
	catch(error){
		// do nothing, command failed so no mplayer
	}
	
	return output;
}

function createWindow () {
	// Create the browser window.

	var windowConfig = { width: 800, height: 480 };
	
	mainWindow = new BrowserWindow(windowConfig);

	// and load the index.html of the app.
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}))
	
	mainWindow.setFullScreen(true); // make the app full screen

	//Open the DevTools.
	// mainWindow.webContents.openDevTools() // uncomment this line to have the devtools window open by default

	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
	})
	
	log_function("Starting Backup Camera Process");
		
	// start a process to make sure the true state of the cam window matches the one this software thinks it is
	
	start_backup_camera();
	
	setInterval(function(){ // this interval makes sure the camera is running correctly
		if (making_window_change == false) {
			var true_state;
			
			var current_window_name = get_current_window();
			
			if (current_window_name == "MPlayer") {
				true_state = true;
			}
			else if (current_window_name == "car-HUD") {
				true_state = false;
			}
			
			if (true_state != backup_cam_on) {
				backup_cam_on = true_state;
				log_function("Internal camera state corrected");
			}
		}
		
		// the following commented block is a design decision. MPlayer streaming from a USB camera is unstable on a Raspberry Pi and often crashes. However, when it restarts, the window briefly pops over the UI, obscuring it from the driver. So, MPlayer should only be re-started when the backup camera is on, but it may take a long time to do this is MPlayer has previously crashed. If the operator is willing to have the UI obscured for a fast-acting backup camera, the following block should be uncomment.
		
		/*
		if (is_mplayer_running() == false) {
			log_function("Mplayer has crashed! Restarting");
			start_backup_camera();
		}
		*/
		
	}, 1000);
}

function startWorker() {
	// starts asking the arduino_reader for data
	
	log_function("starting arduino");
	hardware_process.send("start");
	setInterval(function() {
		if (arduino_thread_ready) { 
			hardware_process.send("get");
			arduino_thread_ready = false;
		}
	}, 100);
}

function global_odo_load() {
	// loads the odometer count from disk into the global variable in this file
	
	initial_odometer_count = getOdometerCountFromDisk(); // read in the previous odometer count from disk
}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);
app.on('ready', global_odo_load);
app.on('ready', startWorker);


// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

function precisionRound(number, precision) {
	// a standard rounding function used a few times in this file

	var factor = Math.pow(10, precision);
	return Math.round(number * factor) / factor;
}

function intToBool(i) {
	// convert an int representation of a bool to an actual bool 
	
	if (i == 1) {
		return true;
	}
	else {
		return false
	}
}

function get_current_window() {
	// return the name of the currently active X11 window in the OS
	
	while (true) {
		try {
			return run_command_get_output('xdotool getactivewindow getwindowname');
		}
		catch(error){
			log_function("Get current window has failed! Retrying");
		}
	}
}

function wait_for_window(window_name, on_pass, on_fail) {
	// wait for a given window name to appear active, run on_pass if it happens, run on_fail if it doesn't
	
	log_function("Waiting for window [" + window_name + "] to be on top");
	
	var maxcounts = 30;
	var count = 0; 
	
	var interval = setInterval(function(){
		
		result = get_current_window();
		
		if (result == window_name) {
			log_function("Window [" + window_name + "] on top");
			clearInterval(interval);
			on_pass();
		}
		else {
			log_function("Window [" + window_name + "] wasn't top, top window [" + result + "] Attempt [" + String(count) + "/" + String(maxcounts) + "]");
		}
		
		count++;
		if (count >= maxcounts)
		{
			clearInterval(interval); // stops running the command
			on_fail();
		}
	}, 100);	
}

function window_change(switch_from, switch_to, no_switch_from, switch_function, switch_to_shown, no_switch_to) {
	// switches the top window in the os from `switch_from` to `switch_to` using `switch_function`.
	// if `switch_from` isn't the top window when this is called, `no_switch_to` will be executed.
	// when `switch_to` becomes the top window, `switch_to_shown` will be executed.
	// if the function times out, and `switch_to` isn't shown `no_switch_to` will be executed.
	// `making_window_change` is used to make sure that only one process can be in here at a time. 
	
	if (making_window_change == false){
		making_window_change = true;
		wait_for_window(
			switch_from, 
			function() {
				switch_function();
				wait_for_window(
					switch_to, 
					function(){
						switch_to_shown();
						making_window_change = false;
					},
					function(){
						no_switch_to();
						making_window_change = false;
					}
				);
			},
			function(){
				no_switch_from();
				making_window_change = false;
			}
		);
	}
	else {
		log_function("Only one change at a time");
	}
}

function hide_backup_camera() {
	// hides the backup camera window, destroys the process if it doesn't go away
	
	log_function("-- Trying to hide MPlayer --");
	
	window_change(
	
		"MPlayer", 
		
		"car-HUD",
		
		function(){
			log_function("MPlayer couldn't be hidden because it was never on top");
		},
		
		function(){
			log_function("Minimizing MPlayer window");
			exec('xdotool windowminimize $(xdotool search --class "MPlayer")');
		}, 
		
		function() {
			log_function("MPlayer Hidden");
		},
		
		function() {
			log_function("Couldn't hide MPlayer, manually killing process");
			stop_backup_camera();
		}
	);
}

function show_backup_camera() {
	// shows the backup camera window, destroys and then restarts the process if it doesn't show up
	
	log_function("-- Trying to show MPlayer --");
	
	window_change(
	
		"car-HUD", 
	
		"MPlayer",
	
		function(){
			log_function("MPlayer couldn't be shown because car-HUD was never on top");
		},
		
		function() {
			log_function("Showing MPlayer window");
			exec('xdotool windowactivate $(xdotool search --class "MPlayer")');
		}, 
		
		function() {
			log_function("MPlayer Activated");
		},
		
		function() {
			log_function("Couldn't show MPlayer, restarting process");
			start_backup_camera();
		}
	);
}

function getOdometerCountFromDisk() {
	// read the odometer count stored in odometer.json from disk
	
	var count = 0; 
	
	try {
		file = fs.readFileSync('odometer.json', 'utf8');
		json = JSON.parse(file);
		count = json.count;
	}
	catch(err) { // will throw an error on the first run because the file shouldn't exist
		count  = 0;
	}
	
	return count;
}

function setOdometerCountToDisk(newCount) {
	// set the odometer count stored in odometer.json on disk
	
	var json = { "count" : newCount }; 
	var json_string = JSON.stringify(json);
	fs.writeFileSync('odometer.json', json_string);
}

hardware_process.on('message', (m) => {	
	// Fires on new data from the arduino_reader process

	/*
		1. Read in the data from the Arduino (stored in arg m)
		2. Convert the data from the Arduino to the data to be displayed
		3. Store the odometer count to disk
		4. Fill the the display object
		5. Print display object 
		6. Send the display object to the renderer
		7. Handle potential backup camera problems
	*/
	
	var report_json = JSON.parse(m);
		
	var miles_this_trip = report_json.f7;
	
	if (miles_this_trip > 0) {
		var odometer_count = initial_odometer_count + miles_this_trip;
	}
	
	if (isNaN(odometer_count)) { // for some reason, newRotations is sometimes null, this prevents problems with these
		odometer_count = 0;
	}
	else if (odometer_count == null) {
		odometer_count = 0;
	}
	else if (odometer_count === undefined){
		odometer_count = 0;
	}
	else if (odometer_count == undefined){
		odometer_count = 0;
	}
	else if (typeof odometer_count == "undefined") {
		odometer_count = 0;
	}

	setOdometerCountToDisk(odometer_count); // commit this to disk often
	
	var rpm = precisionRound(report_json.f0, 0);
	var mph = precisionRound(report_json.f1, 0);
	var vbat = precisionRound(report_json.f2, 1);
	var oilp = precisionRound(report_json.f3, 0);
	var oill = precisionRound(report_json.f9, 0);
	var fuel = precisionRound(report_json.f4, 0);
	var egol = precisionRound(report_json.f5, 2);
	var egor = precisionRound(report_json.f6, 2);
	var batc = precisionRound(report_json.f8, 1);
	var ect = precisionRound(report_json.i0, 0); 
	var act = precisionRound(report_json.i1, 0);
	var ebrk = intToBool(report_json.b0);
	var rvrs = intToBool(report_json.b1);
	var shut_off_pi = intToBool(report_json.b2); 
	var left = intToBool(report_json.b3);
	var right = intToBool(report_json.b4);
	var error = intToBool(report_json.error);
	
	var light = intToBool(report_json.b5);
	var clutch = intToBool(report_json.b6);
	
	var state_number_to_name = {0: "Combo", 1: "Auto Start", 2: "Running", 3: "Shutoff", 4: "Limbo"};
	var state = report_json.i2;
	var state_text = state_number_to_name[state]; 
	
	var clutch = intToBool(report_json.b5);
	
	var night_mode = false;
	
	if (report_json.i3 < 600) {
		night_mode = true;
	}
	
	var lite = intToBool(report_json.b6);
	
	// if the car us not running, these values will not be accurate, so set them to zero
	if (state != 2) {
		ect = 0;
		act = 0;
		egol = 0;
		egor = 0;
		batc = 0;
	}
	
	var odo = precisionRound(odometer_count, 2); 
	
	var displayJSON = {
		
		RPM: rpm,
		MPH: mph,
		odometerValue: odo,		
		VBAT: vbat,							
		ECT: ect,							
		ACT: act,							
		OILP: oilp,	
		OILL: oill,
		FUEL: fuel,	
		BATC: batc,							
		EGOL: egol,							
		EGOR: egor,							
		EBRK: ebrk,				
		RVRS: rvrs,
		
		LEFT: left,
		RIGHT: right,
		
		LIGHT: light,
		CLUTCH: clutch,
		
		night: night_mode, 
		
		shutdown : shut_off_pi,
		error: error,
		state: state_text
	};
		
	// send the remapped data to the renderer
	mainWindow.webContents.send('main-to-renderer', JSON.stringify(displayJSON));
	
	// print the data if enough time has gone by
	var now = new Date().getTime();
	
	if (now - last_print_time > 1000) { // every 5 seconds
		log_function(JSON.stringify(displayJSON, null, 2));
		last_print_time = now;
	}
	
	if (shut_off_pi) {
		
		log_function("Shutting off pi");
		
		powerOff( function (err, stderr, stdout) {
			if(!err && !stderr) {
				console.log(stdout);
			}
		});
		
		log_function("Pi didn't shut off! ");
	}
	
	if (rvrs) {
		if (backup_cam_on == false) {
			show_backup_camera();
			backup_cam_on = true;
		}	
	}
	else {
		if (backup_cam_on == true) {
			hide_backup_camera();
			backup_cam_on = false; 
		}
	}

	if (error) {
		log_function("Arduino Error");
	}
		
	arduino_thread_ready = true;
	
});

ipcMain.on('renderer-to-main', (event, arg) => {
	// Listen for async message from renderer process
	// nothing here now
});