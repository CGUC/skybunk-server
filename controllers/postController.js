const express = require('express');

const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

require('../models/Posts');

const Post = mongoose.model('Post');
const { verifyToken } = require('../helpers/authorization');
const { classifyError } = require('../helpers/formatters');

/**
 * Methods:
 *  post(/) => Creates new post
 *  get(/:id) => Gets post by id
 *  put(/:id) => Updates post with given id
 *  delete(/:id) => Deletes post with given id
 *  get(/:id/comments) => Gets all comments for post
 *  post(/:id/comment) => Adds a new comment to the post
 *  delete(/:pid/comment/:cid) => Deletes comment with
 *    id cid from post with id pid
 */

/**
 * Create new post
 */
router.post('/', verifyToken, (req, res) => {
  Post.create(req.body, req.user).then((post) => {
    res.json(post);
  })
    .catch((err) => {
      const errRes = classifyError(err);
      res.status(errRes.status).json(errRes.message);
    });
});

/**
 * Get post by id
 */
router.get('/:id', verifyToken, (req, res) => {
  Post.get(req.params.id).then((post) => {
    res.json(post);
  })
    .catch((err) => {
      const errRes = classifyError(err);
      res.status(errRes.status).json(errRes.message);
    });
});

/**
 * Get all posts
 */
router.get('/', verifyToken, (req, res) => {
  Post.getAllPaginated(req.get('page')).then((posts) => {
    res.json(posts);
  })
    .catch((err) => {
      res.status(500).json(err.message);
    });
});

/**
 * Get all posts from a specific user
 */
router.get('/user/:id', verifyToken, (req, res) => {
  Post.getUserPosts(req.params.id, req.get('page')).then((posts) => {
    res.json(posts);
  }).catch((err) => {
    const errRes = classifyError(err);
    res.status(errRes.status).json(errRes.message);
  });
});

/**
 * Update a post
 */
router.put('/:id', verifyToken, (req, res) => {
  Post.updatePost(req.params.id, req.body).then((post) => {
    res.json(post);
  })
    .catch((err) => {
      const errRes = classifyError(err);
      res.status(errRes.status).json(errRes.message);
    });
});

/**
 * Like a post
 */
router.post('/:pid/like', verifyToken, (req, res) => {
  Post.likePost(req.params.pid, req.user._id, req.body.addLike)
    .then((post) => {
      res.json(post);
    })
    .catch((err) => {
      const errRes = classifyError(err);
      res.status(errRes.status).json(errRes.message);
    });
});

/**
 * Delete a post
 */
router.delete('/:id', verifyToken, (req, res) => {
  Post.delete(req.params.id).then((msg) => {
    res.json(msg);
  })
    .catch((err) => {
      const errRes = classifyError(err);
      res.status(errRes.status).json(errRes.message);
    });
});

/**
 * Get all comments associated with the post
 */
router.get('/:id/comments', verifyToken, (req, res) => {
  Post.getComments(req.params.id).then((comments) => {
    res.json(200, comments);
  })
    .catch((err) => {
      const errRes = classifyError(err);
      res.status(errRes.status).json(errRes.message);
    });
});

/**
 * Add a new comment to the post
 * @returns all comments for post
 */
router.post('/:id/comment', verifyToken, (req, res) => {
  Post.addComment(req.params.id, req.body, req.user).then((comment) => {
    res.json(comment);
  })
    .catch((err) => {
      const errRes = classifyError(err);
      res.status(errRes.status).json(errRes.message);
    });
});

/**
 * Update a comment
 * @param {string} pid - post's id
 * @param {string} cid - comment's id
 */
router.put('/:pid/comment/:cid', verifyToken, (req, res) => {
  Post.updateComment(req.params.pid, req.params.cid, req.body).then((comment) => {
    res.json(comment);
  })
    .catch((err) => {
      const errRes = classifyError(err);
      res.status(errRes.status).json(errRes.message);
    });
});

/**
 * Delete a comment
 */
router.delete('/:pid/comment/:cid', verifyToken, (req, res) => {
  Post.deleteComment(req.params.pid, req.params.cid).then((msg) => {
    res.json(msg);
  })
    .catch((err) => {
      const errRes = classifyError(err);
      res.status(errRes.status).json(errRes.message);
    });
});

/**
 * Add an image
 */
router.post('/:id/image', verifyToken, upload.single('image'), (req, res) => {
  Post.findOne({ _id: req.params.id })
    .populate('author')
    .then((post) => {
      if (post.author._id !== req.user._id) {
        res.status(403);
      }

      post.addImage(req.file.buffer).then((pic) => {
        res.json(pic.buffer.toString('base64'));
      }).catch((err) => {
        res.json(err);
      });
    }).catch((err) => {
      res.json(err);
    });
});

/**
 * Get the image
 */
router.get('/:id/image', verifyToken, (req, res) => {
  Post.findOne({ _id: req.params.id })
    .populate('image')
    .then((post) => {
      res.json(post.getImage());
    }).catch((err) => {
      res.json(err);
    });
});
module.exports = router;
