const express = require("express");
const Redis = require("ioredis");

const app = express();
const PORT = 3000;

const redis = new Redis({
  host: "stackoverflow-redis", // Replace with your Redis server hostname
  port: 6379, // Default Redis port
  password: null, // Add password if your Redis server is secured
});

// Route to set and retrieve a Redis key-value pair
app.get("/setredis", async (req, res) => {
  const { key, value } = req.query;

  if (!key || !value) {
    return res
      .status(400)
      .send('Please provide both "key" and "value" query parameters.');
  }

  try {
    await redis.set(key, value);
    console.log(`Key "${key}" set with value "${value}".`);

    const retrievedValue = await redis.get(key);

    if (retrievedValue) {
      return res
        .status(200)
        .send(
          `Key "${key}" was successfully set with value: "${retrievedValue}".`
        );
    } else {
      return res.status(404).send(`Key "${key}" not found in Redis.`);
    }
  } catch (error) {
    console.error("Error interacting with Redis:", error);
    return res
      .status(500)
      .send("An error occurred while interacting with Redis.");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:3000`);
});
