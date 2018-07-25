const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const NotificationManager = require('../helpers/notificationManager');
const _ = require('lodash');
const { formatTags } = require('../helpers/formatters');
const config = require('../config/options');

require('./PostPicture');
const PostPicture = mongoose.model('PostPicture');

const LIMIT = 15;

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
    source: {
      type: Schema.Types.ObjectId,
      ref: 'PostPicture',
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    }
  },
  tags: [{
    type: String,
    required: true,
  }],
  likes: {
    type: Number,
    default: 0
  },
  usersLiked: [{
    type: Schema.Types.ObjectId,
    default: [],
    ref: 'User'
  }],
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

PostSchema.statics.create = function (postData, author) {
  var formattedTags = formatTags(postData.tags);

  var post = _.pick(postData, ['author', 'content', 'image']);
  post.subscribedUsers = [postData.author];
  post.tags = formattedTags;
  post.image = { source: null, width: postData.imgWidth, height: postData.imgHeight }

  return new Promise((resolve, reject) => {
    if (post.content.length > config.postCharacterLimit) {
      reject(`Post cannot be more than ${config.postCharacterLimit} characters`);
    }

    const newPost = new this(post);
    newPost.save().then(post => {

      // Dispatch notifications
      require('./Channels');
      const Channel = mongoose.model('Channel');
      Channel.findByTags(post.tags).then(channels => {
        channels.map(channel => {
          channel.notifyUsersOfPost(post, author);
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

PostSchema.statics.getAllPaginated = function (page) {
  if (!page)
    page = 1;

  return new Promise((resolve, reject) => {
    this.find()
      .sort('-createdAt')
      .skip(LIMIT * (page - 1))
      .limit(LIMIT)
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

PostSchema.statics.getUserPosts = function (userId, page) {
  if (!page) page = 1;
  return new Promise((resolve, reject) => {
    this.find({ author: ObjectId(userId) })
      .sort('-createdAt')
      .skip(LIMIT * (page - 1))
      .limit(LIMIT)
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

PostSchema.statics.updatePost = function (id, postData) {
  id = ObjectId(id);

  return new Promise((resolve, reject) => {
    if (postData.content && postData.content.length > config.postCharacterLimit) {
      reject(`Post cannot be more than ${config.postCharacterLimit} characters`);
    }

    this.findById(id).then(post => {
      if (post) {
        var updatedPost = _.extend(post, _.pick(postData, ['author', 'subscribedUsers', 'content', 'image', 'likes', 'usersLiked']));
        if (postData.tags) updatedPost.tags = formatTags(postData.tags);

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

PostSchema.statics.findByTags = function (tags, page) {
  if (!page)
    page = 1;

  return new Promise((resolve, reject) => {
    var formattedTags = formatTags(tags);

    this.find({ tags: { $in: formattedTags } })
      .sort('-createdAt')
      .skip(LIMIT * (page - 1))
      .limit(LIMIT)
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

PostSchema.statics.addComment = function (id, commentData, author) {
  id = ObjectId(id);

  var comment = _.pick(commentData, ['author', 'content']);

  return new Promise((resolve, reject) => {
    if (comment.content.length > config.commentCharacterLimit) {
      reject(`Comment cannot be more than ${config.commentCharacterLimit} characters`);
    }

    this.get(id).then(post => {
      post.comments.push(comment);

      const userAlreadySubscribed = post.subscribedUsers.some((user) => user._id.toString() === comment.author.toString());
      if (!userAlreadySubscribed) {
        post.subscribedUsers.push(comment.author);
      }

      post.save().then(updatedPost => {
        let messages = [];
        post.subscribedUsers.map(user => {
          user.notificationTokens.map(pushToken => {
            if (user._id.toString() !== comment.author.toString()) {
              messages.push({
                to: pushToken,
                sound: 'default',
                title: `${author.firstName} ${author.lastName} commented on a post you're following`,
                body: `${comment.content}`,
                data: { post: post, comment: comment },
              })
            }
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

PostSchema.methods.addImage = function(newBuffer) {
  return new Promise((resolve, reject) => {
    const newImage = new PostPicture({ buffer: newBuffer });
    newImage.save().then(pic => {
      this.image.source = pic;
      this.save().then(post => {
        resolve(post.getImage());
      })
      .catch(err => reject(err));
    })
    .catch(err => reject(err));
  });
}

PostSchema.methods.getImage = function() {
  return {
    source: this.image.buffer.toString('base64'),
    width: this.image.width,
    height: this.image.height,
  };
}

mongoose.model('Post', PostSchema);