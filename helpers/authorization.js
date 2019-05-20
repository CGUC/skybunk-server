const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/secrets');

module.exports = {
  verifyToken(req, res, next) {
    const bearerHeader = req.headers.authorization;

    if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      const token = bearer[1];
      req.token = token;
      jwt.verify(token, jwtSecret, (err, data) => {
        if (err) {
          res.sendStatus(403);
        } else {
          req.user = data.user;
        }
      });
      next();
    } else {
      res.sendStatus(403);
    }
  },
};
