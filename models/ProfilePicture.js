const fs = require('fs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const path = require('path');

const imgPath = path.join(__dirname, '..', 'public', 'img', 'default-user.png');
const imageAsBase64 = fs.readFileSync(imgPath, 'base64');

const ProfilePictureSchema = new Schema({
	buffer: {
		type: Buffer,
		required: true,
		default: imageAsBase64,
	},
});

ProfilePictureSchema.statics.createDefault = function() {
	return new Promise((resolve, reject) => {
		const newPic = new this({});
	    newPic.save().then(pic => {
	      resolve(pic);
	    })
	    .catch(err => {
	      reject(err);
	    });
	});
 };

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