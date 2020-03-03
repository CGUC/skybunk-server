const mongoose = require("mongoose");

require("../../models/GoldenTicket");

const GoldenTicket = mongoose.model("GoldenTicket");

mongoose.connect("mongodb://localhost/grapp-dev");

const promises = [];
for (let i = 0; i < 150; i++) {
  const ticketNumber = new GoldenTicket({
    ticketNumber: Math.random()
      .toString(36)
      .substring(2)
  });
  promises.push(ticketNumber.save());
  console.log(ticketNumber.ticketNumber);
}

Promise.all(promises).then(() => {
  console.log("Successfully generated golden tickets");
  mongoose.disconnect();
});
