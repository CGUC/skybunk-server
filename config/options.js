let authServerAddress = 'https://skybunk-auth-dev.herokuapp.com';

if (process.env.AUTH_SERVER_URI) {
  authServerAddress = process.env.AUTH_SERVER_URI;
}

module.exports = {
  postCharacterLimit: 1000,
  commentCharacterLimit: 500,
};
