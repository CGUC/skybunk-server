const mongoose = require('mongoose');

const { Schema } = mongoose;

const PostPictureSchema = new Schema({
  buffer: {
    type: Buffer,
    required: true,
  },
});

mongoose.model('PostPicture', PostPictureSchema);
