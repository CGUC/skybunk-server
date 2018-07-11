const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const NotificationManager = require('../helpers/notificationManager');
const _ = require('lodash');

const { formatTags } = require('../helpers/formatters');
const config = require('../config/options');

// Schema.Types vs mongoose.Types: https://github.com/Automattic/mongoose/issues/1671
// Subdocs: http://mongoosejs.com/docs/subdocs.html
const PostSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  subscribedUsers: [{
    type: Schema.Types.ObjectId,
    default: [],
    ref: 'User'
  }],
  content: {
    type: String,
    required: true,
  },
  image: {
    type: Buffer,
  },
  tags: [{
    type: String,
    required: true,
  }],
  likes: {
    type: Number,
    default: 0
  },
  comments: [new Schema({
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    content: {
      type: String,
      required: true,
    },
  }, { timestamps: true })],
}, { timestamps: true });

require('./Channels');
const Channel = mongoose.model('Channel');

PostSchema.statics.create = function (postData) {
  var formattedTags = formatTags(postData.tags);

  var post = _.pick(postData, ['author', 'content', 'image']);
  post.subscribedUsers = [postData.author];
  post.tags = formattedTags;

  return new Promise((resolve, reject) => {
    if (post.content.length > config.postCharacterLimit) {
      reject(`Post cannot be more than ${config.postCharacterLimit} characters`);
    }

    const newPost = new this(post);
    newPost.save().then(post => {
      // Dispatch notifications
      Channel.findByTags(post.tags).then(channels => {
        channels.map(channel => {
          channel.notifyUsersOfPost(post);
        });
      }).catch(err => console.log(err));

      resolve(post);
    })
    .catch(err => {
      reject(err);
    });
  });
}

PostSchema.statics.get = function (id) {
  id = ObjectId(id);

  return new Promise((resolve, reject) => {
    this.findById(id)
      .populate({
        path: 'author',
        select: 'firstName lastName username profilePicture _id',
      }).populate({
        path: 'comments.author',
        select: 'firstName lastName username profilePicture _id'
      }).populate('subscribedUsers')
      .then(post => {
        if (post) {
          resolve(post);
        }
        else {
          reject('Couldn\'t find a post with that ID');
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}

PostSchema.statics.getAll = function () {
  return new Promise((resolve, reject) => {
    this.find()
      .populate({
        path: 'author',
        select: 'firstName lastName username profilePicture _id'
      })
      .populate({
        path: 'comments.author',
        select: 'firstName lastName username profilePicture _id'
      }).then(posts => {
        resolve(posts);
      })
      .catch(err => {
        reject(err);
      });
  });
}

PostSchema.statics.updatePost = function (id, postData) {
  id = ObjectId(id);
  var formattedTags = formatTags(postData.tags);

  return new Promise((resolve, reject) => {
    if (postData.content && postData.content.length > config.postCharacterLimit) {
      reject(`Post cannot be more than ${config.postCharacterLimit} characters`);
    }

    this.findById(id).then(post => {
      if (post) {
        var updatedPost = _.extend({}, post, _.pick(postData, ['author', 'subscribedUsers', 'content', 'image', 'likes']));
        updatedPost.tags = formattedTags;

        updatedPost.save().then(post => {
          resolve(post);
        })
          .catch(err => {
            reject(err);
          });
      }
      else {
        reject('Couldn\'t find a post with that ID');
      }
    });
  });
}

PostSchema.statics.delete = function (id) {
  id = ObjectId(id);

  return new Promise((resolve, reject) => {
    this.deleteOne({ _id: id }).then(() => {
      resolve('Successfully deleted post');
    })
      .catch(err => {
        reject(err);
      });
  });
}

PostSchema.statics.findByTags = function (tags) {
  return new Promise((resolve, reject) => {
    var formattedTags = formatTags(tags);

    this.find({ tags: { $in: formattedTags } })
      .populate({
        path: 'author',
        select: 'firstName lastName username profilePicture _id',
      }).populate({
        path: 'comments.author',
        select: 'firstName lastName username profilePicture _id'
      }).then(posts => {
        resolve(posts);
      })
      .catch(err => {
        reject(err);
      });
  });
}

PostSchema.statics.getComments = function (id) {
  id = ObjectId(id);

  return new Promise((resolve, reject) => {
    this.get(id).then(post => {
      resolve(post.comments);
    })
      .catch(err => {
        reject(err);
      });
  });
}

PostSchema.statics.addComment = function (id, commentData) {
  id = ObjectId(id);

  var comment = _.pick(commentData, ['author', 'content']);

  return new Promise((resolve, reject) => {
    if (comment.content.length > config.commentCharacterLimit) {
      reject(`Comment cannot be more than ${config.commentCharacterLimit} characters`);
    }

    this.get(id).then(post => {
      post.comments.push(comment);

      post.save().then(updatedPost => {
        let messages = [];
        post.subscribedUsers.map(user => {
          user.notificationTokens.map(pushToken => {
            messages.push({
              to: pushToken,
              sound: 'default',
              body: `${user.firstName} ${user.lastName} commented on a post you're following:\n${comment.content}`,
              data: { post: post, comment: comment },
            })
          });
        })

        NotificationManager.sendNotifications(messages);

        resolve(updatedPost.comments);
      })
        .catch(err => {
          reject(err);
        });
    })
      .catch(err => {
        reject(err);
      });
  });
}

/**
 * TODO: Currently, updating a comment will update the post's 'updatedAt' timestamp as well,
 * which is probably something we don't want. This is due to the fact that subdocuments
 * can only be saved with their parent (in this case, Post)'s save() method.
 */
PostSchema.statics.updateComment = function (postId, commentId, commentData) {
  postId = ObjectId(postId);
  commentId = ObjectId(commentId);

  var comment = _.pick(commentData, ['author', 'content']);

  return new Promise((resolve, reject) => {
    if (comment.content && comment.content.length > config.commentCharacterLimit) {
      reject(`Comment cannot be more than ${config.commentCharacterLimit} characters`);
    }

    this.get(postId).then(post => {
      const oldComment = post.comments.id(commentId);
      oldComment.set(comment);

      post.save().then(updatedPost => {
        resolve(updatedPost.comments.id(commentId));
      })
        .catch(err => {
          console.error(err);
          reject(err);
        });
    })
      .catch(err => {
        console.error(err);
        reject(err);
      });
  });
}

PostSchema.statics.deleteComment = function (postId, commentId) {
  postId = ObjectId(postId);
  commentId = ObjectId(commentId);

  return new Promise((resolve, reject) => {
    this.get(postId).then(post => {
      post.comments.id(commentId).remove();
      post.save().then(() => {
        resolve('Sucessfully deleted comment');
      })
        .catch(err => {
          reject(err);
        });
    })
      .catch(err => {
        reject(err);
      });
  });
}

mongoose.model('Post', PostSchema);