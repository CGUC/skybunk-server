const fetch = require("node-fetch");
const inquirer = require("inquirer");

const NGROK_URL = "http://127.0.0.1:4040/api";

const DEFAULT_AUTH_SERVER_URL = "https://skybunk-auth-dev.herokuapp.com";
const DEFAULT_SERVER_URL = "http://localhost:3001";
const DEFAULT_SERVER_NAME = "Test Server";

const promptForText = async (message, defaultValue, validate = () => true) => {
  const { res } = await inquirer.prompt({
    type: "input",
    name: "res",
    message,
    default: defaultValue,
    validate
  });
  return res;
};

const getAuthUrl = () =>
  promptForText("Enter auth server url:", DEFAULT_AUTH_SERVER_URL);

const getServerName = () =>
  promptForText("Enter new server name:", DEFAULT_SERVER_NAME);

const getTunnel = async () => {
  try {
    const responseRaw = await fetch(`${NGROK_URL}/tunnels`);
    if (responseRaw.ok) {
      return (await responseRaw.json()).tunnels.find(
        ({ proto }) => proto === "https"
      );
    }
  } catch (err) {
    // Could not reach ngrok
  }
  return null;
};

const getServerUrl = async (authUrl, existingServers) => {
  let defaultUrl = authUrl.includes("localhost") ? DEFAULT_SERVER_URL : null;
  let tunnel = await getTunnel();
  if (!tunnel) {
    console.log("An ngrok tunnel does not appear to be running.");
    console.log(
      "You can start a tunnel with the following command if desired:"
    );
    console.log(" $ ngrok http <skybunk-server-port>");

    // Wait for user, then try again
    await promptForText("Press enter to continue...");
    tunnel = await getTunnel();
  }
  if (tunnel) defaultUrl = tunnel.public_url;
  const validate = value =>
    !existingServers.includes(value) ||
    "A Server with this url already exists, try again";
  return promptForText("Enter server url:", defaultUrl, validate);
};

const getExistingServers = async authUrl => {
  try {
    const responseRaw = await fetch(`${authUrl}/servers`);
    if (!responseRaw.ok) return null;
    const responseJSON = await responseRaw.json();
    return responseJSON.map(({ url }) => url);
  } catch (err) {
    // Something went wrong, oh well...
  }
  return null;
};

const registerServer = ({ authUrl, name, url }) =>
  fetch(`${authUrl}/servers`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, url })
  }).then(res => res.json());

(async () => {
  const authUrl = await getAuthUrl();

  const listOfServers = await getExistingServers(authUrl);
  if (listOfServers === null) {
    console.error(`Auth server is not reachable at url '${authUrl}'`);
    return;
  } else {
    console.log(`Auth server is running at url '${authUrl}'`);
  }

  const name = await getServerName();
  const url = await getServerUrl(authUrl, listOfServers);

  const { _id, accessKey, errmsg } = await registerServer({
    authUrl,
    name,
    url
  });
  if (errmsg) {
    console.error(errmsg);
    return;
  }
  console.log(
    `Server (${name}) registered with credentials (DON'T LOSE THEM):`
  );
  console.log(JSON.stringify({ _id, accessKey }, null, 2));

  console.log(
    "\nThe server can now be started with the following environment variables:"
  );
  console.log(`SERVER_ID=${_id}`);
  console.log(`ACCESS_KEY=${accessKey}`);
  console.log(`AUTH_SERVER_URI=${authUrl}`);

  console.log(
    "\nAn admin user can then be created by running the createAdminUser.js script with the same environment variables."
  );
})();
