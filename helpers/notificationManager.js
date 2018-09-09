const mongoose = require('mongoose');
const Expo = require('expo-server-sdk');
let expo = new Expo();

require('../models/Notification');
const Notification = mongoose.model('Notification');

module.exports = {
  sendNotifications: async function(messages) {
	  let chunks = expo.chunkPushNotifications(messages);
	  let tickets = [];

    for(const chunk of chunks) {
	    try {
	      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
	      tickets.push(...ticketChunk);
	    } catch (error) {
	      console.error(error);
	    }
  	}
  },
  saveNotificationForUserAsync: async function (notificationData, user) {
  	const notification = new Notification(notificationData);
  	notification.save().then(notif => {
  		user.notifications.unshift(notif);
  		user.save().then(user => {console.log('notifCreated')})
  		.catch(err => console.error(err));
  	})
  	.catch(err => console.error(err));
  }
}