const readline = require('readline');
const mongoose = require('mongoose');

require('../../models/Channels');
const Channel = mongoose.model('Channel');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Create a new channel');
rl.question('Name: ', (name) => {
	rl.question('Description: ', (description) => {
		rl.question('Database user: ', (user) => {
			rl.question('password: ', (password) => {
				console.log('...');
				let mongoUri ;
				if (user === 'dev') {
					mongoUri = `mongodb://localhost/grap-dev`;
				}
				else {
					mongoUri = `mongodb://${user}:${password}@ds163510.mlab.com:63510/grapp`;
				}
				mongoose.connect(mongoUri)
				.then(() => {
					const channel = new Channel({
						name,
						description,
						tags: [name]
					});

					channel.save().then(chan => {
						console.log(`Channel ${name} successfully created`)
						mongoose.disconnect();
  					rl.close();
					})
					.catch(err => {
						console.error('Error saving channel: ');
						console.error(err);
						mongoose.disconnect();
	  				rl.close();
					})
				})
				.catch(err => {
					console.error('Error connecting to database:');
					console.error(err);
					mongoose.disconnect();
  				rl.close();
				});

			});
		})
	});
});