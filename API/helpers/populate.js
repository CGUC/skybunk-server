const mongoose = require('mongoose');

require('../models/Example');
const Examplemodel = mongoose.model('Example');

exampleDocuments = [
	{name: 'Mathew'},
	{name: 'Mark'},
	{name: 'Luke'},
	{name: 'John'}
];

mongoose.connect('mongodb://localhost/grapp-dev');

console.log("Working...");
const promises = exampleDocuments.map(data => {
  const ex = new Examplemodel(data);
  return ex.save().then(ex => {
  	console.log(`Successfully saved ${ex.name}`)
  })
  .catch(err => {
  	console.log(`Error saving ${ex.name}: ${err.message}`)
  });
});

Promise.all(promises).then(results => {
	console.log("Successfully populated database")
	mongoose.disconnect();
});