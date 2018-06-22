var path = require('path');
var logger = require('./logger');
const parse = require('./_parse');
const createApp = require('./_create');
const addEntities = require('./_entities');
const addIntents = require('./_intents');
const upload = require('./_upload');
const getApp = require('./get');

logger.writeLog ('logging', '************************************************************\n')
logger.writeLog ('logging', 'Started Application at: '+new Date()+'\n')
// Change these values
// Get from https://www.luis.ai/user/settings
const LUIS_programmaticKey = "638ee9aeb729407aa09215840a0cae05";
//Change App Name here
const LUIS_appName = "testApp";
const LUIS_appCulture = "en-us"; 
const LUIS_versionId = "0.1";
//const EXISTING_LUIS_APP_ID = "f0f85002-291a-4bed-bbbd-57d21188057f";//if luis app already exists, //add ID here

// NOTE: final output of add-utterances api named utterances.upload.json
const downloadFile = "./IoT.csv";
const uploadFile = "./utterances.json"

// The app ID is returned from LUIS when your app is created
var LUIS_appId = ""; // default app ID
var intents = [];
var entities = [];


/* add utterances parameters */
var configAddUtterances = {
    LUIS_subscriptionKey: LUIS_programmaticKey,
    LUIS_appId: LUIS_appId,
    LUIS_versionId: LUIS_versionId,
    inFile: path.join(__dirname, uploadFile),
    batchSize: 100,
    uri: "https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/{appId}/versions/{versionId}/examples"
};

/* create app parameters */
var configGetApp = {
    LUIS_subscriptionKey: LUIS_programmaticKey,
    LUIS_versionId: LUIS_versionId,
    appName: LUIS_appName,
    culture: LUIS_appCulture,
    uri: "https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/"
};

/* create app parameters */
var configCreateApp = {
    LUIS_subscriptionKey: LUIS_programmaticKey,
    LUIS_versionId: LUIS_versionId,
    appName: LUIS_appName,
    culture: LUIS_appCulture,
    uri: "https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/"
};

/* add intents parameters */
var configAddIntents = {
    LUIS_subscriptionKey: LUIS_programmaticKey,
    LUIS_appId: LUIS_appId,
    LUIS_versionId: LUIS_versionId,
    intentList: intents,
    uri: "https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/{appId}/versions/{versionId}/intents"
};

/* add entities parameters */
var configAddEntities = {
    LUIS_subscriptionKey: LUIS_programmaticKey,
    LUIS_appId: LUIS_appId,
    LUIS_versionId: LUIS_versionId,
    entityList: intents,
    uri: "https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/{appId}/versions/{versionId}/entities"
};

/* input and output files for parsing CSV */
var configParse = {
    inFile: path.join(__dirname, downloadFile),
    outFile: path.join(__dirname, uploadFile)
};

// Parse CSV
var appId="";
parse(configParse)
    .then((model) => {
        // Save intent and entity names from parse
        intents = model.intents;
        entities = model.entities;
        // Create the LUIS app
        return createApp(configCreateApp);

    }).then((appId2) => {
		appId=appId2;
        // Get the LUIS app
        return getApp(configGetApp);

    }).then((appId3) => {
		
		if(!appId.indexOf("-AlreadyExists"))
		{	
		appId =appId3;
		logger.writeLog ('logging', new Date()+ ': LUIS Model: '+LUIS_appName+' already exists\n')
		console.log(`Called getApp, App Already Exists with ID ${appId}`);
		}
		
        LUIS_appId = appId;
        configAddIntents.LUIS_appId = appId;
        configAddIntents.intentList = intents;
        return addIntents(configAddIntents);

    }).then(() => {
        // Add entities
        configAddEntities.LUIS_appId = LUIS_appId;
        configAddEntities.entityList = entities;
        return addEntities(configAddEntities);

    }).then(() => {
        // Add example utterances to the intents in the app
        configAddUtterances.LUIS_appId = LUIS_appId;
        return upload(configAddUtterances);

    }).catch(err => {
        console.log(err.message);
    });
