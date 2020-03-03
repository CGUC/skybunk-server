require("../../models/Media/PostPicture");
const mongoose = require("mongoose");

const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;

function hasDuplicates(array) {
  return new Set(array).size !== array.length;
}

function multiSelectValidator(val) {
  if (!val) {
    const allUsersVoted = this.options.reduce(
      (acc, option) => acc.concat(option.usersVoted),
      []
    );
    return !hasDuplicates(allUsersVoted);
  }
  return true;
}

function optionsValidator(val) {
  return val.length <= 10;
}

const PollOptionSchema = new Schema({
  text: {
    type: String,
    required: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  usersVoted: [
    {
      type: Schema.Types.ObjectId,
      default: [],
      ref: "User"
    }
  ]
});

const PollSchema = new Schema(
  {
    multiSelect: {
      type: Boolean,
      required: true,
      validate: {
        validator: multiSelectValidator,
        message:
          "Poll is not set to multiSelect, but users have selected multiple options."
      }
    },
    open: {
      type: Boolean,
      default: false
    },
    options: {
      type: [PollOptionSchema],
      required: true,
      validate: {
        validator: optionsValidator,
        message: "Cannot have more than 10 options on poll."
      }
    }
  },
  { timestamps: true }
);

PollSchema.statics.create = function(pollData, userId) {
  return new Promise((resolve, reject) => {
    const options = pollData.options.map(option => ({
      text: option.text,
      usersVoted: option.usersVoted || [],
      creator: ObjectId(userId)
    }));

    const newPoll = new this({
      multiSelect: pollData.multiSelect,
      open: !!pollData.open,
      options
    });

    newPoll
      .save()
      .then(() => {
        resolve(newPoll);
      })
      .catch(err => {
        reject(err);
      });
  });
};

PollSchema.methods.addOption = function(option, userId) {
  return new Promise((resolve, reject) => {
    this.options.push({
      text: option,
      usersVoted: [],
      creator: ObjectId(userId)
    });

    this.save()
      .then(() => {
        resolve(this);
      })
      .catch(err => {
        reject(err);
      });
  });
};

PollSchema.methods.removeOption = function(opt) {
  return new Promise((resolve, reject) => {
    const option = this.options.id(opt._id);

    if (!option) {
      reject(Error("Option not found"));
      return;
    }

    const optIndex = this.options.findIndex(
      o => o._id.toString() === option._id.toString()
    );
    this.options.splice(optIndex, 1);

    this.save()
      .then(() => {
        resolve(this);
      })
      .catch(err => {
        reject(err);
      });
  });
};

PollSchema.methods.placeVote = function(userId, optionId) {
  return new Promise((resolve, reject) => {
    const option = this.options.id(optionId);

    if (!option) {
      reject(Error("Option not found"));
      return;
    }

    if (option.usersVoted.some(u => u.toString() === userId.toString())) {
      reject(Error("User has already voted for this option"));
      return;
    }

    option.set({
      text: option.text,
      usersVoted: [...option.usersVoted, userId]
    });

    this.save()
      .then(() => {
        resolve(this);
      })
      .catch(err => {
        reject(err);
      });
  });
};

PollSchema.methods.retractVote = function(userId, optionId) {
  return new Promise((resolve, reject) => {
    const option = this.options.id(optionId);
    if (!option) {
      reject(Error("Option not found"));
      return;
    }

    option.set({
      text: option.text,
      usersVoted: option.usersVoted.filter(
        u => u.toString() !== userId.toString()
      )
    });

    this.save()
      .then(() => {
        resolve(this);
      })
      .catch(err => {
        reject(err);
      });
  });
};

mongoose.model("Poll", PollSchema);
