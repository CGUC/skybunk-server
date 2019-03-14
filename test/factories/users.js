const mongoose = require('mongoose');

const fredData = {
	firstName: 'fred',
	lastName: 'flinstone',
	password: 'wilma123',
	username: 'stoneman',
	info: {
		program: 'running',
		address: 'Bedrock',
		affiliation: 'resident',
		bio: 'I like rocks',
		phone: '555-555-5555'
	},
	profilePicture: mongoose.Types.ObjectId(),
	subscribedChannels: [
		mongoose.Types.ObjectId(),
		mongoose.Types.ObjectId(),
		mongoose.Types.ObjectId()
	],
	notifications: [
		mongoose.Types.ObjectId(),
		mongoose.Types.ObjectId(),
		mongoose.Types.ObjectId()
	],
	notificationTokens: ['123456'],
	donInfo: null
}

const fredDocument = {
	_id: '5c89754f3b5ef46006006b7a',
	firstName: 'fred',
	lastName: 'flinstone',
	password: '$2a$10$zJmLxXvxOmIndH8IwhISs.PrDgkv3lgVYQRbQ5XN6HHFBvE9cyp16',
	username: 'stoneman',
	info: { 
		_id: '5c89754f3b5ef46006006b7b',
		program: 'running',
		address: 'Bedrock',
		affiliation: 'resident',
		bio: 'I like rocks',
		phone: '555-555-5555'
	},
	role: [],
	subscribedChannels: [
		'5c89754f3b5ef46006006b74',
		'5c89754f3b5ef46006006b75',
		'5c89754f3b5ef46006006b76'
	],
	notifications: [
		'5c89754f3b5ef46006006b77',
		'5c89754f3b5ef46006006b78',
		'5c89754f3b5ef46006006b79'
	],
	notificationTokens: [],
	donInfo: {
		isOn: false,
		isOnLateSupper: false
	},
	profilePicture: '5c89754f3b5ef46006006b73'
}

module.exports = {
	fredData: fredData,
	fredDocument: fredDocument
}