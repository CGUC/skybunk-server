if (process.env.NODE_ENV === "production") {
  module.exports = {
    jwtSecret: process.env.JWT_SECRET,
    accessKey: process.env.ACCESS_KEY
  };
} else {
  module.exports = {
    jwtSecret: "supersecretsecret",
    accessKey: process.env.ACCESS_KEY
  };
}
