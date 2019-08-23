const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const { verifyToken, verifyAdmin } = require('../helpers/authorization');

router.get('/', verifyToken, verifyAdmin, (req, res) => {
  res.json({test: "test"});
});

module.exports = router;
