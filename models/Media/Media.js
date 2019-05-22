require('../../models/Media/PostPicture');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const PostPicture = mongoose.model('PostPicture');

function mediaValidator(type) {
  return {
    validator: function(v) {
      return v && this.type === type
    },
    message: props => `Type is not set to ${type}, yet ${type} was provided.`
  };
};

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

const createImage = (self, data) => {
  return new Promise((resolve, reject) => {
    PostPicture.create(data).then(image => {
      const newMedia = new self({ type: 'image', image });
      
      newMedia.save().then(media => {
          resolve(newMedia);
      })
      .catch(err => {
        reject(err)
      });
    });
  });
};

MediaSchema.statics.create = function (type, data) {
    if (type === 'image') {
      return createImage(this, data);
    }
    else if (type === 'poll') {
      // TODO
    }
    else {
      return new Promise((resolve, reject) => {
        reject(Error('Invalid media type provided'))
      })
    }
}

mongoose.model('Media', MediaSchema);

module.exports = {
  createImage: createImage
}