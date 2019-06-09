require('../../models/Media/PostPicture');
const mongoose = require('mongoose');

const { Schema } = mongoose;
const PostPicture = mongoose.model('PostPicture');

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
  // TODO: poll
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

MediaSchema.statics.create = function (type, data) {
  if (type === 'image') {
    return createImage(this, data);
  }
  if (type === 'poll') {
    // TODO
  }

  return new Promise((resolve, reject) => {
    reject(Error('Invalid media type provided'));
  });
};

mongoose.model('Media', MediaSchema);

module.exports = {
  createImage,
};
