
var date = require('date-fns')
const db = require('../config/database');
var Agenda = require('agenda')

async function setTimer (timestamp, id, callbackArgs, callback) {
	if(!date.isValid(new Date(timestamp))){
		console.error("Invalid timestamp in scheduler:" + timestamp)
		return;
	}

	const agenda = new Agenda({db: {address: db.mongoURI}});

	//wait for the define to process
	await new Promise(resolve => agenda.once('ready', resolve));

	//cancel any current timeouts with this id
	await agenda.cancel({name: id}, (err, numRemoved) =>{
		console.log("Removed " + numRemoved)
	})
	
	agenda.define(id, {unique: true}, (job, done) => {
		callback(callbackArgs);
	});

	

	await agenda.schedule(timestamp, id);
	await agenda.start();
}
module.exports = setTimer;