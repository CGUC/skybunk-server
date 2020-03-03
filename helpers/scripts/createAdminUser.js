require('../../models/User');

const inquirer = require('inquirer');
const fetch = require('node-fetch');
const { generateTickets } = require('../adminHelper');
const authServerAddress = process.env.AUTH_SERVER_URI;
const { mongoURI } = require('../../config/database');

const mongoose = require('mongoose');
const GoldenTicket = mongoose.model('GoldenTicket');
const User = mongoose.model('User');

const promptForText = async ({ type = 'input', message, defaultValue, validate = () => true }) => {
    const { res } = await inquirer.prompt({
        type,
        name: 'res',
        message,
        default: defaultValue,
        validate
    });
    return res;
};

const getExistingUsers = async () => {
    const rawResponse = await fetch(`${authServerAddress}/users`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        }
    });
    return (await rawResponse.json()).map(({ username }) => username);
};

const buildAdminUser = async () => {
    let existingUsers;
    try {
        existingUsers = await getExistingUsers();
    } catch (err) {
        console.error(`An auth server does not appear to be running at '${authServerAddress}'`);
        return;
    }

    const validateUsername = (username) => !existingUsers.includes(username) || 'A user with that username already exists';
    const username = await promptForText({ message: 'Enter new username', validate: validateUsername });
    const password = await promptForText({ type: 'password', message: 'Enter password'});
    const firstName = await promptForText({ message: 'Enter first name:', defaultValue: 'Admin'});
    const lastName = await promptForText({ message: 'Enter last name:', defaultValue: 'Admin'});

    return { username, password, firstName, lastName };
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

    const adminUser = await buildAdminUser();
    if (!adminUser) return;

    console.log('Initializing MongoDB');
    await mongoose.connect(mongoURI);

    //Create a golden ticket
    console.log('Creating a golden ticket');
    const tickets = await generateTickets(1);

    // Create user on auth server
    console.log('Creating the user on auth server');
    const { errmsg } = await createUserOnAuth({ ...adminUser, goldenTicket: tickets[0] });
    if (errmsg) {
        console.error(errmsg);
        return;
    }

    // Create user locally (may be removed when/if auth server handles it instead)
    console.log('Creating user locally');
    await User.create({ ...adminUser, goldenTicket: tickets[0], role: ['admin'] });
    await GoldenTicket.deleteOne({ ticketNumber: tickets[0] });

    console.log('Disconnecting from MongoDB');
    await mongoose.disconnect();
    console.log('Finished. User created successfully');
})();