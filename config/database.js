if (process.env.NODE_ENV !== 'development') {
  module.exports = {
    mongoURI: process.env.MONGO_URI,
  };
} else {
  module.exports = {
    mongoURI: 'mongodb://localhost/grapp-dev',
  };
}
