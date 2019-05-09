require('../../models/Media/Media')
require('../../models/Media/PostPicture')
require('sinon-mongoose');
const sharp = require('sharp');
const mongoose = require('mongoose');
const chai = require('chai');
const sinon = require('sinon');

const expect = chai.expect;
const Media = mongoose.model('Media')
const PostPicture = mongoose.model('PostPicture')

const imgBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='

describe("Media", () => {
	let imageSave, mediaSave;
	before(() => {
		imageSave = sinon.stub(PostPicture.prototype, 'save').resolves({});
		mediaSave = sinon.stub(Media.prototype, 'save').resolves({});

	});

	after(() => {
		imageSave.restore();
		mediaSave.restore();
	})

	describe("correctly validates", () => {
		it('if media type does not include proper media', done => {
			const media = new Media({
				type: 'image'
			});

			media.validate(err => {
				expect(err.errors.type.message).to.equal('Type is set to image, yet no image provided.')
				done()
			});
		})
		it('if non-image type includes an image', done => {
			const media = new Media({
				type: 'dummy',
				image: new PostPicture(new Buffer('asdf'))
			});

			media.validate(err => {
				expect(err.errors.image.message).to.equal('Type is not set to image, yet image was provided.')
				done()
			});
		})
	})

	describe("can handle", () => {
		it('images successfully', done => {
			const buffer = new Buffer(imgBase64, 'base64');

			sharp(buffer)
			.resize({ height: 600, width: 600, withoutEnlargement: true })
			.jpeg()
			.toBuffer()
			.then(outputBuffer => {
				Media.create('image', buffer).then(result => {
					expect(result.type).to.equal('image')
					expect(result.image.buffer.toString('base64')).to.equal(outputBuffer.toString('base64'))
					done()
				})
			});
		});

		it('invalid media types appropriately', done => {
			Media.create('invalidType', {}).catch(err => {
				expect(err.message).to.equal('Invalid media type provided')
				done()
			})
		})
	});
});