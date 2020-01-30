const fetch = require('node-fetch');

const AUTH_URL = 'http://819e7f03.ngrok.io';
const SERVER_NAME = 'Test Server';
const SERVER_URL = 'http://70e8a7cf.ngrok.io';

const checkAuthIsRunning = async (authUrl) => {
    try {
        const responseRaw = await fetch(`${authUrl}/servers`);
        return responseRaw.ok;
    } catch (err) {
        // Something went wrong, oh well...
    }
    return false;
};

const registerServer = ({ authUrl, name, url }) =>
    fetch(`${authUrl}/servers`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, url }),
    }).then((res) => res.json());

(async () => {
    const authIsRunning = await checkAuthIsRunning(AUTH_URL);
    if (!authIsRunning) {
        console.error(`Auth server is not reachable at url '${AUTH_URL}'`);
        return;
    }

    const {_id, accessKey, errmsg} = await registerServer({authUrl: AUTH_URL, name: SERVER_NAME, url: SERVER_URL});
    if (errmsg) {
        console.error(errmsg);
        return;
    }
    console.log(`Server (${SERVER_NAME}) registered with credentials:`);
    console.log(JSON.stringify({_id, accessKey}, null, 2));

    console.log('\nThe server can now be started with the following environment variables:');
    console.log(`SERVER_ID=${_id}`);
    console.log(`ACCESS_KEY=${accessKey}`);
    console.log(`AUTH_SERVER_URI=${AUTH_URL}`);

    console.log('\nAn admin user can then be created by running the createAdminUser.js script with the same environment variables.');
})();