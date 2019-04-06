var PROD_ADDRESS = 'http://api.grebelife.com'
var DEV_ADDRESS ='localhost'
var VERSION = '1.5'

const fetch = require("node-fetch");
const mongoose = require('mongoose');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


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

function post(endpoint, headers, body) {
	return fetch(`${PROD_ADDRESS}${endpoint}`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			...headers,
		},
		body: JSON.stringify(body),
	})
	.catch(err => {
		err = err.replace(/</g, '').replace(/>/g, '');
		console.error(err);
	});
}


rl.question('Username: ', (username) => {
	rl.question('Password: ', (password) => {
		mongoose.connect('mongodb://'+DEV_ADDRESS+'/grapp-dev');
		var token;
		post('/users/login', {}, {
			username: username,
			password: password,
		}).then(response => response.json())
		.then(jsonResponse => {
			if(jsonResponse.err || !jsonResponse.token){
				console.error("Could not login");
				process.exit();
			}else{
				token = jsonResponse.token;
				console.log("Successfully logged in");
			}
		});

		get('/users/', {'Authorization': 'Bearer ' + token}).then(users =>{
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

		get('/channels/', {'Authorization': 'Bearer ' + token}).then(items =>{
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

		get('/posts/', {'Authorization': 'Bearer ' + token}).then(items =>{
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
	})
})
