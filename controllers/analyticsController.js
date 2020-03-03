const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
const { verifyToken, verifyAdmin } = require("../helpers/authorization");

require("../models/Channels");
require("../models/Posts");
require("../models/User");

const Channel = mongoose.model("Channel");
const Post = mongoose.model("Post");
const User = mongoose.model("User");

router.get("/eyes", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const userCount = await User.count();
    const channelCount = await Channel.count();
    const postCounts = await Post.countMultiple();
    const postsByChannels = await Post.countByChannel();
    const postsByDate = await Post.countByDate();
    const commentsByDate = await Post.countCommentsByDate();
    const postsByDayOfWeekAndHour = await Post.countByDayOfWeekAndHour();
    const commentsByDayOfWeekAndHour = await Post.countCommentsByDayOfWeekAndHour();
    const userSubscriptionsByChannel = await User.countSubscriptionsByChannel();
    const usersByRole = await User.countByRole();
    const usersContributingByDate = await Post.countContributingUsers(); // either posts or comments

    res.json({
      counts: {
        users: userCount,
        channels: channelCount,
        posts: postCounts.post_count,
        likes: postCounts.like_count,
        comments: postCounts.comment_count
      },
      posts: {
        recent_counts: postCounts.recent_post_counts,
        by_channel: postsByChannels,
        by_date: postsByDate,
        by_dayOfWeek_and_hour: postsByDayOfWeekAndHour
      },
      comments: {
        recent_counts: postCounts.recent_comment_counts,
        by_date: commentsByDate,
        by_dayOfWeek_and_hour: commentsByDayOfWeekAndHour
      },
      users: {
        subscriptions_by_channel: userSubscriptionsByChannel,
        by_role: usersByRole,
        contributing_by_date: usersContributingByDate
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});

module.exports = router;
