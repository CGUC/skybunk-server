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

/** ~~~ APIDOCS DEFINITIONS ~~~ **/
/**
 * @apiDefine admin Requesting user must belong to admin usergroup
*/
/**
 * @apiDefine self Client must be authenticated as user it is trying to modify
*/
/**
 * @apiDefine user Client must be authenticated as a registered user
*/


/**
 * @api {get} /users Get all Users
 * @apiName GetUsers
 * @apiGroup User
 * 
 * @apiHeader {String} authorization Valid auth token from user login
 * 
 * @apiPermission user
 * 
 * @apiSuccess {Object[]} users All User objects
 */
router.get('/', verifyToken, (req, res) => {
  User.find().select('-password -notificationTokens -notifications').then((users) => {
    res.json(users);
  });
});

/**
 * @api {get} /users/:id Get User by ID
 * @apiName GetUser
 * @apiGroup User
 * 
 * @apiParam {Number} id Target user's ID
 * @apiHeader {String} authorization Valid auth token from user login
 * 
 * @apiPermission user
 * 
 * @apiSuccess {Object} user User object
 */
router.get('/user/:id', verifyToken, (req, res) => {
  User.findOne({ _id: req.params.id }).select('-password -notificationTokens -notifications').then((user) => {
    res.json(user);
  }).catch((err) => {
    res.json(err);
  });
});

/**
 * @api {post} /users/reset Send Password Reset Email
 * @apiDescription Start the password reset process by sending the target user an email.
 * @apiName SendPasswordResetEmail
 * @apiGroup User
 * 
 * @apiParam {Object} body Target user data including <code>username</code> or
 * <code>firstName</code> & <code>lastName</code>
 * 
 * @apiPermission none
 */
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

/**
 * @api {post} /users/reset/:username/:token Reset Password with Token
 * @apiDescription Complete password reset process with token obtained from email link.
 * @apiName ResetPasswordWithToken
 * @apiGroup User
 * 
 * @apiParam {String} username Target user's username
 * @apiParam {String} token Token obtained from password reset email
 * @apiParam {Object} body User object with new <code>password</code>
 * 
 * @apiSuccess {String} password New password
 */
router.post('/reset/:username/:token', verifyPasswordResetToken, (req, res) => {
  const user = req.user;
  user.changePassword(req.body.password).then((password) => {
    res.json(password);
  }).catch((err) => {
    res.json(err);
  });
});


/**
 * @api {post} /users Create User
 * @apiDescription Create user with valid golden ticket from db.
 * @apiName CreateUser
 * @apiGroup User
 * 
 * @apiParam {Object} body User object to create
 * @apiParamExample {json} Mandatory user object fields + example:
 * {
 *   username: "connieG",
 *   password: "t@uferman123",
 *   firstName: "Conrad",
 *   lastName: "Grebel",
 *   goldenTicket: "valid_ticket_from_db"
 * }
 * 
 * @apiPermission none
 * 
 * @apiSuccess {Object} user User Object
 * @apiSuccess {String} user.username
 * @apiSuccess {String} user.firstName
 * @apiSuccess {String} user.lastName
 * @apiSuccess {String} user.password (encrypted)
 * @apiSuccess {Object[]} user.notifications
 * @apiSuccess {String[]} user.notificationTokens
 * @apiSuccess {String[]} user.role
 * @apiSuccess {Buffer} user.profilePicture
 * @apiSuccess {Object[]} user.subscribedChannels
 * @apiSuccess {String} user.resetPasswordToken
 * @apiSuccess {Date} user.resetPasswordExpiration
 * @apiSuccess {Object[]} user.info
 * @apiSuccess {String} user.info.program
 * @apiSuccess {String} user.info.address
 * @apiSuccess {String} user.info.affiliation
 * @apiSuccess {String} user.info.bio
 * @apiSuccess {String} user.info.phone
 * @apiSuccess {String} user.info.email
 * @apiSuccess {Object[]} user.donInfo
 * @apiSuccess {Boolean} user.donInfo.isOn
 * @apiSuccess {Boolean} user.donInfo.isOnLateSupper
 * @apiSuccess {String} user.donInfo.clockOut
 * @apiSuccess {String} user.donInfo.location
 */
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

/**
 * @api {delete} /users/:id Delete User
 * @apiName DeleteUser
 * @apiGroup User
 * 
 * @apiParam {Number} id Target user's ID
 * @apiHeader {String} authorization Valid auth token from user login
 * 
 * @apiPermission admin
 * 
 * @apiSuccess {String} success Success message
 */
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

/**
 * @api {put} /user/:id Update User
 * @apiDescription Callable by admin or user themself.
 * @apiName UpdateUser
 * @apiGroup User
 * 
 * @apiParam {Number} id Target user's ID
 * @apiParam {Object} body Updated user data
 * @apiHeader {String} authorization Valid auth token from user login
 * 
 * @apiPermission admin
 * 
 * @apiSuccess {Object} user Updated User object
 */
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

/**
 * @api {post} /users/:id/password Update Password
 * @apiDescription Callable only by user themself.
 * @apiName UpdatePassword
 * @apiGroup User
 * 
 * @apiParam {Number} id Requesting user's ID
 * @apiParam {Object} body Updated user data including <code>password</code> field
 * @apiHeader {String} authorization Valid auth token from user login
 * 
 * @apiPermission self
 * 
 * @apiSuccess {String} password New password
 */
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

/**
 * @api {get} /users/loggedInUser Get logged-in User
 * @apiDescription Return user data matching auth token provided in header.
 * @apiName GetLoggedInUser
 * @apiGroup User
 * 
 * @apiHeader {String} authorization Valid auth token from user login
 * 
 * @apiPermission user
 * 
 * @apiSuccess {Object} user User object
 */
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

/**
 * @api {post} /users/login Login
 * @apiDescription Attempts user authentication given username and password, returning
 * Auth token if successful.
 * @apiName UserLogin
 * @apiGroup User
 * 
 * @apiParam {Object} body Must include <code>username</code> and <code>password</code> fields.
 * 
 * @apiPermission none
 * 
 * @apiSuccess {String} token Auth token to be used in subsequent API calls
 */
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

/**
 * @api {put} /users/:id/profilePicture Update Profile Picture
 * @apiName UpdateProfilePicture
 * @apiGroup User
 * 
 * @apiParam {Number} id Requesting user's ID
 * @apiParam {Object} file Picture file with <code>buffer</code> field
 * @apiHeader {String} authorization Valid auth token from user login
 * 
 * @apiPermission self
 * 
 * @apiSuccess {String} pic base64-encoded buffer string
 */
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

/**
 * @api {get} /users/:id/profilePicture Get Profile Picture
 * @apiName GetProfilePicture
 * @apiGroup User
 * 
 * @apiParam {Number} id Target user's ID
 * @apiHeader {String} authorization Valid auth token from user login
 * 
 * @apiPermission user
 * 
 * @apiSuccess {String} pic base64-encoded buffer string
 */
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
 * @api {get} /users/:id/subscribedChannels/posts Get Subscribed Posts
 * @apiDescription Get posts (paginated) from channels subscribed to by requesting user
 * @apiName GetSubscribedPosts
 * @apiGroup User
 * 
 * @apiParam {Number} id Requesting user's ID
 * @apiHeader {Number} page Pagination index
 * 
 * @apiPermission none
 * 
 * @apiSuccess {Object[]} posts Post objects
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

/**
 * @api {post} /users/:id/notificationToken Get Notification Token
 * @apiName GetNotificationToken
 * @apiGroup User
 * 
 * @apiParam {Number} id Target user's ID
 * @apiHeader {String} authorization Valid auth token from user login
 * 
 * @apiPermission user
 * 
 * @apiSuccess {String} token Registered notification token
 */
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

/**
 * @api {post} /users/:id/markNotifsSeen Mark Notifications Seen
 * @apiDescription Mark all notifications as 'seen' for a user
 * @apiName MarkNotificationsSeen
 * @apiGroup User
 * 
 * @apiParam {Number} id Requesting user's ID
 * @apiHeader {String} authorization Valid auth token from user login
 * 
 * @apiPermission self
 * 
 * @apiSuccess {Boolean} success
 */
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
