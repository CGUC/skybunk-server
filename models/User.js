const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('./ProfilePicture');
const ProfilePicture = mongoose.model('ProfilePicture');
require('../models/Channels');
const Channel = mongoose.model('Channel');

const UserSchema = new Schema({
	firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	username: {
		type: String,
		required: true,
		unique: true,
		dropDups: true
	},
	role: {
		type: Number,
		default: 0
	},
	info: new Schema({
		program: {
			type: String
		},
		address: {
			type: String
		},
		affiliation: {
			type: String
		},
		bio: {
			type: String
		}
	}),
	profilePicture: {
		type: Schema.Types.ObjectId,
		ref: 'ProfilePicture',
	},
	subscribedChannels: [{
		type: Schema.Types.ObjectId,
		ref: 'Channel'
	}],
	notifications: [{
		type: Schema.Types.ObjectId,
		ref: 'Notification'
	}],
	notificationTokens: [{
		type: String,
  }],
  donStatus: {
    type: Number, //0=off, 1=on, 2=late supper
    default: 0
  },
  donClockOut: {
    type: String, //timestamp
  }
});

// Create a new user
UserSchema.statics.create = function(user) {
	return new Promise((resolve, reject) => {
		user.notificationTokens = [];
		const newUser = new this(user);

		// Encrypt the password and save
		newUser.changePassword(newUser.password).then(saltedPassword => {
			resolve(newUser);
		})
		.catch(err => {
			reject(err);
		});
	});
 };

// Authenticate user
UserSchema.statics.authenticate = function(username, password) {
	return new Promise((resolve, reject) => {
		this.findOne({
			username: username,
		}).then(user => {
			if(!user) {
				reject({message: 'Username does not exist'});
			}

			// Match password
			bcrypt.compare(password, user.password, (err, isMatch) => {
				if(err) throw err;
				if (isMatch) {
					resolve(user);
				}
				else {
					reject({message: 'Password is incorrect'});
				}
			});
		});
	});
}

UserSchema.statics.markNotifsSeen = function(id) {
	return new Promise((resolve, reject) => {
		this.findOne({
			_id: id
		})
		.populate('notifications')
		.then(user => {
			if (!user) {
				reject({
					message: 'Could not find user',
					status: 404
				});
			}
			else {
				let promises = [];
				user.notifications.map(notif => {
					promises.push(notif.markSeen());
				})

				Promise.all(promises).then(notifs => {
					resolve(true);
				})
				.catch(reject(false));
			}
		})
		.catch(reject({
			message: 'Could not find user',
			status: 404
		}));
	});
}

// Update a user
UserSchema.methods.update = function(updatedUserData) {
	return new Promise((resolve, reject) => {
		this.firstName = updatedUserData.firstName;
		this.lastName = updatedUserData.lastName;
		this.username = updatedUserData.username;
		this.subscribedChannels = updatedUserData.subscribedChannels;
		this.info = updatedUserData.info;

		this.save().then(user => {
			 resolve(user);
		})
		.catch(err => {
			reject(err);
		});
	});
};

// Change a users password
UserSchema.methods.changePassword = function(newPassword) {
	return new Promise((resolve, reject) => {
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(newPassword, salt, (err, hash) => {
				if (err) {
					reject(err);
				}
				else {
					this.password = hash;
					this.save().then(user => {
						 resolve(hash);
					})
					.catch(err => {
						reject(err);
					});
				}
			});
		});
	});
};

UserSchema.methods.updateProfilePicture = function(newBuffer) {
	return new Promise((resolve, reject) => {
		if (this.profilePicture) {
			this.profilePicture.update(newBuffer).then(pic => {
				resolve(pic);
			})
			.catch(err => reject(err));
		}
		else {
			const newProfilePicture = new ProfilePicture({ buffer: newBuffer });
			newProfilePicture.save().then(pic => {
				this.profilePicture = pic;
				this.save().then(user => {
					resolve(user.profilePicture);
				})
				.catch(err => reject(err));
			})
			.catch(err => reject(err));
		}
	});
}

UserSchema.methods.getPostsFromSubs = function(page) {
	require('../models/Posts');
	const Post = mongoose.model('Post');

	return new Promise((resolve, reject) => {
		const tags = this.subscribedChannels.map(channel => {
			return channel.tags;
		});
		const flattenedTags = [].concat.apply([], tags);

		Post.findByTags(flattenedTags, page).then(posts => {
			resolve(posts);
		}).catch(err => {
			reject(err);
		});
	});
}

UserSchema.methods.registerNotificationToken = function(token) {
	return new Promise((resolve, reject) => {
		if (!token) {
			reject({message: 'Invalid token provided'});
		}
		else if (this.notificationTokens.includes(token)) {
			resolve(token);
		}
		else {
			if (!this.notificationTokens)
				this.notificationTokens = [token];
			else
				this.notificationTokens.push(token);

			this.save().then(user => {
				resolve(token);
			})
			.catch(err => {
				reject(err);
			});
		}
	})
}

UserSchema.methods.getProfilePicture = function() {
	const fs = require('fs');
	const path = require('path');

	if (this.profilePicture)
		return this.profilePicture.buffer.toString('base64')
	else {
		const imgPath = path.join(__dirname, '..', 'public', 'img', 'default-user.png');
		return fs.readFileSync(imgPath, 'base64');
	}
}

mongoose.model('User', UserSchema);