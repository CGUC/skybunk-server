require('../../models/Media/PostPicture')
require('sinon-mongoose');
const sharp = require('sharp');
const mongoose = require('mongoose');
const chai = require('chai');
const sinon = require('sinon');

const expect = chai.expect;
const PostPicture = mongoose.model('PostPicture')

const imgBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='

describe("Post pictures", () => {
	let imageSave, buffer;
	before(() => {
		buffer = new Buffer(imgBase64, 'base64');
		imageSave = sinon.stub(PostPicture.prototype, 'save').resolves({});
	});

	after(() => {
		imageSave.restore();
	});

	it('require a buffer', done => {
		const pic = new PostPicture({});
		pic.validate(err => {
			expect(err.errors.buffer).to.exist;
			done()
		});
	});

	it('can be created and compressed successfully', done => {
		sharp(buffer)
		.resize({ height: 600, width: 600, withoutEnlargement: true })
		.jpeg()
		.toBuffer()
		.then(outputBuffer => {
			PostPicture.create(buffer).then(result => {
				expect(result.buffer.toString('base64')).to.equal(outputBuffer.toString('base64'))
				done()
			});
		});
	});
});