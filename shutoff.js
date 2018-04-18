var powerOff = require('power-off');
 
powerOff( function (err, stderr, stdout) {
    if(!err && !stderr) {
        console.log(stdout);
    }
});