if (process.env.MONGO_URI) {
  module.exports = {
    mongoURI: process.env.MONGO_URI,
  };
} else {
  module.exports = {
    mongoURI: 'mongodb://localhost/grapp-dev',
  };
}
