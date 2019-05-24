require('../../models/Media/PostPicture');
const mongoose = require('mongoose');

const { Schema } = mongoose;

function hasDuplicates(array) {
  return (new Set(array)).size !== array.length;
}

function multiSelectValidator(val) {
  if (!val) {
    const allUsersVoted = this.options.reduce((acc, option) => acc.concat(option.usersVoted), []);
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
    required: true,
  },
  usersVoted: [{
    type: Schema.Types.ObjectId,
    default: [],
    ref: 'User',
  }],
});

const PollSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  multiSelect: {
    type: Boolean,
    required: true,
    validate: {
      validator: multiSelectValidator,
      message: 'Poll is not set to multiSelect, but users have selected multiple options.',
    },
  },
  open: {
    type: Boolean,
    default: false,
  },
  options: {
    type: [PollOptionSchema],
    required: true,
    validate: {
      validator: optionsValidator,
      message: 'Cannot have more than 10 options on poll.',
    },
  },
}, { timestamps: true });

PollSchema.statics.create = function (pollData) {
  return new Promise((resolve, reject) => {
    const options = pollData.options.map(option => ({
      text: option,
      usersVoted: [],
    }));

    const newPoll = new this({
      title: pollData.title,
      multiSelect: pollData.multiSelect,
      options,
    });

    newPoll.save().then(() => {
      resolve(newPoll);
    })
      .catch((err) => {
        reject(err);
      });
  });
};

PollSchema.methods.addOption = function (option) {
  return new Promise((resolve, reject) => {
    this.options.push({
      text: option,
      usersVoted: [],
    });

    this.save().then(() => {
      resolve(this);
    })
      .catch((err) => {
        reject(err);
      });
  });
};

PollSchema.methods.placeVote = function (userId, optionId) {
  return new Promise((resolve, reject) => {
    const option = this.options.id(optionId);
    option.set({
      text: option.text,
      usersVoted: [...option.usersVoted, userId],
    });

    this.save().then(() => {
      resolve(this);
    })
      .catch((err) => {
        reject(err);
      });
  });
};

mongoose.model('Poll', PollSchema);
