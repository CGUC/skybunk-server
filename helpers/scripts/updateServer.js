const fetch = require("node-fetch");
const inquirer = require("inquirer");

const NGROK_URL = "http://127.0.0.1:4040/api";

const LOCAL_SERVER_URL = "http://localhost:3001";

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

const promptForConfirmation = async (message, defaultValue = false) => {
  const { res } = await inquirer.prompt({
    type: "confirm",
    name: "res",
    message,
    default: defaultValue
  });
  return res;
};

const getExistingServers = async authUrl => {
  try {
    const responseRaw = await fetch(`${authUrl}/servers`);
    if (!responseRaw.ok) return null;
    const responseJSON = await responseRaw.json();
    return responseJSON.map(({ _id, url, name }) => ({ id: _id, url, name }));
  } catch (err) {
    // Something went wrong, oh well...
  }
  return null;
};

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
  let defaultUrl = authUrl.includes("localhost") ? LOCAL_SERVER_URL : null;
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

const updateServer = (authUrl, serverId, accessKey, updates) =>
  fetch(`${authUrl}/servers/${serverId}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      accessKey
    },
    body: JSON.stringify(updates)
  });

(async () => {
  if (!process.env.SERVER_ID) {
    console.error("process.env.SERVER_ID must be set");
    return;
  }
  if (!process.env.ACCESS_KEY) {
    console.error("process.env.ACCESS_KEY must be set");
    return;
  }
  if (!process.env.AUTH_SERVER_URI) {
    console.error("process.env.AUTH_SERVER_URI must be set");
    return;
  }

  console.log(`Fetching servers from ${process.env.AUTH_SERVER_URI}`);
  const servers = await getExistingServers(process.env.AUTH_SERVER_URI);
  if (!servers) {
    console.error("Could not fetch servers. Is AUTH_SERVER_URI set correctly?");
    return;
  }

  let { name, url } = servers.find(({ id }) => id === process.env.SERVER_ID);
  if (!name) {
    console.error(
      `Server with id ${process.env.SERVER_ID} not found. Is SERVER_ID correct?`
    );
    return;
  }

  console.log("Current info: {");
  console.log(`  name: '${name}`);
  console.log(`  url: '${url}'`);
  console.log("}");

  const updates = {};
  if (await promptForConfirmation("Change server name?")) {
    const newName = await promptForText("Enter new name: ", name);
    if (newName !== name) updates.name = newName;
  }

  if (await promptForConfirmation("Change server url?", true)) {
    const newUrl = await getServerUrl(
      process.env.AUTH_SERVER_URI,
      servers.map(({ url }) => url)
    );
    if (newUrl !== url) updates.url = newUrl;
  }

  if (updates) {
    console.log("Updating server information.");
    await updateServer(
      process.env.AUTH_SERVER_URI,
      process.env.SERVER_ID,
      process.env.ACCESS_KEY,
      updates
    );
    console.log("Done!");
  } else {
    console.log("No changes to be made.");
  }
})();
