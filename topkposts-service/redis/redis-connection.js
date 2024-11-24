const Redis = require("ioredis");

const redis = new Redis({
  host: "topk-redis",
  port: 6379,
});

module.exports = redis;
