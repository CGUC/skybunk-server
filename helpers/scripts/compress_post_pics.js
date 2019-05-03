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
	console.error('Could not update post pictures.');
	exit();
}

function exit() {
	mongoose.disconnect();
	rl.close();
	process.exit();
}


async function reduce_filesize(){
	console.log("Compressing post pictures.")
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
				PostPicture.find().then(async postPics => {
					const len = postPics.length;
					for (var i = 0; i < len; i++) {
						pic = postPics[i];

						await sharp(pic.buffer)
						.resize({ height: 600, width: 600, fit: sharp.fit.inside, withoutEnlargement: true })
						.jpeg()
						.toBuffer()
						.then(outputBuffer => {
							pic.buffer = outputBuffer;
							pic.save().then(item => {
								console.log(`Updated! ${pic._id}`)
							});
							
						}).catch(err => {
							console.log(err)
						});
					}
					console.log("Done")
				})
				.catch(err => {
					console.error('Error finding postPicture:');
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