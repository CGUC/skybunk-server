
const date = require('date-fns');
const Agenda = require('agenda');
const db = require('../config/database');

async function setTimer(timestamp, id, callbackArgs, callback) {
  if (!date.isValid(new Date(timestamp))) {
    console.error(`Invalid timestamp in scheduler:${timestamp}`);
    return;
  }

  const agenda = new Agenda({ db: { address: db.mongoURI } });

  // wait for the define to process
  await new Promise(resolve => agenda.once('ready', resolve));

  // cancel any current timeouts with this id
  await agenda.cancel({ name: id }, (err) => {
    if (err) console.error(err);
  });

  agenda.define(id, { unique: true }, () => {
    callback(callbackArgs);
  });

  await agenda.schedule(timestamp, id);
  await agenda.start();
}
module.exports = setTimer;
