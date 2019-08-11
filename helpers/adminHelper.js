const mongoose = require('mongoose');
const fetch = require('node-fetch');
const { authServerAddress } = require('../config/options');
const { accessKey } = require('../config/secrets');

require('../models/GoldenTicket');

const GoldenTicket = mongoose.model('GoldenTicket');

module.exports.generateTickets = count => fetch(`${authServerAddress}/servers/${process.env.SERVER_ID}/tickets`, {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    AccessKey: accessKey,
  },
  body: JSON.stringify({ count }),
}).then(response => response.json()).then(async (jsonResponse) => {
  await GoldenTicket.insertMany(jsonResponse.map(ticketNumber => ({ ticketNumber })));
  return jsonResponse;
}).catch((err) => {
  console.error(err);
});
