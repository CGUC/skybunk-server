const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
	title: {
		type: String,
		required: true
	},
	body: {
		type: String,
		required: true
	},
	data: {
		channel: {
			type: Schema.Types.ObjectId,
    		ref: 'Channel',
		},
		post: {
			type: Schema.Types.ObjectId,
			ref: 'Post',
		},
		comment: {
			type: Schema.Types.ObjectId,
			ref: 'Comment',
		}
	},
	seen: {
		type: Boolean,
		required: true,
		default: false
	}
}, { timestamps: true });

NotificationSchema.methods.markSeen = function() {
	return new Promise((resolve, reject) => {
		this.seen = true;
		this.save()
		.then(notif => {
			resolve(notif);
		})
		.catch(err => reject(err));
	});
}

mongoose.model('Notification', NotificationSchema);
