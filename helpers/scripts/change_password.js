const readline = require("readline");
const mongoose = require("mongoose");
var Writable = require("stream").Writable;

require("../../models/User");
const User = mongoose.model("User");

var mutableStdout = new Writable({
  write: function(chunk, encoding, callback) {
    if (!this.muted) process.stdout.write(chunk, encoding);
    callback();
  }
});

mutableStdout.muted = false;

const rl = readline.createInterface({
  input: process.stdin,
  output: mutableStdout,
  terminal: true
});

function abort(message) {
  console.error(message);
  console.error("Could not update users password.");
  exit();
}

function exit() {
  mongoose.disconnect();
  rl.close();
  process.exit();
}

console.log("Change a user's password:");
rl.question("username: ", username => {
  rl.question("New Password: ", newPassword => {
    mutableStdout.muted = false;
    rl.question("Confirm Password: ", confPassword => {
      mutableStdout.muted = false;

      if (newPassword != confPassword) abort("Passwords do not match");
      rl.question("Database user: ", user => {
        rl.question("password: ", password => {
          console.log("...");
          let mongoUri;
          if (user === "dev") {
            mongoUri = "mongodb://localhost/grapp-dev";
          } else {
            mongoUri = `mongodb://${user}:${password}@ds163510.mlab.com:63510/grapp`;
          }
          mongoose
            .connect(mongoUri)
            .then(() => {
              User.findOne({ username })
                .then(user => {
                  if (!user) abort("User does not exist");
                  user
                    .changePassword(newPassword)
                    .then(updatedUser => {
                      console.log(`${username} password successfully changed`);
                      exit();
                    })
                    .catch(err => {
                      console.error("Error updating password: ");
                      console.error(err);
                      abort("");
                    });
                })
                .catch(err => {
                  console.error("Error finding user:");
                  console.error(err);
                  abort("");
                });
            })
            .catch(err => {
              console.error("Error connecting to database:");
              console.error(err);
              abort("");
            });
        });
        mutableStdout.muted = true;
      });
    });
    mutableStdout.muted = true;
  });
  mutableStdout.muted = true;
});
