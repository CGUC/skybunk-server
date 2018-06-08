const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;
const _ = require('lodash');

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

ChannelSchema.statics.getPosts = function(id) {
	return new Promise((resolve, reject) => {
		this.get(id).then(channel => {
			Post.findByTags(channel.tags).then(posts => {
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

mongoose.model('Channel', ChannelSchema);