const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const _ = require('lodash');

require('../models/Channels');
const Channel = mongoose.model('Channel');
const { verifyToken } = require('../helpers/authorization');
const { classifyError } = require('../helpers/formatters');

/**
 * Methods:
 *  post(/) => Creates new channel
 *  get(/:id) => Gets channel by id
 *  get(/:id/posts) => Gets all posts associated with channel's tags
 *  put(/:id) => Updates channel with given id
 *  delete(/:id) => Deletes channel with given id
 */


/**
 * Create a new channel
 */
router.post('/', verifyToken, (req, res) => {
  Channel.create(req.body).then(channel => {
    res.json(channel);
  })
  .catch(err => {
    var errRes = classifyError(err);
    res.status(errRes.status).json(errRes.message);
  });
});

/**
 * Get a channel by its id
 */
router.get('/:id', (req, res) => {
  Channel.get(req.params.id).then(channel => {
    res.json(channel);
  })
  .catch(err => {
    var errRes = classifyError(err);
    res.status(errRes.status).json(errRes.message);
  });
});

/**
 * Get all channels
 */
router.get('/', (req, res) => {
  Channel.getAll().then(channels => {
    res.json(channels);
  })
  .catch(err => {
    res.status(500).json(err.message);
  });
})

/**
 * Get posts from a specific channel
 */
router.get('/:id/posts', (req, res) => {
  Channel.getPosts(req.params.id).then(posts => {
    res.json(posts);
  })
  .catch(err => {
    var errRes = classifyError(err);
    res.status(errRes.status).json(errRes.message);
  });
});

/**
 * Update a channel
 */
router.put('/:id', verifyToken, (req, res) => {
  Channel.updtedChannel(req.params.id, req.body).then(channel => {
    res.json(channel);
  })
  .catch(err => {
    var errRes = classifyError(err);
    res.status(errRes.status).json(errRes.message);
  });
});

/**
 * Delete a channel
 */
router.delete('/:id', verifyToken, (req, res) => {
  Channel.delete(req.params.id).then(msg => {
    res.json(msg);
  })
  .catch(err => {
    var errRes = classifyError(err);
    res.status(errRes.status).json(errRes.message);
  });
});

module.exports = router;