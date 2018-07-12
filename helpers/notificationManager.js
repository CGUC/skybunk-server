const Expo = require('expo-server-sdk');
let expo = new Expo();

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
  }
}