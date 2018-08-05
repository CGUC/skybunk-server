const express = require('express');
const mongoose = require('mongoose');
const {verifyToken} = require('../helpers/authorization');
const router = express.Router();

require('../models/Notification');
const Notification = mongoose.model('Notification');

router.post('/:id/markSeen', verifyToken, (req, res) => {
	Notification.findOne({_id: req.params.id})
	.then(notif => {
		notif.markSeen()
		.then(notif => {
			res.send(notif);
		})
		.catch(err => {
			res.status(500).send(err);
		});
	})
	.catch(err => {
		console.log(err)
		res.send(err);
	});
})

module.exports = router;