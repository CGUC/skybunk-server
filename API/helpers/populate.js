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

exampleDocuments.map(data => {
  const ex = new Examplemodel(data);
  ex.save();
});