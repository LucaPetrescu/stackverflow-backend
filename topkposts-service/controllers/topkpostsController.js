const mongoose = require("mongoose");
const Post = require("../models/Post");

exports.getTopKPosts = async (req, res) => {
  try {
    const aggregationPipelineForFetching = [
      {
        $addFields: { numComments: { $size: "$comments" } },
      },
      {
        $sort: {
          upvotes: -1,
          numComments: -1,
        },
      },
      {
        $limit: 10,
      },
    ];

    const topKPosts = await Post.aggregate(aggregationPipelineForFetching);

    const aggregationPipelineForMerging = [
      ...aggregationPipelineForFetching,
      {
        $merge: {
          into: "top_posts",
          whenMatched: "merge",
          whenNotMatched: "insert",
        },
      },
    ];

    await Post.aggregate(aggregationPipelineForMerging);

    res
      .status(200)
      .send({ message: "Top 10 posts retrieved successfully", topKPosts });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error fetching top 10 posts", error: error.message });
  }
};
