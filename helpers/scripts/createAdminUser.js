require('../../models/User');

const fetch = require('node-fetch');
const { generateTickets } = require('../adminHelper');
const authServerAddress = process.env.AUTH_SERVER_URI || 'https://skybunk-auth-dev.herokuapp.com';
const { mongoURI } = require('../../config/database');

const mongoose = require('mongoose');
const GoldenTicket = mongoose.model('GoldenTicket');
const User = mongoose.model('User');

const adminUser = {
    username: 'admin',
    password: 'admin',
    firstName: 'Admin',
    lastName: 'Admin',
};

const createUserOnAuth = ({ username, password, goldenTicket }) =>
    fetch(`${authServerAddress}/users`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({username, password, goldenTicket}),
    }).then((res) => res.json());

(async () => {
    if (!process.env.SERVER_ID) {
        console.error('process.env.SERVER_ID must be set');
        return;
    }
    if (!process.env.ACCESS_KEY) {
        console.error('process.env.ACCESS_KEY must be set');
        return;
    }
    if (!process.env.AUTH_SERVER_URI) {
        console.error('process.env.AUTH_SERVER_URI must be set');
        return;
    }

    await mongoose.connect(mongoURI);

    //Create a golden ticket
    const tickets = await generateTickets(1);

    // Create user on auth server
    const { errmsg } = await createUserOnAuth({ ...adminUser, goldenTicket: tickets[0] });
    if (errmsg) {
        console.error(errmsg);
        return;
    }

    // Create user locally (may be removed when/if auth server handles it instead)
    await User.create({ ...adminUser, goldenTicket: tickets[0], role: ['admin'] });
    await GoldenTicket.deleteOne({ ticketNumber: tickets[0] });

    await mongoose.disconnect();
})();