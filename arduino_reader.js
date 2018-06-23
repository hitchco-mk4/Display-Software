var SerialPort = require('serialport');
var serialport_path = "/dev/serial0";
var serialport_baud = 9600
var port;

var block_size = 64;

var block_json = {}; // this is the JSON object that is to be sent back to the main process

var arduino_ready = false;
var serial_error_count = 0;

function log_function (message) {
	// console.log("arduino.js - " + String(message));
}

function calc_crc(preCRC) {
	var CRC = 0;
	for (var i in preCRC) {
		CRC = (CRC + preCRC[i]) % 256; 
	}
	return CRC;
}

function write_drain(port, data, error) {
  port.write(data, function () {
    port.drain(error);
  });
}

// process a message from the parent process
function process_message(m) {
	
	log_function("Got " + m + " from parent");
	
	switch(m) {
		
		case "get":
							 
			if (arduino_ready) {
				
				var message_bytes = ['0'];
				
				write_drain(port, message_bytes, error);

				log_function("Sent message to arduino: [" + String(message_bytes) + "]");
				
				serial_error_count = 0;
				
				arduino_ready = false;
			}
			else {
				log_function("Still waiting for last response, [" + String(serial_error_count) + "] waits");
				serial_error_count++;
				
				if (serial_error_count > 5) {
					log_function("Big Problem");
					
					clear_port();
					
					block_json.error = true;
					arduino_ready = true;
				}
			}
			
			process.send(JSON.stringify(block_json));
			
			break;
		
		case "start":
					
			block_json.f0 = 0;
			block_json.f1 = 0;
			block_json.f2 = 0;
			block_json.f3 = 0;
			block_json.f4 = 0;
			block_json.f5 = 0;
			block_json.f6 = 0;
			block_json.f7 = 0;
			block_json.f8 = 0;
			block_json.f9 = 0;
			block_json.f10 = 0;
			block_json.f11 = 0;
			
			block_json.i0 = 0;
			block_json.i1 = 0;
			block_json.i2 = 0;
			block_json.i3 = 0;
			
			block_json.b0 = 0;
			block_json.b1 = 0;
			block_json.b2 = 0;
			block_json.b3 = 0;
			block_json.b4 = 0;
			block_json.b5 = 0;
			block_json.b6 = 0;
			
			block_json.error = true;
			

			function new_serialport() {
				
				log_function("Starting Serial Port at [" + serialport_path + "] @ [" + serialport_baud.toString() + "] baud");
				try {
					if (port.isOpen) {
						port.close();
						arduino_ready = false;
					}	
				} 
				catch (e) {
					
				}
				
				port = new SerialPort(serialport_path, {
					  parser: SerialPort.parsers.byteLength(block_size),
					  baudRate: serialport_baud
				});	
				
				log_function("Serial Port Created [" + String(port) + "]");
			}
			
			new_serialport();
			
			function error(err) {
				if (err) {
					log_function('Error on write: ' +  String(err.message));
				}
			}
			
			function clear_port(){
				port.flush();
				port.drain(error);
			}
			
			// The open event is always emitted
			port.on('open', function() {
				log_function("Serial Port [" + String(port) + "] opened successfully");
				log_function("Now waiting for ready byte");
				arduino_ready = true;
			});
			
			// open errors will be emitted as an error event 
			port.on('error', function (error){
				log_function("Serial port got error " + String(error));
			});

			// fires whenever data arrives on the input buffer
			port.on('data', function (data) {
				
				log_function("Got a message back from the Arduino: [" + String(data) + "]");
				
				var incoming_crc = data.slice(63,64).readUInt8();
				var buffer_as_numbers = [];
				
				for (var i = 0; i < block_size - 1; i++) {
					buffer_as_numbers.push(data.slice(i,i+1).readUInt8());
				}
				
				log_function("Raw Bytes " + String(buffer_as_numbers));
				
				var calculated_crc = calc_crc(buffer_as_numbers);
				
				var crc_pass = incoming_crc == calculated_crc;
				
				log_function("Incoming CRC " + String(incoming_crc));
				log_function("Calculated CRC " + String(calculated_crc));
				
				if (crc_pass) {
					
					var f0 = data.slice(0,4).readFloatLE();
					var f1 = data.slice(4,8).readFloatLE();
					var f2 = data.slice(8,12).readFloatLE();
					var f3 = data.slice(12,16).readFloatLE();
					var f4 = data.slice(16,20).readFloatLE();
					var f5 = data.slice(20,24).readFloatLE();
					var f6 = data.slice(24,28).readFloatLE();
					var f7 = data.slice(28,32).readFloatLE();
					var f8 = data.slice(32,36).readFloatLE();
					var f9 = data.slice(36,40).readFloatLE();
					var f10 = data.slice(40,44).readFloatLE();
					var f11 = data.slice(44,48).readFloatLE();
					
					var i0 = data.slice(48,50).readInt16LE();
					var i1 = data.slice(50,52).readInt16LE();
					var i2 = data.slice(52,54).readInt16LE();
					var i3 = data.slice(54,56).readInt16LE();
					
					var b0 = data.slice(56,57).readUInt8();
					var b1 = data.slice(57,58).readUInt8();
					var b2 = data.slice(58,59).readUInt8();
					var b3 = data.slice(59,60).readUInt8();
					var b4 = data.slice(60,61).readUInt8();
					var b5 = data.slice(61,62).readUInt8();
					var b6 = data.slice(62,63).readUInt8();
					
					block_json.f0 = f0;
					block_json.f1 = f1;
					block_json.f2 = f2;
					block_json.f3 = f3;
					block_json.f4 = f4;
					block_json.f5 = f5;
					block_json.f6 = f6;
					block_json.f7 = f7;
					block_json.f8 = f8;
					block_json.f9 = f9;
					block_json.f10 = f10;
					block_json.f11 = f11;

					block_json.i0 = i0;
					block_json.i1 = i1;
					block_json.i2 = i2;
					block_json.i3 = i3;

					block_json.b0 = b0;
					block_json.b1 = b1;
					block_json.b2 = b2;
					block_json.b3 = b3;
					block_json.b4 = b4;
					block_json.b5 = b5;
					block_json.b6 = b6;
					
					log_function("CRC Passed!");
					
				}
				
				else {
					log_function("CRC Failed!");
					clear_port();
				}
				
				block_json.error = !crc_pass;
				
				arduino_ready = true;
			});
			
			break;
	}
}

process.on('message', (m) => {
	process_message(m)
});