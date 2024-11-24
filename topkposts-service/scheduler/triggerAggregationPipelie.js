const schedule = require("node-schedule");
const redis = require("../redis/redis-connection");
const crypto = require("crypto");

exports.triggerAggregationPipeline = async (redis) => {
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

    const topKPosts = await Post.aggregate(aggregationPipelineForFetching);
    await Post.aggregate(aggregationPipelineForMerging);

    await redis.set("topKPosts", JSON.stringify(topKPosts), "EX", 300);

    console.log("Top 10 posts aggregation and cache update completed.");
  } catch (error) {
    console.error(
      "Error during aggregation pipeline execution:",
      error.message
    );
  }
};

const generateHash = (data) => {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
};

exports.updateCacheIfChanged = async (topKPosts) => {
  try {
    const cachedPosts = await redis.get("topKPosts");

    if (cachedPosts) {
      const cachedPostsData = JSON.parse(cachedPosts);

      const newHash = generateHash(topKPosts);
      const cachedHash = generateHash(cachedPostsData);

      if (newHash === cachedHash) {
        console.log(
          "No changes detected in the top 10 posts. Cache not updated."
        );
        return;
      }
    }

    await redis.set("topKPosts", JSON.stringify(topKPosts), "EX", 300);
    console.log("Cache updated with the latest top 10 posts.");
  } catch (error) {
    console.error("Error updating the cache:", error.message);
  }
};

schedule.scheduleJob("*/5 * * * *", this.triggerAggregationPipeline);
