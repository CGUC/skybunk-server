const mongoose = require("mongoose");

const { Schema } = mongoose;

// Define what fields this schema has
// (ie. what it can store in the database)
const ExampleSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  counter: {
    type: Number,
    required: true,
    default: 0
  }
});

// All the business logic done on a model should be done in
// the instance methods, and controllers should simply call
// these instance methods.
ExampleSchema.methods.incrementCounter = function() {
  this.counter++;
  this.save()
    .then(console.log("Document saved"))
    .catch(console.log("Error saving document"));
};

mongoose.model("Example", ExampleSchema);
