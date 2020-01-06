const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/secrets');
const mongoose = require('mongoose');
const User = mongoose.model('User');

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

  verifyAdmin(req, res, next) {
    const { user } = req;

    if (!user.role.includes('admin')) {
      res.sendStatus(403);
    } else {
      next();
    }
  },

  verifyPasswordResetToken(req, res, next) {
    const token = req.params.token;
    User.findOne({username: req.params.username}).then((user) => {
      if(user == undefined){
        res.status(400).json("No user found");
      } else if(req.body.username.toLowerCase() != user.username.toLowerCase()){
        res.status(403).json("Invalid username");
      }else if(token !== user.resetPasswordToken){
        res.status(403).json("Incorrect token");
      } else if(Date.now() > user.resetPasswordExpiration){
        res.status(403).json("Expired token");
      }else{
        //success!
        req.user = user;
        next();
      }
    }).catch((err) => {
      res.json(err);
    });
	},
};
