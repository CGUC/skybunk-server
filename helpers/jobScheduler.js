
var date = require('date-fns')
const db = require('../config/database');
var Agenda = require('agenda')

async function setTimer (timestamp, id, callbackArgs, callback) {
	const agenda = new Agenda({db: {address: db.mongoURI}});
	if(!date.isValid(new Date(timestamp))){
		console.error("Invalid timestamp in scheduler:" + timestamp)
		return;
	}
	agenda.define(id, (job, done) => {
		callback(callbackArgs);
	});

	//wait for the define to process
	await new Promise(resolve => agenda.once('ready', resolve));

	await agenda.schedule(timestamp, id);
	await agenda.start();
}
module.exports = setTimer;