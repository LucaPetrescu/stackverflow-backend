const express = require("express");
const cors = require("cors");
const app = express();

const { queueConsumer, addSSEClient } = require("./rabbitmq/queueConsumer");

require("dotenv").config();
app.use(cors({ origin: "*" }));
app.use(express.json());

const PORT = process.env.PORT || 7004;

app.get("/sse", (req, res) => {
  addSSEClient(req, res);
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//Delay added for the service to start after the rabbitmq queues are initalized.
//10 seconds was the perfect timing
(async function initializeConsumers() {
  try {
    const delayMs = parseInt("10000", 10);
    console.log(`Delaying consumer initialization by ${delayMs} ms...`);
    await delay(delayMs);

    await queueConsumer("POST_QUEUE");
    console.log("Consumer initialized for POST_QUEUE.");

    await queueConsumer("REPLY_QUEUE");
    console.log("Consumer initialized for REPLY_QUEUE.");
  } catch (err) {
    console.error("Error initializing consumers:", err.message);
  }
})();
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Consumer Service running on port ${PORT}`);
});

module.exports = app;
