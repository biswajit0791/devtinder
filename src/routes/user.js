const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const USER_SAFE_LIST = [
  "firstName",
  "lastName",
  "photoUrl",
  "skills",
  "gender"
];

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequest = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested"
    }).populate("fromUserId", USER_SAFE_LIST);
    res.json({
      message: "Data fetched successfully",
      data: connectionRequest
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connections = await ConnectionRequest.find({
      status: "accepted",
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }]
    })
      .populate("fromUserId", USER_SAFE_LIST)
      .populate("toUserId", USER_SAFE_LIST);
    const acceptedUsers = connections.map((row) => {
      return loggedInUser._id.toString() === row.fromUserId._id.toString()
        ? row.toUserId
        : row.fromUserId;
    });
    res.json({ data: acceptedUsers });
  } catch (err) {
    res.status(400).json({ message: "ERROR: " + err.message });
  }
});
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;
    const connectionRequest = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }]
    }).select("fromUserId toUserId");
    const connectedUserList = new Set();
    connectionRequest.forEach((connection) => {
      connectedUserList.add(connection.fromUserId.toString());
      connectedUserList.add(connection.toUserId.toString());
    });
    const feedData = await User.find({
      $and: [
        { _id: { $nin: Array.from(connectedUserList) } },
        { _id: { $ne: loggedInUser._id } }
      ]
    })
      .select(USER_SAFE_LIST)
      .skip(skip)
      .limit(limit);
    res.json({ message: "Data fetched successfully!!", data: feedData });
  } catch (err) {
    res.status(400).json({ message: "ERROR: " + err.message });
  }
});
module.exports = userRouter;
