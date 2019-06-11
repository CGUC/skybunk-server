const mongoose = require('mongoose');
const { authServerAddress } = require('../config/options');
const fetch = require("node-fetch");

require('../models/GoldenTicket');
const GoldenTicket = mongoose.model('GoldenTicket');

module.exports.generateTickets = (count) => {
  return fetch(`${authServerAddress}/servers/${process.env.SERVER_ID}/tickets`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({count})
  }).then(response => response.json()).then(async jsonResponse => {
    await GoldenTicket.insertMany(jsonResponse.map(ticketNumber => {return {ticketNumber}}));
    return jsonResponse;
  }).catch(err => {
    console.error(err);
  });
}