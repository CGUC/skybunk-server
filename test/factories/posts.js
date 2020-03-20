require("../../models/Posts");
const mongoose = require("mongoose");
const UserFactory = require("./users");

const Post = mongoose.model("Post");

const generalPost = new Post({
  author: UserFactory.fred._id,
  content: "What a flippin post this was",
  subscribedUsers: [UserFactory.fred._id],
  tags: ["general"],
  likes: 0,
  comments: []
});

const eventsPost = new Post({
  author: UserFactory.fred._id,
  content: "Hey theres an event coming up",
  subscribedUsers: [UserFactory.fred._id],
  tags: ["events"],
  likes: 0,
  comments: []
});

module.exports = {
  general: generalPost,
  events: eventsPost
};
