const mongoose = require("mongoose");

exports.createPost = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Authorization header is missing" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token is missing" });
    }
  } catch (e) {}
};

exports.replyToPost = async (req, res) => {};

exports.upvotePost = async (req, res) => {};

exports.downvotePost = async (req, res) => {};
