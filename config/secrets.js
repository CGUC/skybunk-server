if (process.env.NODE_ENV === 'production') {
	module.exports = {
		jwtSecret: process.env.JWT_SECRET
	}
}
else {
	module.exports = {
		jwtSecret: 'supersecretsecret'
	}
}