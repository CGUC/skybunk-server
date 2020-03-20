const mongoose = require("mongoose");
const sharp = require("sharp");

const { Schema } = mongoose;

const PostPictureSchema = new Schema({
  buffer: {
    type: Buffer,
    required: true
  }
});

PostPictureSchema.statics.create = function(buffer) {
  return new Promise((resolve, reject) => {
    sharp(buffer)
      .resize({
        height: 600,
        width: 600,
        fit: sharp.fit.inside,
        withoutEnlargement: true
      })
      .jpeg()
      .toBuffer()
      .then(outputBuffer => {
        const newImage = new this({ buffer: outputBuffer });
        newImage
          .save()
          .then(() => {
            resolve(newImage);
          })
          .catch(err => {
            reject(err);
          });
      })
      .catch(err => {
        reject(err);
      });
  });
};

mongoose.model("PostPicture", PostPictureSchema);
