const readline = require('readline');
const mongoose = require('mongoose');
var Writable = require('stream').Writable;

require('../../models/User');
require('../../models/PostPicture')
const User = mongoose.model('User');
const PostPicture = mongoose.model('PostPicture');
const sharp = require('sharp');

var mutableStdout = new Writable({
  write: function(chunk, encoding, callback) {
    if (!this.muted)
      process.stdout.write(chunk, encoding);
    callback();
  }
});

mutableStdout.muted = false;

const rl = readline.createInterface({
  input: process.stdin,
  output: mutableStdout,
  terminal: true
});

function abort( message ) {
	console.error(message);
	console.error('Could not update users profile picture.');
	exit();
}

function exit() {
	mongoose.disconnect();
	rl.close();
	process.exit();
}


async function reduce_filesize(){
	console.log('Compressing Profile Pictures')
	rl.question('Database user: ', (user) => {
		rl.question('password: ', (password) => {
			console.log('...');
			let mongoUri ;
			if (user === 'dev') {
				mongoUri = 'mongodb://localhost/grapp-dev'
			}
			else {
				mongoUri = `mongodb://${user}:${password}@ds163510.mlab.com:63510/grapp`;
			}
			mongoose.connect(mongoUri)
			.then(() => {
				User.find().populate('profilePicture').then(async users => {
					const len = users.length;
					for (var i = 0; i < len; i++) {
						user = users[i];
						if(user.profilePicture){
							await sharp(user.profilePicture.buffer)
							.resize({ height: 400, width: 400, withoutEnlargement: true })
							.jpeg()
							.toBuffer()
							.then(outputBuffer => {
								user.profilePicture.update(outputBuffer).then(response => {
									console.log(`Updated! ${user.firstName} ${user.lastName}`)
								})
							}).catch(err => {
								console.log(err)
							});
						}else{
							//console.log(`user ${user.firstName} ${user.lastName} skipped`)
						}
					}
					console.log("Done!")
				})
				.catch(err => {
					console.error('Error finding user:');
					console.error(err);
					abort('');
				});
			})
			.catch(err => {
				console.error('Error connecting to database:');
				console.error(err);
				abort('')
			});
			mutableStdout.muted = true;
		});
	});
}

reduce_filesize()