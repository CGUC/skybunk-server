require('./User');
require('./Posts');
const mongoose = require('mongoose');
const NotificationManager = require('../helpers/notificationManager');
const { formatTags } = require('../helpers/formatters');

const { ObjectId } = mongoose.Types;
const { Schema } = mongoose;

const Post = mongoose.model('Post');

const ChannelSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  tags: [{
    type: String,
    required: true,
  }],
}, { timestamps: true });

ChannelSchema.statics.create = function (channel) {
  const channelName = channel.name.toLowerCase();
  const formattedTags = formatTags(channel.tags);

  const channelData = {
    name: channelName,
    description: channel.description,
    tags: formattedTags,
  };

  return new Promise((resolve, reject) => {
    const newChannel = new this(channelData);
    newChannel.save().then((channel) => {
      resolve(channel);
    })
      .catch((err) => {
        reject(err);
      });
  });
};

ChannelSchema.statics.findByTags = function (tags) {
  return new Promise((resolve, reject) => {
    const formattedTags = formatTags(tags);

    this.find({ tags: { $in: formattedTags } })
      .then((channels) => {
        resolve(channels);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

ChannelSchema.statics.get = function (id) {
  id = ObjectId(id);

  return new Promise((resolve, reject) => {
    this.findById(id).then((channel) => {
      if (channel) {
        resolve(channel);
      } else {
        reject(Error('Couldn\'t find a channel with that ID'));
      }
    })
      .catch((err) => {
        reject(err);
      });
  });
};

ChannelSchema.statics.getAll = function () {
  return new Promise((resolve, reject) => {
    this.find().then((channels) => {
      resolve(channels);
    })
      .catch((err) => {
        reject(err);
      });
  });
};

ChannelSchema.statics.getPosts = function (id, page) {
  return new Promise((resolve, reject) => {
    this.get(id).then((channel) => {
      Post.findByTags(channel.tags, page).then((posts) => {
        if (!posts) posts = [];
        resolve(posts);
      })
        .catch((err) => {
          reject(err);
        });
    })
      .catch((err) => {
        reject(err);
      });
  });
};

ChannelSchema.statics.updateChannel = function (id, updatedChannelObj) {
  id = ObjectId(id);

  const name = updatedChannelObj.name.toLowerCase();
  const formattedTags = formatTags(updatedChannelObj.tags);

  return new Promise((resolve, reject) => {
    this.findById(id).then((channel) => {
      if (channel) {
        channel.description = updatedChannelObj.description;
        channel.name = name;
        channel.tags = formattedTags;

        channel.save().then((updatedChannel) => {
          resolve(updatedChannel);
        })
          .catch((err) => {
            reject(err);
          });
      } else {
        reject(Error('Couldn\t find a channel with that ID'));
      }
    });
  });
};

ChannelSchema.statics.delete = function (id) {
  id = ObjectId(id);

  return new Promise((resolve, reject) => {
    this.deleteOne({ _id: id }).then(() => {
      resolve('Successfully deleted channel');
    })
      .catch((err) => {
        reject(err);
      });
  });
};

ChannelSchema.methods.notifyUsersOfPost = function (post, author) {
  const User = mongoose.model('User');

  User.find({ subscribedChannels: this._id })
    .select('-password')
    .then((users) => {
      const messages = [];
      users.forEach((user) => {
        if (user._id.toString() !== post.author.toString()) {
          const notificationData = {
            title: `${author.firstName} ${author.lastName} posted in ${this.name}`,
            body: `${post.content}`,
            data: { channel: this._id, post: post._id },
          };
          NotificationManager.saveNotificationForUserAsync(notificationData, user);

          user.notificationTokens.forEach((pushToken) => {
            messages.push({
              to: pushToken,
              sound: 'default',
              ...notificationData,
            });
          });
        }
      });

      NotificationManager.sendNotifications(messages);
    })
    .catch(err => console.log(err));
};

ChannelSchema.statics.count = function() {
  return new Promise((resolve, reject) => {
    this.countDocuments().then((count) => {
      resolve(count);
    }).catch((err) => {
      reject(err);
    });
  });
};

mongoose.model('Channel', ChannelSchema);
