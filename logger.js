function writeLog (filename, data) {
	
	const fs = require('fs');
	fs.appendFile(filename+'.txt', data, function (err) {
	  if (err) console.log('Error in logging: '+err);
	  //console.log('Saved!');
	});

    }
module.exports.writeLog = writeLog;