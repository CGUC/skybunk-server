require('../models/GoldenTicket');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const authServerAddress = process.env.AUTH_SERVER_URI || 'https://skybunk-auth-dev.herokuapp.com';
const { accessKey } = require('../config/secrets');

const GoldenTicket = mongoose.model('GoldenTicket');

function dispatchEmail(user, ticket, transporter) {
  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: user.email,
    subject: 'Welcome to Skybunk!',
    html: `
      <p>Hi ${user.name},</p>
      <h2>You have been invited to Skybunk on behalf of ${process.env.RESIDENCE_NAME}!</h2>
      <p>Skybunk is a social platform in order to facilitate community within University Residences. You can meet others in your residence,
      stay on top of important happenings, and organize events of your own.</p>
      <p>Please register using the following golden ticket: ${ticket}</p>
      <h4>Download the app!</h4>
      <p>Android: <a href="https://play.google.com/store/apps/details?id=com.grebel.skybunk&hl=en_CA">https://play.google.com/store/apps/details?id=com.grebel.skybunk&hl=en_CA</a><br></br>
      iOS: <a href="https://apps.apple.com/ca/app/skybunk/id1411727712">https://apps.apple.com/ca/app/skybunk/id1411727712</a><br></br>
      web: <a href="https://skybunk.xyz">skybunk.xyz</a></p>
    `,
  };

  return new Promise((resolve) => {
    transporter.sendMail(mailOptions, (err) => {
      const response = {
        errors: [],
        successes: 0,
      };

      if (err) {
        response.errors.push({ user: user.email, err });
      } else {
        response.successes = 1;
      }
      resolve(response);
    });
  });
}

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

module.exports.inviteUsers = async (users) => {
  let tickets = [];
  try {
    tickets = await module.exports.generateTickets(users.length);
  } catch (e) {
    return { errors: { err: 'Could not generate golden tickets.' } };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const promises = [];
  users.forEach((u, i) => {
    promises.push(dispatchEmail(u, tickets[i], transporter));
  });

  return Promise.all(promises).then(values => values.reduce((acc, val) => {
    acc.errors = [...acc.errors, ...val.errors];
    acc.successes += val.successes;
    return acc;
  }, { errors: [], successes: 0 }));
};
