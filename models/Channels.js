const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;
const _ = require('lodash');
const NotificationManager = require('../helpers/notificationManager');

require('./Posts');
const Post = mongoose.model('Post');

const { formatTags } = require('../helpers/formatters');

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

ChannelSchema.statics.create = function(channel) {
	var channelName = channel.name.toLowerCase();
	var formattedTags = formatTags(channel.tags);

	var channelData = {
		name: channelName,
		description: channel.description,
		tags: formattedTags,
	}

	return new Promise((resolve, reject) => {
		const newChannel = new this(channelData);
		newChannel.save().then(channel => {
			resolve(channel);
		})
		.catch(err => {
			reject(err);
		});
	});
}

ChannelSchema.statics.findByTags = function(tags) {
	return new Promise((resolve, reject) => {
    var formattedTags = formatTags(tags);

    this.find({ tags: { $in: formattedTags } })
      .then(channels => {
        resolve(channels);
      })
      .catch(err => {
        reject(err);
      });
  });
}

ChannelSchema.statics.get = function(id) {
  id = ObjectId(id);

	return new Promise((resolve, reject) => {
		this.findById(id).then(channel => {
			if (channel) {
				resolve(channel);
			}
			else {
				reject('Couldn\'t find a channel with that ID');
			}
		})
		.catch(err => {
			reject(err);
		});
	})
}

ChannelSchema.statics.getAll = function() {
	return new Promise((resolve, reject) => {
		this.find().then(channels => {
			resolve(channels);
		})
		.catch(err => {
			reject(err);
		});
	});
}

ChannelSchema.statics.getPosts = function(id, page) {
	return new Promise((resolve, reject) => {
		this.get(id).then(channel => {
			Post.findByTags(channel.tags, page).then(posts => {
				if (!posts) posts = [];
				resolve(posts);
			})
			.catch(err => {
				reject(err);
			});
		})
		.catch(err => {
			reject(err);
		});
	});
}

ChannelSchema.statics.updateChannel = function(id, updatedChannelObj) {
	id = ObjectId(id);

	var name = updatedChannelObj.name.toLowerCase();
	var formattedTags = formatTags(updatedChannelObj.tags);

	return new Promise((resolve, reject) => {
    this.findById(id).then(channel => {
      if (channel) {
				var channelData = _.extend({}, channel, updatedChannelObj.description);
				channelData.name = name;
				channelData.tags = formattedTags;
				
        channelData.save().then(updatedChannel => {
          resolve(updatedChannel);
        })
        .catch(err => {
          reject(err);
        });
      }
      else {
        reject('Couldn\t find a channel with that ID');
      }
    });
  });
}

ChannelSchema.statics.delete = function(id) {
	id = ObjectId(id);
	
	return new Promise((resolve, reject) => {
		this.deleteOne({ _id: id }).then(() => {
			resolve('Successfully deleted channel');
		})
		.catch(err => {
			reject(err);
		});
	});
}

ChannelSchema.methods.notifyUsersOfPost = function(post, author) {
	require('./User');
	const User = mongoose.model('User');
	User.find({subscribedChannels: this._id })
  .select('-password')
  .then(users => {
    let messages = [];
	    users.map(user => {
	      if (user._id.toString() !== post.author.toString()) {
	    	const notificationData = {
	    		title: `${author.firstName} ${author.lastName} posted in ${this.name}`,
	    		body: `${post.content}`,
	    		data: { channel: this._id, post: post._id }
	    	}
	    	NotificationManager.saveNotificationForUserAsync(notificationData, user);

	      user.notificationTokens.map(pushToken => {
	        messages.push({
	          to: pushToken,
	          sound: 'default',
	          ...notificationData
	        })
	      })
    	}
    });

    NotificationManager.sendNotifications(messages);
  })
  .catch(err => console.log(err));
}

mongoose.model('Channel', ChannelSchema);