require("../../models/Channels");
const mongoose = require("mongoose");

const Channel = mongoose.model("Channel");

const general = new Channel({
  name: "General",
  description: "for whatever",
  tags: ["general"]
});

const events = new Channel({
  name: "Events",
  description: "For upcoming events",
  tags: ["events"]
});

module.exports = {
  general,
  events
};
