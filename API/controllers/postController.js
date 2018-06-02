const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const _ = require('lodash');

require('../models/Posts');
const Post = mongoose.model('Post');

/**
 * Methods:
 *  post(/) => Creates new post
 *  get(/:id) => Gets post by id
 *  put(/:id) => Updates post with given id
 *  delete(/:id) => Deletes post with given id
 *  get(/:id/comments) => Gets all comments for post
 *  post(/:id) => Adds a new comment to the post
 */

/**
 * Create new post
 */
router.post('/', (req, res) => {
  Post.create(req.body).then(post => {
    res.json(200, post);
  })
  .catch(err => {
    if (typeof err === 'object') {
      res.json(500, err.message);
    } else {
      res.json(403, err);
    }
  })
})

/**
 * Get post by id
 */
router.get('/:id', (req, res) => {
  Post.get(req.params.id).then(post => {
    res.json(200, post);
  })
  .catch(err => {
    if (typeof err === 'object') {
      res.json(500, err.msg);
    } else {
      res.json(403, err);
    }
  });
});

/**
 * Update a post
 */
router.put('/:id', (req, res) => {
  const id = req.params.id;
  Post.updatePost(id, req.body).then(() => {
    res.redirect(`/posts/${id}`);
  })
  .catch(err => {
    if (typeof err === 'object') {
      res.json(500, err.message);
    } else {
      res.json(403, err);
    }
  });
});

/**
 * Delete a post
 */
router.delete('/:id', (req, res) => {
  Post.delete(req.params.id).then((msg) => {
    res.json(200, msg);
  })
  .catch(err => {
    if (typeof err === 'object') {
      res.json(500, err.message);
    } else {
      res.json(403, err);
    }
  });
});

/**
 * Get all comments associated with the post
 */
router.get('/:id/comments', (req, res) => {
  Post.getComments(req.params.id).then(comments => {
    res.json(200, comments);
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
 * Add a new comment to the post
 */
router.post('/:id', (req, res) => {
  Post.addComment(req.params.id, req.body).then(comment => {
    res.json(200, comment);
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