const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const { verifyToken, verifyAdmin } = require('../helpers/authorization');

require('../models/Channels');
const Channel = mongoose.model('Channel');

require('../models/Posts');
const Post = mongoose.model('Post');

require('../models/User');
const User = mongoose.model('User');

router.get('/eyes', verifyToken, verifyAdmin, async (req, res) => {
  try {
    let user_count = await User.count();
    let channel_count = await Channel.count();
    let post_counts = await Post.countMultiple();
    let posts_by_channels = await Post.countByChannel();
    let posts_by_date = await Post.countByDate();
    let comments_by_date = await Post.countCommentsByDate();
    let posts_by_dayOfWeek_and_hour = await Post.countByDayOfWeekAndHour();
    let comments_by_dayOfWeek_and_hour = await Post.countCommentsByDayOfWeekAndHour();
    let user_subscriptions_by_channel = await User.countSubscriptionsByChannel();
    let users_by_role = await User.countByRole();
    let users_active_by_date = await Post.countActiveUsers(); // either posts or comments

    res.json({
      counts: {
        users: user_count,
        channels: channel_count,
        posts: post_counts.post_count,
        likes: post_counts.like_count,
        comments: post_counts.comment_count,
      },
      posts: {
        by_channel: posts_by_channels,
        by_date: posts_by_date,
        by_dayOfWeek_and_hour: posts_by_dayOfWeek_and_hour,
      },
      comments: {
        by_date: comments_by_date,
        by_dayOfWeek_and_hour: comments_by_dayOfWeek_and_hour,
      },
      users: {
        subscriptions_by_channel: user_subscriptions_by_channel,
        by_role: users_by_role,
        active_by_date: users_active_by_date,
      }
    });
  } catch (err) {
     console.error(err);
     res.status(500).send('error');
  }
});

module.exports = router;
