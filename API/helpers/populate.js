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

const promises = exampleDocuments.map(data => {
  const ex = new Examplemodel(data);
  console.log(`Creating ${data.name}...`);
  return ex.save().then(ex => {
  	console.log(`Successfully saved ${ex.name}`)
  });
});

Promise.all(promises).then(results => {
	console.log("Successfully populated database")
	mongoose.disconnect();
});