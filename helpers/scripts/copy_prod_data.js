var PROD_ADDRESS = 'http://api.grebelife.com'
var DEV_ADDRESS ='localhost'
var VERSION = '1.5'

const fetch = require("node-fetch");
const mongoose = require('mongoose');

function get(endpoint, headers) {
	return fetch(`${PROD_ADDRESS}${endpoint}`, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				...headers,
			},
		})
		.then(response => response.json())
		.then(responseJSON => {
			return responseJSON;
		})
		.catch(err => {
			console.error(err);
		});
}


mongoose.connect('mongodb://'+DEV_ADDRESS+'/grapp-dev');

get('/users/', {}).then(users =>{
  require('../../models/User');
  const Usermodel = mongoose.model('User');
  const promises = users.map(data => {
    const user = new Usermodel(data);
    return user.changePassword('password').then(updatedUser => {
      user.save().then(user => {})
      .catch(err => {
        console.log(`Error saving ${user} ${err}`)
      });
    });
  });
  console.log("Setting user data")
  Promise.all(promises).then(results => {
    console.log("Successfully populated user data")
  });
});

get('/channels/', {}).then(items =>{
	require('../../models/Channels');
	const model = mongoose.model('Channel');
	const promises = items.map(data => {
		const item = new model(data);
		return item.save().then(item => {})
			.catch(err => {
				console.log(`Error saving ${item} ${err}`)
			});
	});
	console.log("Setting channel data")
	Promise.all(promises).then(results => {
		console.log("Successfully populated channel data")
	});
});

get('/posts/', {}).then(items =>{
	require('../../models/Posts');
	const model = mongoose.model('Post');
	const promises = items.map(data => {
		const item = new model(data);
		return item.save().then(item => {})
			.catch(err => {
				console.log(`Error saving ${item} ${err}`)
			});
	});
	console.log("Setting post data")
	Promise.all(promises).then(results => {
		console.log("Successfully populated post data")
	});
});