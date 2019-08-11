const express = require('express');

const router = express.Router();

const adminHelper = require('../helpers/adminHelper');


router.post('/tickets', (req, res) => {
  adminHelper.generateTickets(req.body.count).then((tickets) => {
    res.json(tickets);
  }).catch((err) => {
    console.error(err);
    res.status(500).send('error');
  });
});

module.exports = router;
