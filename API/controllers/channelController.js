const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const _ = require('lodash');

require('../models/Channels');
const Channel = mongoose.model('Channel');

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
router.post('/', (req, res) => {
  Channel.create(req.body).then(channel => {
    res.json(200, channel);
  })
  .catch(err => {
    if (typeof err === 'object') {
      // Actual runtime error
      res.json(500, err.message);
    }
    else {
      // Purposefully did not complete action, returned message
      res.json(403, err);
    }
  });
});

/**
 * Get a channel by its id
 */
router.get('/:id', (req, res) => {
  Channel.get(req.params.id).then(channel => {
    res.json(200, channel);
  })
  .catch(err => {
    if (typeof err === 'object') {
      res.json(500, err.message);
    }
    else {
      res.json(403, err);
    }
  });
});

/**
 * Get posts from a specific channel
 */
router.get('/:id/posts', (req, res) => {
  Channel.getPosts(req.params.id).then(posts => {
    res.json(200, posts);
  })
  .catch(err => {
    if (typeof err === 'object') {
      res.json(500, err.message);
    }
    else {
      res.json(403, err);
    }
  });
});

/**
 * Update a channel
 */
router.put('/:id', (req, res) => {
  const id = req.params.id;
  Channel.updateChannel(id, req.body).then(() => {
    res.redirect(`/channel/${id}`);
  })
  .catch(err => {
    if (typeof err === 'object') {
      res.json(500, err.message);
    }
    else {
      res.json(403, err);
    }
  });
});

/**
 * Delete a channel
 */
router.delete('/:id', (req, res) => {
  Channel.delete(req.params.id).then(msg => {
    res.json(200, msg);
  })
  .catch(err => {
    if (typeof err === 'object') {
      res.json(500, err.message);
    }
    else {
      res.json(403, err);
    }
  });
});

module.exports = router;