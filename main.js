const electron = require('electron');
const fork = require('child_process').fork;
const exec = require('child_process').exec;
var powerOff = require('power-off');
const path = require('path');
const url = require('url');
const app = electron.app;
const {ipcMain} = require('electron');
var fs = require('fs');

var initial_odometer_count;
var last_left_blink_state = 0;
var last_right_blink_state = 0;
var previous_miles_this_trip = 0;
var arduino_thread_ready = true;
var backup_cam_on = false;

var proc; 

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;


function log_function (message) {
	console.log("main.js - " + String(message));
}

const processConfig = {
	silent: false // setting to true will disable arduino debug info to log
}

var hardware_process = fork('./arduino_reader.js', options=processConfig);

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
	//mainWindow.webContents.openDevTools() // uncomment this line to have the devtools window open by default

	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
	})
	
	log_function("Starting Backup Camera Process");
	proc = exec('mplayer -vf scale -zoom -xy 400 -input file=/home/pi/Display-Software/mplayer.settings  tv://device=/dev/video0');
	
	
}

function startWorker() {
	log_function("starting arduino");
	hardware_process.send("start");
	setInterval(function() {
		if (arduino_thread_ready) { 
			log_function("Asking arduino_reader for data");
			hardware_process.send("get");
			arduino_thread_ready = false;
		}
	}, 100);
}

function global_odo_load() {
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

// Listen for async message from renderer process
ipcMain.on('renderer-to-main', (event, arg) => {
	
});

function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

function intToBool(i) {
	if (i == 1) {
		return true;
	}
	else {
		return false
	}
}

// Fires on new data from the arduino_reader process
hardware_process.on('message', (m) => {	

	/*
		1. Read in the data from the Arduino (stored in arg m)
		2. Convert the data from the Arduino to the data to be displayed
		3. Store the odometer count to disk
		4. Fill the the display object
		5. Send the display object to the renderer
	*/
	
	var report_json = JSON.parse(m);
	
	log_function("Got JSON from arduino_reader: ");
	log_function(JSON.stringify(report_json));
	
	//log_function("Re-mapping arduino JSON for renderer");
	
	var miles_this_trip = report_json.f7;
	
	var odometer_count = initial_odometer_count + miles_this_trip;

	if (isNaN(odometer_count)) { // for some reason, newRotations is sometimes null, this prevents problems with these
		odometer_count = 0;
	}
	
	setOdometerCountToDisk(odometer_count); // commit this to disk often
	
	var rpm = precisionRound(report_json.f0, 0);
	var mph = precisionRound(report_json.f1, 0);
	var vbat = precisionRound(report_json.f2, 1);
	var oilp = precisionRound(report_json.f3, 0);
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
	
	var state_number_to_name = {0: "Combo", 1: "Auto Start", 2: "Running", 3: "Shutoff", 4: "Limbo"};
	var state = report_json.i2;
	var state_text = state_number_to_name[state]; 
	
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
		FUEL: fuel,	
		BATC: batc,							
		EGOL: egol,							
		EGOR: egor,							
		EBRK: ebrk,				
		RVRS: rvrs,
		
		LEFT: left,
		RIGHT: right,
		
		shutdown : shut_off_pi,				// to show the pi is going down
		error: report_json.error,			// alarm image
		state: state_text,
	};
		
	// send the remapped data to the renderer
	mainWindow.webContents.send('main-to-renderer', JSON.stringify(displayJSON));
	
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
			
			backup_cam_on = true;
		}
	}
	else {
		if (backup_cam_on == true) {
			log_function("Killing Backup Camera Process");
			proc.kill;
			backup_cam_on = false;
		}
	}
	
	//log_function("Sending JSON to renderer: ");
	//log_function(JSON.stringify(displayJSON));
	
	arduino_thread_ready = true;
});

function getOdometerCountFromDisk() {
	
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
	var json = { "count" : newCount }; 
	var json_string = JSON.stringify(json);
	fs.writeFileSync('odometer.json', json_string);
}