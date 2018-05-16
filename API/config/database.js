if (process.env.NODE_ENV === 'production') {
	module.exports = {
		mongoURI: 'GET THIS ONCE WE PUSH TO PROD'
	}
}
else {
	module.exports = {
		mongoURI: 'mongodb://localhost/grapp-dev'
	}
}