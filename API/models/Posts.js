const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// TODO: implement comments model
// require('./Comments');
// const Comment = mongoose.model('Comment');

const PostSchema = new Schema({
	author: {
    //type: Schema.Types.ObjectId,
    type: String,
    required: true,
    ref: 'User'
  },
  subscribedUsers: {
    type: Array,
    default: [],
    ref: 'User'
  },
	content: {
		type: String,
		required: true,
  },
  image: {
    type: Buffer,
  },
	tags: {
		type: Array,
		required: true,
  },
  comments: {
    type: Array,
    ref: 'Comment'
  },
  createdAt: {
    type: Object,
  },
  updatedAt: {
    type: Object,
  }
});

PostSchema.statics.create = function(post) {
  // Implement a character limit client-side
  if (!post.createdAt) {
    post.createdAt = new Date();
  }
	var formattedTags = [];
	post.tags.forEach((tag) => {
    formattedTags.push(tag.toLowerCase());
  });
  var post = {
    ...post,
    subscribedUsers: post.author,
    tags: formattedTags,
  }
	return new Promise((resolve, reject) => {
    this.find({ content: post.content }).then(existingPost => {
      if (existingPost && existingPost.length) {
        reject(`Hmm, it looks like a post with the exact same content already exists. Try something new!`);
      } else {
        const newPost = new this(post);
        newPost.save().then(post => {
          resolve(post);
        })
        .catch(err => {
          reject(err);
        });
      }
    })
    .catch(err => {
      reject(err);
    });
  });
}

PostSchema.statics.get = function(id) {
  if (typeof id === 'string') id = mongoose.Types.ObjectId(id);

  return new Promise((resolve, reject) => {
    this.findById(id).then(post => {
      if (post) {
        resolve(post);
      }
      else {
        reject(`Couldn't find a post with that ID`);
      }
    })
    .catch(err => {
      reject(err);
    });
  })
}

PostSchema.statics.updatePost = function(id, postObj) {
  if (typeof id === 'string') id = mongoose.Types.ObjectId(id);

  postObj = {
    ...postObj,
    updatedAt: new Date()
  }

  return new Promise((resolve, reject) => {
    this.update({ _id: id }, postObj).then(post => {
      resolve();
    })
    .catch(err => {
      reject(err);
    })
  });
}

PostSchema.statics.delete = function(id) {
  if (typeof id === 'string') id = mongoose.Types.ObjectId(id);

  return new Promise((resolve, reject) => {
    this.deleteOne({ _id: id }).then(() => {
      resolve(`Successfully deleted post`);
    })
    .catch(err => {
      reject(err);
    });
  });
}

PostSchema.statics.findByTags = function(tags) {
  return new Promise((resolve, reject) => {
    // format tags into array
    var tagArray = [];
    if (typeof tags === 'object') {
      // likely in format of database query return
      tags.forEach((tag) => {
        tagArray.push(tag);
      });
    } else if (typeof tags === 'string') {
      // assume only one tag passed in as string
      tagArray.push(tags);
    } else tagArray = tags; // assume already an array

    this.find({ tags: {$in: tags} }).then(posts => {
      resolve(posts);
    })
    .catch(err => {
      reject(err);
    });
  });
}

PostSchema.statics.getComments = function(id) {
  if (typeof id === 'string') id = mongoose.Types.ObjectId(id);

  return new Promise((resolve, reject) => {
    this.get(id).then(post => {
      if (post.comments) {
        resolve(post.comments);
      } else {
        reject(`No comments found for this post`);
      }
    })
    .catch(err => {
      reject(err);
    });
  });
}

/**
 * Add a comment to a post instance.
 * This should call the Comment create method, then add
 * that comment to its own document.
 */
PostSchema.statics.addComment = function(id, commentObj){
/**
 * TODO: implement.
 */
}

mongoose.model('Post', PostSchema);