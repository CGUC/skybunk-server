require('./Media/PostPicture');
require('./Media/Media');
const mongoose = require('mongoose');
const _ = require('lodash');
const sharp = require('sharp');
const NotificationManager = require('../helpers/notificationManager');
const { formatTags } = require('../helpers/formatters');
const config = require('../config/options');

const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;
const PostPicture = mongoose.model('PostPicture');
const Media = mongoose.model('Media');

const LIMIT = 15;

// Schema.Types vs mongoose.Types: https://github.com/Automattic/mongoose/issues/1671
// Subdocs: http://mongoosejs.com/docs/subdocs.html
const PostSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  subscribedUsers: [{
    type: Schema.Types.ObjectId,
    default: [],
    ref: 'User',
  }],
  content: {
    type: String,
    required: true,
  },
  // For legacy posts, remove once posts have been updated to use 'media'
  image: {
    type: Schema.Types.ObjectId,
    ref: 'PostPicture',
  },
  tags: [{
    type: String,
    required: true,
  }],
  likes: {
    type: Number,
    default: 0,
  },
  usersLiked: [{
    type: Schema.Types.ObjectId,
    default: [],
    ref: 'User',
  }],
  comments: [new Schema({
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    content: {
      type: String,
      required: true,
    },
  }, { timestamps: true })],
  media: {
    type: Schema.Types.ObjectId,
    ref: 'Media',
  },
}, { timestamps: true });

PostSchema.statics.create = function (postData, author) {
  const formattedTags = formatTags(postData.tags);

  const post = _.pick(postData, ['author', 'content', 'image']);
  post.subscribedUsers = [postData.author];
  post.tags = formattedTags;

  return new Promise((resolve, reject) => {
    if (post.content.length > config.postCharacterLimit) {
      reject(Error(`Post cannot be more than ${config.postCharacterLimit} characters`));
    }

    const newPost = new this(post);
    newPost.save().then((post) => {
      // Dispatch notifications
      NotificationManager.dispatchNotifications(post, author);

      resolve(post);
    })
      .catch((err) => {
        reject(err);
      });
  });
};

PostSchema.statics.get = function (id) {
  id = ObjectId(id);

  return new Promise((resolve, reject) => {
    this.findById(id)
      .populate({
        path: 'author',
        select: 'firstName lastName username profilePicture info _id',
      }).populate({
        path: 'comments.author',
        select: 'firstName lastName username profilePicture info _id',
      }).populate({
        path: 'usersLiked',
        select: 'firstName lastName _id',
      }).populate({
        path: 'media',
        select: 'type',
      })
      .populate('subscribedUsers')
      .then((post) => {
        if (post) {
          resolve(post);
        } else {
          reject(Error('Couldn\'t find a post with that ID'));
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

PostSchema.statics.getAllPaginated = function (page) {
  if (!page) page = 1;

  return new Promise((resolve, reject) => {
    this.find()
      .sort('-createdAt')
      .skip(LIMIT * (page - 1))
      .limit(LIMIT)
      .populate({
        path: 'author',
        select: 'firstName lastName username profilePicture info _id',
      })
      .populate({
        path: 'comments.author',
        select: 'firstName lastName username profilePicture info _id',
      })
      .populate({
        path: 'usersLiked',
        select: 'firstName lastName _id',
      }).populate({
        path: 'media',
        select: 'type',
      })
      .then((posts) => {
        resolve(posts);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

PostSchema.statics.getUserPosts = function (userId, page) {
  if (!page) page = 1;
  return new Promise((resolve, reject) => {
    this.find({ author: ObjectId(userId) })
      .sort('-createdAt')
      .skip(LIMIT * (page - 1))
      .limit(LIMIT)
      .populate({
        path: 'author',
        select: 'firstName lastName username info profilePicture _id',
      })
      .populate({
        path: 'comments.author',
        select: 'firstName lastName username info profilePicture _id',
      }).populate({
        path: 'media',
        select: 'type',
      })
      .populate({
        path: 'usersLiked',
        select: 'firstName lastName _id',
      })
      .then((posts) => {
        resolve(posts);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

PostSchema.statics.updatePost = function (id, postData) {
  id = ObjectId(id);

  return new Promise((resolve, reject) => {
    if (postData.content && postData.content.length > config.postCharacterLimit) {
      reject(Error(`Post cannot be more than ${config.postCharacterLimit} characters`));
    }

    this.findById(id).then((post) => {
      if (post) {
        const updatedPost = _.extend(post, _.pick(postData, ['content', 'tags']));
        if (postData.tags) updatedPost.tags = formatTags(postData.tags);

        updatedPost.save().then((post) => {
          resolve(post);
        })
          .catch((err) => {
            reject(err);
          });
      } else {
        reject(Error('Couldn\'t find a post with that ID'));
      }
    });
  });
};

PostSchema.statics.likePost = function (id, user, addLike) {
  id = ObjectId(id);

  return new Promise((resolve, reject) => {
    this.findById(id).then((post) => {
      if (post && post.usersLiked) {
        if (addLike) {
          if (post.usersLiked.some(e => e === user)) {
            reject(Error('Already liked'));
          } else {
            // add user to list
            post.usersLiked.push(user);
            post.likes = post.usersLiked.length;
          }
        } else if (post.usersLiked.some(e => e.toString() === user.toString())) {
          // remove every instance of user from list
          post.usersLiked = post.usersLiked.filter(u => u.toString() !== user.toString());
          post.likes = post.usersLiked.length;
        } else {
          reject(Error('Already not liked'));
        }
        post.save().then((post) => {
          resolve(post);
        })
          .catch((err) => {
            reject(err);
          });
      } else {
        reject(Error('Couldn\'t find a post with that ID'));
      }
    });
  });
};

PostSchema.statics.delete = function (id) {
  id = ObjectId(id);

  return new Promise((resolve, reject) => {
    this.deleteOne({ _id: id }).then(() => {
      resolve('Successfully deleted post');
    })
      .catch((err) => {
        reject(err);
      });
  });
};

PostSchema.statics.findByTags = function (tags, page) {
  if (!page) page = 1;

  return new Promise((resolve, reject) => {
    const formattedTags = formatTags(tags);

    this.find({ tags: { $in: formattedTags } })
      .sort('-createdAt')
      .skip(LIMIT * (page - 1))
      .limit(LIMIT)
      .populate({
        path: 'author',
        select: 'firstName lastName username info profilePicture _id',
      })
      .populate({
        path: 'comments.author',
        select: 'firstName lastName username info profilePicture _id',
      })
      .populate({
        path: 'usersLiked',
        select: 'firstName lastName _id',
      }).populate({
        path: 'media',
        select: 'type',
      })
      .then((posts) => {
        resolve(posts);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

PostSchema.statics.getComments = function (id) {
  id = ObjectId(id);

  return new Promise((resolve, reject) => {
    this.get(id).then((post) => {
      resolve(post.comments);
    })
      .catch((err) => {
        reject(err);
      });
  });
};

PostSchema.statics.addComment = function (id, commentData, author) {
  id = ObjectId(id);

  const comment = _.pick(commentData, ['author', 'content']);

  return new Promise((resolve, reject) => {
    if (comment.content.length > config.commentCharacterLimit) {
      reject(Error(`Comment cannot be more than ${config.commentCharacterLimit} characters`));
    }

    this.get(id).then((post) => {
      post.comments.push(comment);

      const userAlreadySubscribed = post
        .subscribedUsers
        .some(user => user._id.toString() === comment.author.toString());

      if (!userAlreadySubscribed) {
        post.subscribedUsers.push(comment.author);
      }

      post.save().then((updatedPost) => {
        const messages = [];
        post.subscribedUsers.forEach((user) => {
          let title;
          if (user._id.toString() === post.author._id) {
            title = `${author.firstName} ${author.lastName} commented on your post`;
          } else {
            title = `${author.firstName} ${author.lastName} commented on a post you're following`;
          }
          if (user._id.toString() !== comment.author.toString()) {
            const notificationData = {
              title,
              body: `${comment.content}`,
              data: { post: post._id, comment: comment._id },
            };
            NotificationManager.saveNotificationForUserAsync(notificationData, user);

            user.notificationTokens.forEach((pushToken) => {
              messages.push({
                to: pushToken,
                sound: 'default',
                ...notificationData,
              });
            });
          }
        });

        NotificationManager.sendNotifications(messages);

        resolve(updatedPost.comments);
      })
        .catch((err) => {
          reject(err);
        });
    })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * TODO: Currently, updating a comment will update the post's 'updatedAt' timestamp as well,
 * which is probably something we don't want. This is due to the fact that subdocuments
 * can only be saved with their parent (in this case, Post)'s save() method.
 */
PostSchema.statics.updateComment = function (postId, commentId, commentData) {
  postId = ObjectId(postId);
  commentId = ObjectId(commentId);

  const comment = _.pick(commentData, ['author', 'content']);

  return new Promise((resolve, reject) => {
    if (comment.content && comment.content.length > config.commentCharacterLimit) {
      reject(Error(`Comment cannot be more than ${config.commentCharacterLimit} characters`));
    }

    this.get(postId).then((post) => {
      const oldComment = post.comments.id(commentId);
      oldComment.set(comment);

      post.save().then((updatedPost) => {
        resolve(updatedPost.comments.id(commentId));
      })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};

PostSchema.statics.deleteComment = function (postId, commentId) {
  postId = ObjectId(postId);
  commentId = ObjectId(commentId);

  return new Promise((resolve, reject) => {
    this.get(postId).then((post) => {
      post.comments.id(commentId).remove();
      post.save().then(() => {
        resolve('Sucessfully deleted comment');
      })
        .catch((err) => {
          reject(err);
        });
    })
      .catch((err) => {
        reject(err);
      });
  });
};

// For Legacy posts. Remove once all posts have been updated to use 'media'
PostSchema.methods.addImage = function (newBuffer) {
  return new Promise((resolve, reject) => {
    sharp(newBuffer)
      .resize({ height: 600, width: 600, withoutEnlargement: true })
      .jpeg()
      .toBuffer()
      .then((outputBuffer) => {
        const newImage = new PostPicture({ buffer: outputBuffer });
        newImage.save().then((pic) => {
          this.image = pic;
          this.save().then((post) => {
            resolve(post.image);
          })
            .catch(err => reject(err));
        })
          .catch(err => reject(err));
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// For Legacy posts. Remove once all posts have been updated to use 'media'
PostSchema.methods.getImage = function () {
  return this.image.buffer.toString('base64');
};

PostSchema.methods.addMedia = function (type, data) {
  return new Promise((resolve, reject) => {
    Media.create(type, data).then((media) => {
      this.media = media;

      this.save().then(() => {
        resolve(this.media);
      })
        .catch((err) => {
          reject(err);
        });
    })
      .catch((err) => {
        reject(err);
      });
  });
};

PostSchema.methods.getMedia = function (type) {
  return new Promise((resolve, reject) => {
    Media.findOne({ _id: this.media._id })
    .then((media) => {
      resolve(media.getMedia(type))
    }).catch(err => {
      reject(err);
    })
  });
};

PostSchema.methods.removeMedia = function () {
  return new Promise((resolve, reject) => {
    this.media = null;

    this.save().then(() => {
      resolve(this.media);
    })
    .catch((err) => {
      reject(err);
    });
  });
};

mongoose.model('Post', PostSchema);
