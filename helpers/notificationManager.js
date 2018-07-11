const Expo require('expo-server-sdk');
let expo = new Expo();

export function sendNotifications(messages) {
	  let chunks = expo.chunkPushNotifications(messages);
	  let tickets = [];

    chunks.map(chunk => {
	    try {
	      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
	      tickets.push(...ticketChunk);
	    } catch (error) {
	      console.error(error);
	    }
  	});

  	let receiptIds = tickets.map(ticket => ticket.id);
  	let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  	(async () => {
  	  // Like sending notifications, there are different strategies you could use
  	  // to retrieve batches of receipts from the Expo service.
  	  for (let chunk of receiptIdChunks) {
  	    try {
  	      let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
  	      console.log(receipts);

  	      // The receipts specify whether Apple or Google successfully received the
  	      // notification and information about an error, if one occurred.
  	      for (let receipt of receipts) {
  	        if (receipt.status === 'ok') {
  	          continue;
  	        } else if (receipt.status === 'error') {
  	          console.error(`There was an error sending a notification: ${receipt.message}`);
  	          if (receipt.details && receipt.details.error) {
  	            // The error codes are listed in the Expo documentation:
  	            // https://docs.expo.io/versions/latest/guides/push-notifications#response-format 
  	            // You must handle the errors appropriately.
  	            console.error(`The error code is ${receipt.details.error}`);
  	          }
  	        }
  	      }
  	    } catch (error) {
  	      console.error(error);
  	    }
  	  }
  	})();
}