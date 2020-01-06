require('../models/User');
require('../models/GoldenTicket');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { jwtSecret } = require('../config/secrets');
const { verifyToken, verifyPasswordResetToken } = require('../helpers/authorization');
// const setTimer = require('../helpers/jobScheduler');

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();
const User = mongoose.model('User');
const GoldenTicket = mongoose.model('GoldenTicket');

// Return all users
router.get('/', verifyToken, (req, res) => {
  User.find().select('-password -notificationTokens -notifications').then((users) => {
    res.json(users);
  });
});

// Get specific user
router.get('/user/:id', verifyToken, (req, res) => {
  User.findOne({ _id: req.params.id }).select('-password -notificationTokens -notifications').then((user) => {
    res.json(user);
  }).catch((err) => {
    res.json(err);
  });
});

// Start password reset process by sending email
router.post('/reset', (req, res) => {
  var query;
  const body = req.body;

  //query by name or by username
  if(body.username != undefined && body.username != ''){
    query = {username: body.username};
  }else if(body.lastName != undefined && body.firstName !=undefined && body.lastName != '' && body.firstName !=''){
    query = {firstName: body.firstName, lastName: body.lastName};
  }else{
    res.status(400).json("No user found");
    return;
  }

  User.findOne(query).then((user) => {
    if(user == undefined){
      res.status(400).json("No user found");
      return;
    }
    if(user.info.email != undefined && user.info.email != '' && user.info.email.toLowerCase() != body.email.toLowerCase()){
      //given email does not match stored email, so return forbidden
      res.status(403).json("Given email is invalid");
      return;
    } else{
      //either given email matches, or no email is on file
      user.sendPasswordResetEmail(body.email).then((response) => {
        res.json(response);
      })
      .catch((err) =>{
        console.error(err)
        res.status(400).json(err);
      });
    }
  }).catch((err) => {
    console.error(err);
    res.json(err);
  });
});

//Reset password from reset password link
router.post('/reset/:username/:token', verifyPasswordResetToken, (req, res) => {
  const user = req.user;
  user.changePassword(req.body.password).then((password) => {
    res.json(password);
  }).catch((err) => {
    res.json(err);
  });
});

// Creates a user
router.post('/', (req, res) => {
  GoldenTicket.verifyTicket(req.body.goldenTicket).then((ticket) => {
    if (ticket) {
      User.create(req.body).then((user) => {
        GoldenTicket.deleteOne({ _id: ticket.id }).then(() => {
          res.json(user);
        });
      }).catch((err) => {
        res.json(err);
      });
    } else {
      res.status(400).json({ message: 'No valid golden ticket provided' });
    }
  }).catch((err) => {
    res.json(err);
  });
});

// Deletes a user
router.delete('/:id', verifyToken, (req, res) => {
  if (!req.user.role.includes('admin') && req.params.id !== req.user._id) {
    res.status(403);
  } else {
    User.deleteOne({ _id: req.params.id })
      .then(() => {
        res.status(200).send('success');
      }).catch((err) => {
        res.status(404).json(err);
      });
  }
});

// Updates a user
router.put('/:id', verifyToken, (req, res) => {
  if (!req.user.role.includes('admin') && req.params.id.toString() !== req.user._id.toString()) {
    res.status(403);
    return;
  }

  User.findOne({ _id: req.params.id }).then((user) => {
    user.update(req.body).then((user) => {
      res.json(user);
    }).catch((err) => {
      res.json(err);
    });
  }).catch((err) => {
    res.status(404).json(err);
  });
});

// Changes a user password
router.post('/:id/password', verifyToken, (req, res) => {
  if (req.params.id.toString() !== req.user._id.toString()) {
    res.status(403);
    return;
  }

  User.findOne({ _id: req.user._id }).then((user) => {
    user.changePassword(req.body.password).then((password) => {
      res.json(password);
    }).catch((err) => {
      res.json(err);
    });
  }).catch((err) => {
    res.status(404).json(err);
  });
});

// Changes a don's information (only accessible by dons)
router.post('/:id/doninfo', verifyToken, (req, res) => {
  if (!req.user.role || !req.user.role.includes('don')) {
    console.error(`User ${req.user._id}is requesting don info when user is not a don`);
    // requestor is not a don
    res.status(403);
  } else {
    User.findOne({ _id: req.params.id }).then((user) => {
      if (!user.role || !user.role.includes('don')) {
        // user is not a don
        res.status(400);
      } else {
        user.donInfo = req.body;
        user.update(user);
        // set timer to turn off don automagically
        /* if(user.donInfo.isOn){
          setTimer(user.donInfo.clockOut, user._id.toString(), {},() =>{
            User.findOne({_id: user._id}).then(user => {
              if(user.donInfo){
                user.donInfo.isOn = false;
                user.update(user);
              }
            }).catch(err => {
              console.error(err)
            })
          });
        } */
        res.json(user.donInfo);
      }
    }).catch((err) => {
      res.status(404).json(err);
    });
  }
});

// Get the logged in user
router.get('/loggedInUser', verifyToken, (req, res) => {
  User.findOne({ _id: req.user._id })
    .select('-password -notificationTokens')
    .populate({
      path: 'notifications',
      options: { limit: 20 },
      populate: {
        path: 'data.post',
        populate: {
          path: 'author',
          select: 'firstName lastName username profilePicture _id',
        },
      },
    })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      res.json(err);
    });
});

// Login a user
router.post('/login', (req, res) => {
  User.authenticate(req.body.username, req.body.password).then((user) => {
    jwt.sign({ user }, jwtSecret, (err, token) => {
      res.json({ token });
    });
  }).catch((err) => {
    res.json({
      err: {
        message: err.message,
      },
    });
  });
});

// Update user profile picture
router.put('/:id/profilePicture', verifyToken, upload.single('profilePicture'), (req, res) => {
  if (req.params.id.toString() !== req.user._id.toString()) {
    res.status(403);
    return;
  }

  User.findOne({ _id: req.params.id })
    .populate('profilePicture')
    .then((user) => {
      user.updateProfilePicture(req.file.buffer).then((pic) => {
        res.json(pic.buffer.toString('base64'));
      }).catch((err) => {
        res.json(err);
      });
    }).catch((err) => {
      res.json(err);
    });
});

// Get the user profile picture
router.get('/:id/profilePicture', verifyToken, (req, res) => {
  User.findOne({ _id: req.params.id })
    .populate('profilePicture')
    .then((user) => {
      res.json(user.getProfilePicture());
    }).catch((err) => {
      res.json(err);
    });
});

/**
* Get all posts subbed by requesting user
*/
router.get('/:id/subscribedChannels/posts', (req, res) => {
  User.findOne({ _id: req.params.id })
    .select('-password')
    .populate('subscribedChannels')
    .then((user) => {
      user.getPostsFromSubs(req.get('page')).then((posts) => {
        res.json(posts);
      }).catch((err) => {
        res.json(err);
      });
    })
    .catch((err) => {
      res.json(err);
    });
});

router.post('/:id/notificationToken', verifyToken, (req, res) => {
  if (req.params.id.toString() !== req.user._id.toString()) {
    res.status(403);
    return;
  }

  User.findOne({ _id: req.params.id })
    .then((user) => {
      user.registerNotificationToken(req.body.notificationToken).then((token) => {
        res.json(token);
      }).catch((err) => {
        res.json(err);
      });
    }).catch((err) => {
      res.json(err);
    });
});

router.post('/:id/markNotifsSeen', verifyToken, (req, res) => {
  if (req.params.id.toString() !== req.user._id.toString()) {
    res.status(403);
    return;
  }

  User.markNotifsSeen(req.user._id)
    .then(result => res.json(result))
    .catch(err => res.json(err));
});

module.exports = router;
