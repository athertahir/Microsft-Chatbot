// node 7.x
// uses async/await - promises
var logger = require('./logger');
var rp = require('request-promise');
var fse = require('fs-extra');
var path = require('path');

var exists=false;

// main function to call
// Call Apps_get
var getApp = async (config) => {
    
        try {

            // get LUIS app ID
            var getAppPromise = callgetApp({
                uri: config.uri,
                method: 'GET',
                headers: {
                    'Ocp-Apim-Subscription-Key': config.LUIS_subscriptionKey
                },

            },config.appName);

            let results = await getAppPromise;

            // get app returns an app ID
			let appId="";
			if(exists)
			{
				//logger.writeLog ('logging', new Date()+ ': LUIS Model: '+config.appName+' already exists\n')
				appId = results; 
				//console.log(`Called getApp, App Already Exists with ID ${appId}`);
			}
			else
			appId="-NotExists";
            return appId;

    
        } catch (err) {
            console.log(`Error creating app:  ${err.message} `);
            throw err;
        }
    
    }

var callgetApp = async (options, name) => {
    try {

        var response; 
        if (options.method === 'POST') {
            response = await rp.post(options);
        } else if (options.method === 'GET') { 
            response = await rp.get(options);
        }

		//console.log(JSON.parse(response));
		response=JSON.parse(response);
		for(var i = 0; i < response.length; i++) {
				var obj = response[i];
				if(!obj.name.indexOf(name))
				{				
				exists=true;
				//console.log(obj.name+" - "+obj.id);
				return obj.id;
				}
		}
		exists=false;
        return "0000";

    } catch (err) {
		console.log(err);
		//if(err.message.indexOf("already exist")){}
		//else
			throw err;
    }
} 

module.exports = getApp;