require("../../models/Posts");
require("../../models/Media/Media");
require("../../models/Media/PostPicture");
require("sinon-mongoose");
const mongoose = require("mongoose");
const chai = require("chai");
const sinon = require("sinon");
const PostFactory = require("../factories/posts");

const { expect } = chai;
const Post = mongoose.model("Post");
const Media = mongoose.model("Media");
const PostPicture = mongoose.model("PostPicture");

const imgBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";

describe("Posts", () => {
  let postSave;
  let imageSave;
  let mediaSave;
  let buffer;
  before(() => {
    postSave = sinon.stub(Post.prototype, "save").resolves(this);
    imageSave = sinon.stub(PostPicture.prototype, "save").resolves({});
    mediaSave = sinon.stub(Media.prototype, "save").resolves({});
    buffer = Buffer.from(imgBase64, "base64");
  });

  after(() => {
    postSave.restore();
    imageSave.restore();
    mediaSave.restore();
  });

  describe("media", () => {
    it("can be added successfully", done => {
      const sampleMedia = new Media({
        type: "dummy"
      });
      const createMediaStub = sinon.stub(Media, "create").resolves(sampleMedia);

      PostFactory.general.addMedia("image", buffer).then(result => {
        expect(createMediaStub.callCount).to.equal(1);
        expect(createMediaStub.args[0][0]).to.equal("image");
        expect(createMediaStub.args[0][1]).to.equal(buffer);
        expect(result._id).to.equal(sampleMedia._id);
        expect(PostFactory.general.media._id).to.equal(sampleMedia._id);

        createMediaStub.restore();
        done();
      });
    });

    it("gives appropriate error when adding fails", done => {
      const createMediaStub = sinon
        .stub(Media, "create")
        .rejects(Error("Invalid media type provided"));

      PostFactory.general.addMedia("image", buffer).catch(err => {
        expect(err.message).to.equal("Invalid media type provided");

        createMediaStub.restore();
        done();
      });
    });
  });
});
