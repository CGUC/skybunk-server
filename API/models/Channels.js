const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
	var channelData = {
		...channel,
		name: channelName,
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
	var channelId = id;
	// argument to ObjectId must be string;
	// assume if not string, id is already ObjectId
	if (typeof id === 'string'){
		channelId = mongoose.Types.ObjectId(id);
	}

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
			var tags = channel.tags;
			var filteredPosts = [];
			/**
			 * TODO: Integrate with Posts model
			 * @method PostSchema.statics.findByTags(tags)
			 * 	=> queries collection for posts containing specified tags
			 * @returns {Array} of post documents
			 * (remember to require ./Posts!)
			 */
			Post.findByTags(tags).then(posts => {
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
	var channelId = id;
	if (typeof id === 'string'){
		channelId = mongoose.Types.ObjectId(id);
	}

	if (updatedObj.name) updatedObj.name = updatedObj.name.toLowerCase();

	return new Promise((resolve, reject) => {
		this.get(id).then(channel => {
			this.update({ _id: channelId }, updatedObj).then(() => {
				resolve();
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

ChannelSchema.statics.delete = function(id) {
	var channelId = id;
	if (typeof id === 'string'){
		channelId = mongoose.Types.ObjectId(id);
	}

	return new Promise((resolve, reject) => {
		this.get(id).then(channel => {
			this.deleteOne({ _id: channelId }).then(() => {
				resolve("Successfully deleted channel");
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

mongoose.model('Channel', ChannelSchema);