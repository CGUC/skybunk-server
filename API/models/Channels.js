const mongoose = require('mongoose');
const Schema = mongoose.Schema;

require('./Posts');
const Post = mongoose.model('Post');

const ChannelSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true,
	},
	tags: {
		type: Array,
		required: true,
	},
});

ChannelSchema.statics.create = function(channel) {
	var channelName = channel.name.toLowerCase();
	var formattedTags = [];
	channel.tags.forEach((tag) => {
    formattedTags.push(tag.toLowerCase());
  });
	var channelData = {
		...channel,
		name: channelName,
		tags: formattedTags,
	}

	return new Promise((resolve, reject) => {
		// Check if channel by this name already exists
		this.find({ name: channelName }).then(document => {
			if (document && document.length) {
				reject(`${channelName} channel already exists!`);
			}
			else {
				const newChannel = new this(channelData);
				newChannel.save().then(channel => {
					resolve(channel);
				})
				.catch(err => {
					reject(err);
				});
			}
		})
		.catch(err => {
			reject(err);
		});
	});
}

ChannelSchema.statics.get = function(id) {
  if (typeof id === 'string') id = mongoose.Types.ObjectId(id);

	return new Promise((resolve, reject) => {
		//this.find({ _id: channelId })
		this.findById(id).then(channel => {
			if (channel) {
				resolve(channel);
			}
			else {
				reject(`Couldn't find a channel with that ID`);
			}
		})
		.catch(err => {
			reject(err);
		});
	})
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

ChannelSchema.statics.updateChannel = function(id, updatedObj) {
  if (typeof id === 'string') id = mongoose.Types.ObjectId(id);

	if (updatedObj.name) updatedObj.name = updatedObj.name.toLowerCase();

	return new Promise((resolve, reject) => {
		this.update({ _id: id }, updatedObj).then(() => {
			resolve();
		})
		.catch(err => {
			reject(err);
		});
	});
}

ChannelSchema.statics.delete = function(id) {
  if (typeof id === 'string') id = mongoose.Types.ObjectId(id);

	return new Promise((resolve, reject) => {
		this.deleteOne({ _id: id }).then(() => {
			resolve(`Successfully deleted channel`);
		})
		.catch(err => {
			reject(err);
		});
	});
}

mongoose.model('Channel', ChannelSchema);