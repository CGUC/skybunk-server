require("../../models/User");
const mongoose = require("mongoose");
const NotificationFactory = require("./notifications");
const ChannelFactory = require("./channels");

const User = mongoose.model("User");

const fredData = {
  firstName: "fred",
  lastName: "flinstone",
  password: "wilma123",
  username: "stoneman",
  info: {
    program: "running",
    address: "Bedrock",
    affiliation: "resident",
    bio: "I like rocks",
    phone: "555-555-5555"
  },
  subscribedChannels: [ChannelFactory.general, ChannelFactory.events]
};

const fred = new User(fredData);
fred.password = "$2a$10$zJmLxXvxOmIndH8IwhISs.PrDgkv3lgVYQRbQ5XN6HHFBvE9cyp16";
fred.notifications = [
  NotificationFactory.seenNotification(),
  NotificationFactory.seenNotification(),
  NotificationFactory.unseenNotification(),
  NotificationFactory.unseenNotification()
];
fred.profilePicture = { buffer: "Base64 encoded image" };
fred.notificationTokens = ["ld964hd6hm8174cx04b2"];

module.exports = {
  fredData,
  fred
};
