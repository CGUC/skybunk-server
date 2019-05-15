const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfilePictureSchema = new Schema({
	buffer: {
		type: Buffer,
		required: true,
	},
});

ProfilePictureSchema.methods.update = function(newBuffer) {
	return new Promise((resolve, reject) => {
		this.buffer = newBuffer;
	    this.save().then(pic => {
	      resolve(pic);
	    })
	    .catch(err => {
	      reject(err);
	    });
	});
};



mongoose.model('ProfilePicture', ProfilePictureSchema);