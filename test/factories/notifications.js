require("../../models/Notification");
const mongoose = require("mongoose");

const Notification = mongoose.model("Notification");

const unseenNotification = {
  title: "Hey watch out!",
  body: "there is a shark behind you",
  data: {
    channel: mongoose.Types.ObjectId(),
    post: mongoose.Types.ObjectId(),
    comment: mongoose.Types.ObjectId()
  },
  seen: false
};

const seenNotification = {
  title: "Hey watch out!",
  body: "there is a shark behind you",
  data: {
    channel: mongoose.Types.ObjectId(),
    post: mongoose.Types.ObjectId(),
    comment: mongoose.Types.ObjectId()
  },
  seen: true
};

module.exports = {
  unseenNotification: () => new Notification(unseenNotification),
  seenNotification: () => new Notification(seenNotification)
};
