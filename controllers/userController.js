const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const {jwtSecret} = require('../config/secrets');
const {verifyToken} = require('../helpers/authorization');
const multer  = require('multer')
const upload = multer({ storage: multer.memoryStorage() })
const router = express.Router();

require('../models/User');
const User = mongoose.model('User');

require('../models/GoldenTicket');
const GoldenTicket = mongoose.model('GoldenTicket');

require('../models/ProfilePicture');
const ProfilePicture = mongoose.model('ProfilePicture');

// Return all users
router.get('/', verifyToken, (req, res) => {
	User.find().select('-password -notificationTokens -notifications').then(users => {
		res.json(users);
	});
});

// Get specific user
router.get('/user/:id', verifyToken, (req, res) => {
	User.findOne({_id: req.params.id}).select('-password -notificationTokens -notifications').then(user => {
		res.json(user);
	}).catch(err => {
		res.json(err);
	});
});

// Creates a user
router.post('/', (req, res) => {
	GoldenTicket.verifyTicket(req.body.goldenTicket).then(ticket => {
		if (ticket) {
			User.create(req.body).then(user => {
				GoldenTicket.deleteOne({_id: ticket.id}).then(() => {
					res.json(user);
				});
			}).catch(err => {
				res.json(err);
			});
		}
		else {
			res.status(400).json({message: 'No valid golden ticket provided'});
		}
	}).catch(err => {
		res.json(err);
	});
});

// Deletes a user
router.delete('/:id', verifyToken, (req, res) => {
	if(req.params.id !== req.user._id) {
		res.status(403);
	}
	else {
		User.deleteOne({_id: req.params.id})
		.then(() => {
			res.status(200).send('success');
		}).catch(err => {
			res.status(404).json(err);
		});
	}
});

// Updates logged in user
router.put('/:id', verifyToken, (req, res) => {
	if(req.params.id !== req.user._id) {
		res.status(403);
	}

	User.findOne({_id: req.user._id}).then(user => {
		user.update(req.body).then(user => {
			res.json(user);
		}).catch(err => {
			res.json(err);
		});
	}).catch(err => {
		res.status(404).json(err);
	});
});

// Changes a user password
router.post('/:id/password', verifyToken, (req, res) => {
	if(req.params.id !== req.user._id) {
		res.status(403);
	}

	User.findOne({_id: req.user._id}).then(user => {
		user.changePassword(req.body.password).then(password => {
			res.json(password);
		}).catch(err => {
			res.json(err);
		});
	}).catch(err => {
		res.status(404).json(err);
	});
});

// Get the logged in user
router.get('/loggedInUser', verifyToken, (req, res) => {
	User.findOne({_id: req.user._id})
	.select('-password -notificationTokens')
	.populate({
		path: 'notifications',
		options: { limit: 20 },
		populate: { 
			path: 'data.post', 
			populate: {
				path: 'author',
				select: 'firstName lastName username profilePicture _id'
			}
		}
	})
	.then(user => {
		res.json(user);
	}).catch(err => {
		res.json(err);
	});
})

// Login a user
router.post('/login', (req, res) => {
	User.authenticate(req.body.username, req.body.password).then(user => {
		jwt.sign({user: user}, jwtSecret, (err, token) => {
			res.json({token});
		});
	}).catch(err => {
		res.json({err: err});
	});
});

// Update user profile picture
router.put('/:id/profilePicture', verifyToken, upload.single('profilePicture'), (req, res) => {
	if(req.params.id !== req.user._id) {
		res.status(403);
	}

	User.findOne({_id: req.params.id})
	.populate('profilePicture')
	.then(user => {
		user.updateProfilePicture(req.file.buffer).then(pic => {
			res.json(pic.buffer.toString('base64'));
		}).catch(err => {
			res.json(err);
		});
	}).catch(err => {
		res.json(err);
	});
});

// Get the user profile picture
router.get('/:id/profilePicture', verifyToken, (req, res) => {
	User.findOne({_id: req.params.id})
	.populate('profilePicture')
	.then(user => {
		res.json(user.getProfilePicture());
	}).catch(err => {
		res.json(err);
	});
});

/**
* Get all posts subbed by requesting user
*/
router.get('/:id/subscribedChannels/posts', verifyToken, (req, res) => {
  User.findOne({_id: req.params.id})
  .select('-password')
  .populate('subscribedChannels')
  .then(user => {
  	user.getPostsFromSubs(req.get('page')).then(posts => {
  		res.json(posts);
  	}).catch(err => {
  		res.json(err);
  	});
  }).catch(err => {
    res.json(err);
  });
});

router.post('/:id/notificationToken', verifyToken, (req, res) => {
	if(req.params.id !== req.user._id) {
		res.status(403);
	}

	User.findOne({_id: req.params.id})
	.then(user => {
		user.registerNotificationToken(req.body.notificationToken).then(token => {
			res.json(token);
		}).catch(err => {
			res.json(err);
		});
	}).catch(err => {
		res.json(err);
	});
});

router.post('/:id/markNotifsSeen', verifyToken, (req, res) => {
	if(req.params.id !== req.user._id) {
		res.status(403);
	}

	User.markNotifsSeen(req.user._id)
	.then(result => res.json(result))
	.catch(err => res.json(err));
})

module.exports = router;