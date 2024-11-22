const axios = require("axios");
const Comment = require("../models/Comment");

exports.commentToPost = async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.query.postId;
    const userId = req.user.userId;

    if (!content) {
      return res.status(400).send({ message: "Content is required" });
    }

    if (!postId) {
      res.status(400).send({ message: "Post ID is required" });
    }

    if (!userId) {
      res.status(400).send({ message: "User ID is required" });
    }

    const comment = Comment.create({ postId, userId, content });

    try {
      await axios.patch(
        `http://posts-srv-app:7001/post/addCommentToPost/${postId}`,

        { commentId: comment._id }
      );
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error creating comment", error: error.message });
    }

    res
      .status(201)
      .send({ message: "Comment added to the post", comment: comment });
  } catch (error) {
    res.status(500).send({ message: "Error" });
  }
};
