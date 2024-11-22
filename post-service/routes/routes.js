const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/createPost", authMiddleware, postController.createPost);
router.post("/upvotePost", authMiddleware, postController.upvotePost);
router.post("/downvotePost", authMiddleware, postController.downvotePost);
router.get("/getAllPosts", authMiddleware, postController.getAllPosts);
router.get("/getPostById/:postId", authMiddleware, postController.getPostById);
router.patch(
  "/addCommentToPost/:postId",
  authMiddleware,
  postController.addCommentToPost
);

module.exports = router;
