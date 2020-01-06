require('./ProfilePicture');
require('../models/Channels');
require('../models/Posts');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const passwordReset = require('../helpers/passwordReset');
const { Schema } = mongoose;
const ProfilePicture = mongoose.model('ProfilePicture');
const Post = mongoose.model('Post');

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    dropDups: true,
  },
  role: [{
    type: String,
  }],
  info: {
    program: {
      type: String,
    },
    address: {
      type: String,
    },
    affiliation: {
      type: String,
    },
    bio: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    }
  },
  profilePicture: {
    type: Schema.Types.ObjectId,
    ref: 'ProfilePicture',
  },
  subscribedChannels: [{
    type: Schema.Types.ObjectId,
    ref: 'Channel',
  }],
  notifications: [{
    type: Schema.Types.ObjectId,
    ref: 'Notification',
  }],
  notificationTokens: [{
    type: String,
  }],
  donInfo: {
    isOn: {
      type: Boolean,
      default: false,
    },
    isOnLateSupper: {
      type: Boolean,
      default: false,
    },
    clockOut: {
      type: String, // timestamp
    },
    location: {
      type: String,
    },
  },
  resetPasswordToken: {
    type:String,
  },
  resetPasswordExpiration: {
    type: Date,
  },
});

// Create a new user
UserSchema.statics.create = function (user) {
  return new Promise((resolve, reject) => {
    user.notificationTokens = [];
    const newUser = new this(user);

    // Encrypt the password and save
    newUser.changePassword(newUser.password).then(() => {
      resolve(newUser);
    })
      .catch((err) => {
        reject(err);
      });
  });
};

// Authenticate user
UserSchema.statics.authenticate = function (username, password) {
  return new Promise((resolve, reject) => {
    this.findOne({
      username,
    }).then((user) => {
      if (!user) {
        reject(Error('Username does not exist'));
      } else {
        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (isMatch && !err) {
            resolve(user);
          } else {
            reject(Error('Password is incorrect'));
          }
        });
      }
    });
  });
};

UserSchema.statics.markNotifsSeen = function (id) {
  return new Promise((resolve, reject) => {
    this.findOne({
      _id: id,
    })
      .populate('notifications')
      .then((user) => {
        if (!user) {
          reject(Error('Could not find user'));
        } else {
          const promises = [];
          user.notifications.forEach((notif) => {
            promises.push(notif.markSeen());
          });

          Promise.all(promises).then(() => {
            resolve(true);
          })
            .catch(err => reject(err));
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// Update a user
UserSchema.methods.update = function (updatedUserData) {
  return new Promise((resolve, reject) => {
    this.firstName = updatedUserData.firstName;
    this.lastName = updatedUserData.lastName;
    this.username = updatedUserData.username;
    this.subscribedChannels = updatedUserData.subscribedChannels;
    this.info = updatedUserData.info;
    this.role = updatedUserData.role;

    this.save().then((user) => {
      resolve(user);
    })
      .catch((err) => {
        reject(err);
      });
  });
};

// Change a users password
UserSchema.methods.changePassword = function (newPassword) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newPassword, salt, (err, hash) => {
        if (err) {
          reject(err);
        } else {
          this.password = hash;
          this.resetPasswordExpiration = 0; //expire any password reset tokens
          this.save().then(() => {
            resolve(hash);
          })
            .catch((err) => {
              reject(err);
            });
        }
      });
    });
  });
};

// Send a reset email to user
UserSchema.methods.sendPasswordResetEmail = function (email) {
  return passwordReset.sendPasswordResetEmail(this, email);
};

UserSchema.methods.updateProfilePicture = function (newBuffer) {
  return new Promise((resolve, reject) => {
    sharp(newBuffer)
      .resize({ height: 400, width: 400, withoutEnlargement: true })
      .jpeg()
      .toBuffer()
      .then((outputBuffer) => {
        if (this.profilePicture) {
          this.profilePicture.update(outputBuffer).then((pic) => {
            resolve(pic);
          })
            .catch(err => reject(err));
        } else {
          const newProfilePicture = new ProfilePicture({ buffer: outputBuffer });
          newProfilePicture.save().then((pic) => {
            this.profilePicture = pic;
            this.save().then((user) => {
              resolve(user.profilePicture);
            })
              .catch(err => reject(err));
          })
            .catch(err => reject(err));
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

UserSchema.methods.getPostsFromSubs = function (page) {
  return new Promise((resolve, reject) => {
    const tags = this.subscribedChannels.map(channel => channel.tags);
    const flattenedTags = [].concat(...tags);

    Post.findByTags(flattenedTags, page).then((posts) => {
      resolve(posts);
    }).catch((err) => {
      reject(err);
    });
  });
};

UserSchema.methods.registerNotificationToken = function (token) {
  return new Promise((resolve, reject) => {
    if (!token) {
      reject(Error('Invalid token provided'));
    } else if (this.notificationTokens.includes(token)) {
      resolve(token);
    } else {
      if (!this.notificationTokens) this.notificationTokens = [token];
      else this.notificationTokens.push(token);

      this.save().then(() => {
        resolve(token);
      })
        .catch((err) => {
          reject(err);
        });
    }
  });
};

UserSchema.methods.getProfilePicture = function () {
  if (this.profilePicture) return this.profilePicture.buffer.toString('base64');

  const imgPath = path.join(__dirname, '..', 'public', 'img', 'default-user.png');
  return fs.readFileSync(imgPath, 'base64');
};

UserSchema.statics.count = function () {
  return new Promise((resolve, reject) => {
    this.countDocuments().then((count) => {
      resolve(count);
    }).catch((err) => {
      reject(err);
    });
  });
};

// Return object is an array that looks something like this:
// [{
//   _id: { channel_name: 'Test', channel_tags: ['Test'] },
//   subscriber_count: 2
// }, ...]
UserSchema.statics.countSubscriptionsByChannel = function () {
  return new Promise((resolve, reject) => {
    this.aggregate([
      {
        $lookup: {
          from: 'channels',
          localField: 'subscribedChannels',
          foreignField: '_id',
          as: 'channels',
        },
      },
      { $project: { channels: 1, _id: 0 } },
      { $unwind: '$channels' },
      { $project: { 'channels.name': 1, 'channels.tags': 1 } },
      {
        $group: {
          _id: { channel_name: '$channels.name', channel_tags: '$channels.tags' },
          subscriber_count: { $sum: 1 },
        },
      },
    ]).then((result) => {
      resolve(result);
    }).catch((err) => {
      reject(err);
    });
  });
};

UserSchema.statics.countByRole = function () {
  return new Promise((resolve, reject) => {
    this.aggregate([
      {
        $group: {
          _id: { role: '$role' },
          count: { $sum: 1 },
        },
      },
    ]).then((result) => {
      resolve(result);
    }).catch((err) => {
      reject(err);
    });
  });
};

mongoose.model('User', UserSchema);
