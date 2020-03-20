/**
 * This was used to migrate old tags on existing posts and channels to newer ones.
 */

var _ = require("lodash");

const production = ""; // Need url from mlab, don't muck around with production data unless you mean it
const local = "mongodb://localhost/grapp-dev";

const mongoose = require("mongoose");

require("../../models/Posts");
require("../../models/User");
require("../../models/Channels");
const PostModel = mongoose.model("Post");
const ChannelModel = mongoose.model("Channel");

const tagsMap = {
  volleyball: "Veebs",
  looking: "Lost and found",
  food: "Food",
  questions: "I got a question",
  entertainment: "Movies & Games",
  soco: "Soco",
  stuco: "Stuco",
  specialprojects: "Special Projects",
  general: "General",
  bugs: "Bugs"
};

function change_post_tags() {
  return new Promise(r => {
    mongoose
      .connect(local)
      .then(db => {
        PostModel.getAll()
          .then(posts => {
            var newPosts = [];
            _.each(posts, post => {
              var newTag = tagsMap[_.last(post.tags)];
              if (newTag) {
                post = _.extend(post, { tags: [newTag] });
                newPosts.push(post);
              }
            });

            var promises = _.map(newPosts, post => post.save());

            Promise.all(promises)
              .then(posts => {
                r();
              })
              .catch(err => {
                console.error(err);
                r();
              });
          })
          .catch(err => {
            console.error(err);
            r();
          });
      })
      .catch(err => {
        console.error(err);
        r();
      });
  });
}

function delete_channel_tags() {
  return new Promise(r => {
    mongoose
      .connect(production)
      .then(db => {
        ChannelModel.getAll()
          .then(channels => {
            var newChannels = [];
            _.each(channels, channel => {
              channel.tags.splice(1, 1);
              newChannels.push(channel);
            });

            var promises = _.map(newChannels, channel => channel.save());

            Promise.all(promises)
              .then(posts => {
                r();
              })
              .catch(err => {
                console.error(err);
                r();
              });
          })
          .catch(err => {
            console.error(err);
            r();
          });
      })
      .catch(err => {
        console.error(err);
        r();
      });
  });
}

delete_channel_tags().then(() => {
  mongoose.disconnect();
});
