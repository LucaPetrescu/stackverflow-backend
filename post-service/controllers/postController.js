const Post = require("../models/Post");
const Redis = require("ioredis");

const redis = new Redis({
  host: "stackoverflow-redis",
  port: 6379,
  password: null,
});

exports.createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    const userId = req.user.id;

    if (!title || !content) {
      return res
        .status(400)
        .send({ message: "Title and content are required" });
    }

    const post = await Post.create({ userId, title, content });

    res.status(201).send(post);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error creating post", error: error.message });
  }
};

exports.upvotePost = async (req, res) => {
  try {
    const { postId } = req.query;

    if (!postId) {
      return res.status(400).send({ message: "Post ID is required" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    post.upvotes = (post.upvotes || 0) + 1;

    await post.save();

    res.status(200).send({ message: "Post upvoted successfully", post });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error upvoting post", error: error.message });
  }
};

exports.downvotePost = async (req, res) => {
  try {
    const { postId } = req.query;

    if (!postId) {
      return res.status(400).send({ message: "Post ID is required" });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    post.downvotes = (post.downvotes || 0) + 1;

    await post.save();

    res.status(200).send({ message: "Post downvoted successfully", post });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error downvoting post", error: error.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find();

    res.status(200).send({
      message: "All posts retrieved successfully",
      posts,
    });
  } catch (error) {
    res.status(500).send({
      message: "Error fetching all posts",
      error: error.message,
    });
  }
};

exports.getPostById = async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    return res.status(400).send({ message: "Post ID is required." });
  }

  try {
    const cachedPost = await redis.get(postId);

    if (cachedPost) {
      return res.status(200).send({
        message: "Post retrieved from cache",
        post: JSON.parse(cachedPost),
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).send({ message: "Post not found." });
    }

    await redis.set(postId, JSON.stringify(post), "EX", 3600);

    return res
      .status(200)
      .send({ message: "Post retrieved from database and cached", post });
  } catch (error) {
    return res
      .status(500)
      .send({ message: "Error fetching post", error: error.message });
  }
};
