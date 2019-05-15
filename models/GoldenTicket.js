const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GoldenTicketSchema = new Schema({
	ticketNumber: {
		type: String,
		required: true,
		unique: true,
		dropDups: true
	}
});

GoldenTicketSchema.statics.verifyTicket = function(ticketNumber) {
	return new Promise((resolve, reject) => {
		this.findOne({ticketNumber: ticketNumber}).then(ticket => {
			resolve(ticket)
		}).catch(err => {
			reject(err);
		});
	})
 };

mongoose.model('GoldenTicket', GoldenTicketSchema);