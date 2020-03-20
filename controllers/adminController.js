const express = require("express");

const router = express.Router();
const adminHelper = require("../helpers/adminHelper");
const { verifyToken, verifyAdmin } = require("../helpers/authorization");

router.post("/tickets", verifyToken, verifyAdmin, (req, res) => {
  adminHelper
    .generateTickets(req.body.count)
    .then(tickets => {
      res.json(tickets);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("error");
    });
});

router.post("/inviteUsers", verifyToken, verifyAdmin, (req, res) => {
  adminHelper
    .inviteUsers(req.body.users)
    .then(status => {
      res.json(status);
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("error");
    });
});

module.exports = router;
