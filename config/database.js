if (process.env.NODE_ENV !== 'local') {
  module.exports = {
    mongoURI: process.env.MONGO_URI,
  };
} else {
  module.exports = {
    mongoURI: 'mongodb://localhost/grapp-dev',
  };
}
