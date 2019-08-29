require('../../models/Media/Poll');
require('../../models/Media/PostPicture');

const mongoose = require('mongoose');

const { Schema } = mongoose;
const PostPicture = mongoose.model('PostPicture');
const Poll = mongoose.model('Poll');

function typeValidator(type) {
  return this[type] !== null && this[type] !== undefined;
}

function mediaValidator(type) {
  return {
    validator(v) {
      return v && this.type === type;
    },
    message: () => `Type is not set to ${type}, yet ${type} was provided.`,
  };
}

const MediaSchema = new Schema({
  type: {
    type: String,
    required: true,
    validate: {
      validator: typeValidator,
      message: props => `Type is set to ${props.value}, yet no ${props.value} provided.`,
    },
  },
  image: {
    type: Schema.Types.ObjectId,
    ref: 'PostPicture',
    validate: mediaValidator.bind(this)('image'),
  },
  poll: {
    type: Schema.Types.ObjectId,
    ref: 'Poll',
    validate: mediaValidator.bind(this)('poll'),
  },
}, { timestamps: true });

const createImage = (Self, data) => new Promise((resolve, reject) => {
  PostPicture.create(data).then((image) => {
    const newMedia = new Self({ type: 'image', image });

    newMedia.save().then(() => {
      resolve(newMedia);
    })
      .catch((err) => {
        reject(err);
      });
  });
});

const createPoll = (Self, data) => new Promise((resolve, reject) => {
  Poll.create(data).then((poll) => {
    const newMedia = new Self({ type: 'poll', poll });

    newMedia.save().then(() => {
      resolve(newMedia);
    })
      .catch((err) => {
        reject(err);
      });
  });
});

MediaSchema.statics.create = function (type, data) {
  if (type === 'image') {
    return createImage(this, data);
  }
  if (type === 'poll') {
    return createPoll(this, data);
  }

  return new Promise((resolve, reject) => {
    reject(Error('Invalid media type provided'));
  });
};

MediaSchema.methods.getMedia = function (type) {
  if (type === 'image') {
    return new Promise((resolve, reject) => {
      PostPicture.findOne({ _id: this.image._id }).then((image) =>{
        resolve(image.buffer.toString('base64'))
      }).catch((err) => {
        reject(err);
      });
    });
  }
  if (type === 'poll') {
    return new Promise((resolve, reject) => {
      Poll.findOne({ _id: this.poll._id }).then((poll) =>{
        resolve(poll)
      }).catch((err) => {
        reject(err);
      });
    });
  }
};

mongoose.model('Media', MediaSchema);

module.exports = {
  createImage,
};
