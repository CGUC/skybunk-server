require('../../models/Media/PostPicture')
require('sinon-mongoose');
const helpers = require('../../models/Media/Media')
const sharp = require('sharp');
const mongoose = require('mongoose');
const chai = require('chai');
const sinon = require('sinon');

const expect = chai.expect;
const Media = mongoose.model('Media')
const PostPicture = mongoose.model('PostPicture')

const imgBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='

describe("Media", () => {
  let imageSave, mediaSave, buffer;
  before(() => {
    buffer = new Buffer(imgBase64, 'base64');
    const sampleImage = new PostPicture({ buffer })

    imageCreate = sinon.stub(PostPicture, 'create').resolves(sampleImage);
    mediaSave = sinon.stub(Media.prototype, 'save').resolves({});

  });

  after(() => {
    imageCreate.restore();
    mediaSave.restore();
  });

  describe("correctly validates", () => {
    it('if media type does not include proper media', done => {
      const media = new Media({
        type: 'image'
      });

      media.validate(err => {
        expect(err.errors.type.message).to.equal('Type is set to image, yet no image provided.')
        done()
      });
    });
    it('if non-image type includes an image', done => {
      const media = new Media({
        type: 'dummy',
        image: new PostPicture(new Buffer('asdf'))
      });

      media.validate(err => {
        expect(err.errors.image.message).to.equal('Type is not set to image, yet image was provided.')
        done()
      });
    });
  });

  describe("can handle", () => {
    it('images successfully', done => {
      Media.create('image', buffer).then(result => {
        expect(imageCreate.callCount).to.equal(1)
        expect(imageCreate.args[0][0]).to.equal(buffer)
        expect(result.type).to.equal('image')
        expect(result.image.buffer.toString('base64')).to.equal(buffer.toString('base64'))
        imageCreate.resetHistory()
        done()
      });
    });

    it('invalid media types appropriately', done => {
      Media.create('invalidType', {}).catch(err => {
        expect(err.message).to.equal('Invalid media type provided')
        done()
      });
    });
  });
});