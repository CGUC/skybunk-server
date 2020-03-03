const production = ""; // Need url from mlab, don't muck around with production data unless you mean it
const local = "mongodb://localhost/grapp-dev";
const readline = require("readline");
const mongoose = require("mongoose");

require("../../models/User");
const UserModel = mongoose.model("User");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("Choose an action");
rl.question(
  "a - add admin priviledges || r - remove admin priviledges || v - view all admins",
  action => {
    if (!["a", "r", "v"].includes(action)) {
      return console.log(`Invalid action ${action}`);
    }
    mongoose
      .connect(local)
      .then(db => {
        if (["a", "r"].includes(action)) {
          rl.question("Enter target username: ", username => {
            UserModel.findOne({ username })
              .then(target => {
                if (action === "a") {
                  if (!target.role.includes("admin")) {
                    target.role.push("admin");
                  }
                } else if (action === "r") {
                  target.role.filter(e => e != "admin");
                }

                target
                  .save()
                  .then(() => {
                    console.log("Changes made.");
                    rl.close();
                    db.disconnect();
                  })
                  .catch(() => console.error("Error saving changes"));
              })
              .catch(() => console.error("Error finding user in database"));
          });
        } else {
          UserModel.find({ role: "admin" })
            .then(admins => {
              console.log("Current Admins:");
              admins.forEach(admin => {
                console.log(
                  `\t- ${admin.firstName} ${admin.lastName} (${admin._id})`
                );
              });
              rl.close();
              db.disconnect();
            })
            .catch(() => console.error("Error retrieving users from database"));
        }
      })
      .catch(() => console.error("Error connecting to database"));
  }
);
