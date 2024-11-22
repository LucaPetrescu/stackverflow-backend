const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/commentToPost/:postId",
  authMiddleware,
  commentController.commentToPost
);

module.exports = router;
