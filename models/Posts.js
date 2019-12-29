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
      })
      .populate({
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
      })
      .populate({
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
      })
      .populate({
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
      })
      .populate({
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

      // Legacy code, please remove in future
      if (this.media.type === 'image') {
        this.image = media.image;
      }

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

PostSchema.statics.count = function () {
  return new Promise((resolve, reject) => {
    this.countDocuments().then((count) => {
      resolve(count);
    }).catch((err) => {
      reject(err);
    });
  });
};

// Return counts for all posts, likes, and comments
// Return object looks something like this:
// {
//   _id: 0,
//    post_count: 10,
//    like_count: 20,
//    comment_count: 30
//    recent_post_counts: {
//      past_24h: 1,
//      past_3d: 2,
//      past_7d: 3,
//      past_30d: 4,
//    }
//    recent_comment_counts: {
//      past_24h: 1,
//      past_3d: 2,
//      past_7d: 3,
//      past_30d: 4,
//    }
// }
PostSchema.statics.countMultiple = function () {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    const past24h = new Date(now - 1000 * 60 * 60 * 24);
    const past3d = new Date(now - 1000 * 60 * 60 * 24 * 3);
    const past7d = new Date(now - 1000 * 60 * 60 * 24 * 7);
    const past30d = new Date(now - 1000 * 60 * 60 * 24 * 30);

    this.aggregate([
      {
        $project: {
          likes: 1,
          comments: 1,
          _posts: {
            past_24h: { $cond: [{ $gte: ['$createdAt', past24h] }, 1, 0] },
            past_3d: { $cond: [{ $gte: ['$createdAt', past3d] }, 1, 0] },
            past_7d: { $cond: [{ $gte: ['$createdAt', past7d] }, 1, 0] },
            past_30d: { $cond: [{ $gte: ['$createdAt', past30d] }, 1, 0] },
          },
          _comments: {
            past_24h: {
              $size: { $filter: { input: '$comments', cond: { $gte: ['$$this.createdAt', past24h] } } },
            },
            past_3d: {
              $size: { $filter: { input: '$comments', cond: { $gte: ['$$this.createdAt', past3d] } } },
            },
            past_7d: {
              $size: { $filter: { input: '$comments', cond: { $gte: ['$$this.createdAt', past7d] } } },
            },
            past_30d: {
              $size: { $filter: { input: '$comments', cond: { $gte: ['$$this.createdAt', past30d] } } },
            },
          },
        },
      },
      {
        $group: {
          _id: 0,
          post_count: { $sum: 1 },
          like_count: { $sum: '$likes' },
          comment_count: { $sum: { $size: '$comments' } },
          posts_past_24h: { $sum: '$_posts.past_24h' },
          posts_past_3d: { $sum: '$_posts.past_3d' },
          posts_past_7d: { $sum: '$_posts.past_7d' },
          posts_past_30d: { $sum: '$_posts.past_30d' },
          comments_past_24h: { $sum: '$_comments.past_24h' },
          comments_past_3d: { $sum: '$_comments.past_3d' },
          comments_past_7d: { $sum: '$_comments.past_7d' },
          comments_past_30d: { $sum: '$_comments.past_30d' },
        },
      },
      {
        $project: {
          post_count: 1,
          like_count: 1,
          comment_count: 1,
          recent_post_counts: {
            past_24h: '$posts_past_24h',
            past_3d: '$posts_past_3d',
            past_7d: '$posts_past_7d',
            past_30d: '$posts_past_30d',
          },
          recent_comment_counts: {
            past_24h: '$comments_past_24h',
            past_3d: '$comments_past_3d',
            past_7d: '$comments_past_7d',
            past_30d: '$comments_past_30d',
          },
        },
      },
    ]).then((result) => {
      resolve(result[0]); // result of aggregation is an array containing 1 object
    }).catch((err) => {
      reject(err);
    });
  });
};

// Return object is an array that looks something like this:
// [{
//   _id: { tags: ['test'] },
//   post_count: 1,
//   like_count: 2,
//   comment_count: 3,
// }, ...]
PostSchema.statics.countByChannel = function () {
  return new Promise((resolve, reject) => {
    this.aggregate([
      {
        $group: {
          _id: {
            tags: '$tags',
          },
          post_count: { $sum: 1 },
          like_count: { $sum: '$likes' },
          comment_count: { $sum: { $size: '$comments' } },
        },
      },
    ]).then((result) => {
      resolve(result);
    }).catch((err) => {
      reject(err);
    });
  });
};

// Return object is an array that looks something like this:
// [{
//   date: Date(2019-12-31T00:00:00.000Z),
//   post_count: 1,
// }, ...]
// Array is sorted in ascending order by date.
PostSchema.statics.countByDate = function () {
  return new Promise((resolve, reject) => {
    this.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          post_count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: { $dateFromParts: { year: '$_id.year', month: '$_id.month', day: '$_id.day' } },
          post_count: 1,
        },
      }, {
        $sort: { date: 1 },
      },
    ]).then((result) => {
      resolve(result);
    }).catch((err) => {
      reject(err);
    });
  });
};

// Return object is an array that looks something like this:
// [{
//   date: Date(2019-12-31T00:00:00.000Z),
//   comment_count: 3,
// }, ...]
PostSchema.statics.countCommentsByDate = function () {
  return new Promise((resolve, reject) => {
    this.aggregate([
      {
        $project: { comments: 1 }, // extract only the comments field for each document
      },
      {
        $unwind: '$comments', // for every comment in a post, output its own separate document
      },
      {
        $group: { // group by date
          _id: {
            year: { $year: '$comments.createdAt' },
            month: { $month: '$comments.createdAt' },
            day: { $dayOfMonth: '$comments.createdAt' },
          },
          comment_count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: { $dateFromParts: { year: '$_id.year', month: '$_id.month', day: '$_id.day' } },
          comment_count: 1,
        },
      }, {
        $sort: { date: 1 },
      },
    ]).then((result) => {
      resolve(result);
    }).catch((err) => {
      reject(err);
    });
  });
};

// Return object is an array that looks something like this:
// [{
//   _id: { dayOfWeek: 7, hour: 22 },
//   post_count: 121,
// }, ...]
PostSchema.statics.countByDayOfWeekAndHour = function () {
  return new Promise((resolve, reject) => {
    this.aggregate([
      {
        $group: { // group by date
          _id: {
            dayOfWeek: { $dayOfWeek: '$createdAt' }, // 1 = Sunday, 7 = Saturday
            hour: { $hour: '$createdAt' }, // between 0 and 23, UTC time zone
          },
          post_count: { $sum: 1 },
        },
      },
    ]).then((result) => {
      resolve(result);
    }).catch((err) => {
      reject(err);
    });
  });
};

// Return object is an array that looks something like this:
// [{
//   _id: { dayOfWeek: 7, hour: 22 },
//   comment_count: 121,
// }, ...]
PostSchema.statics.countCommentsByDayOfWeekAndHour = function () {
  return new Promise((resolve, reject) => {
    this.aggregate([
      {
        $project: { comments: 1 }, // extract only the comments field for each document
      },
      {
        $unwind: '$comments', // for every comment in a post, output its own separate document
      },
      {
        $group: { // group by date
          _id: {
            dayOfWeek: { $dayOfWeek: '$comments.createdAt' }, // 1 = Sunday, 7 = Saturday
            hour: { $hour: '$comments.createdAt' }, // between 0 and 23, UTC time zone
          },
          comment_count: { $sum: 1 },
        },
      },
    ]).then((result) => {
      resolve(result);
    }).catch((err) => {
      reject(err);
    });
  });
};

// For now, contributing user means user made a post or comment on that day. Days are UTC.
// Return object is an array that looks something like this:
// [{
//   date: Date(2019-12-31T00:00:00.000Z),
//   contributing_user_count: 2,
// }, ...]
//
// This query is really long-winded, not sure if there's a better way to do this.
// Maybe it might be a better idea to do posts and comments in separate queries, and
// merge the two lists in application logic?
PostSchema.statics.countContributingUsers = function () {
  return new Promise((resolve, reject) => {
    this.aggregate([
      {
        $project: {
          author: 1,
          comments: 1,
          createdAt: 1,
          _is_post: { $literal: [true, false] },
        },
      },
      {
        $unwind: '$_is_post',
      },
      {
        $project: {
          author: 1,
          comments: { $cond: { if: '$_is_post', then: 'not_a_comment', else: '$comments' } },
          createdAt: 1,
          _is_post: 1,
        },
      },
      {
        $unwind: '$comments',
      },
      {
        $group: {
          _id: {
            $cond: {
              if: '$_is_post',
              then: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' },
                author: '$author',
              },
              else: {
                year: { $year: '$comments.createdAt' },
                month: { $month: '$comments.createdAt' },
                day: { $dayOfMonth: '$comments.createdAt' },
                author: '$comments.author',
              },
            },
          },
        },
      },
      {
        $group: {
          _id: { year: '$_id.year', month: '$_id.month', day: '$_id.day' },
          contributing_user_count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: { $dateFromParts: { year: '$_id.year', month: '$_id.month', day: '$_id.day' } },
          contributing_user_count: 1,
        },
      }, {
        $sort: { date: 1 },
      },
    ]).then((result) => {
      resolve(result);
    }).catch((err) => {
      reject(err);
    });
   });
  }
                     
PostSchema.methods.getMedia = function (type) {
  return new Promise((resolve, reject) => {
    Media.findOne({ _id: this.media._id })
      .then((media) => {
        resolve(media.getMedia(type));
      }).catch((err) => {
        reject(err);
      });
  });
};

PostSchema.methods.removeMedia = function () {
  return new Promise((resolve, reject) => {
    this.media = null;
    this.image = null; // Legacy code, please remove in future

    this.save().then(() => {
      resolve(this.media);
    })
      .catch((err) => {
        reject(err);
      });
  });
};

mongoose.model('Post', PostSchema);
