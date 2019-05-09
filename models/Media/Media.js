require('../../models/Media/PostPicture');
const mongoose = require('mongoose');
const sharp = require('sharp');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const PostPicture = mongoose.model('PostPicture');

function mediaValidator(type) {
	return {
		validator: function(v) {
			return v && this.type === type
		},
		message: props => `Type is not set to ${type}, yet ${type} was provided.`
	}
}

const MediaSchema = new Schema({
	type: {
		type: String,
		required: true,
		validate: {
			validator: val => {
				return this[val] != null;
			},
			message: props => `Type is set to ${props.value}, yet no ${props.value} provided.`
		}
	},
	image: {
		type: Schema.Types.ObjectId,
		ref: 'PostPicture',
		validate: mediaValidator.bind(this)('image')
	}
	// TODO: poll
}, { timestamps: true });

MediaSchema.statics.create = function (type, data) {
	return new Promise((resolve, reject) => {
		if (type === 'image') {
			sharp(data)
			.resize({ height: 600, width: 600, withoutEnlargement: true })
			.jpeg()
			.toBuffer()
			.then(outputBuffer => {
				const newImage = new PostPicture({ buffer: outputBuffer });
				newImage.save().then(pic => {
					const newMedia = new this({
						type,
						image: newImage
					});
					newMedia.save().then(media => {
				  		resolve(newMedia);
					})
					.catch(err => {
						reject(err)
					});
				})
				.catch(err => {
					reject(err)
				});
			}).catch(err => {
				reject(err)
			});
		}
		else if (type === 'poll') {
			// TODO
		}
		else {
			reject(Error('Invalid media type provided'))
		}
	});
}

mongoose.model('Media', MediaSchema);