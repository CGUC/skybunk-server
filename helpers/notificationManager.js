require("../models/Channels");
const mongoose = require("mongoose");
const Expo = require("expo-server-sdk");

const expo = new Expo();

require("../models/Notification");

const Notification = mongoose.model("Notification");

module.exports = {
  dispatchNotifications(post, author) {
    const Channel = mongoose.model("Channel");
    Channel.findByTags(post.tags)
      .then(channels => {
        channels.forEach(channel => {
          channel.notifyUsersOfPost(post, author);
        });
      })
      .catch(err => console.log(err));
  },

  async sendNotifications(messages) {
    const tickets = [];
    for (const message of messages) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync([message]);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }
  },

  async saveNotificationForUserAsync(notificationData, user) {
    const notification = new Notification(notificationData);
    notification
      .save()
      .then(notif => {
        user.notifications.unshift(notif);
        const removed = user.notifications.splice(30);
        user
          .save()
          .then(() => {
            Notification.deleteMany({ _id: { $in: removed } });
          })
          .catch(err => console.error(err));
      })
      .catch(err => console.error(err));
  }
};
