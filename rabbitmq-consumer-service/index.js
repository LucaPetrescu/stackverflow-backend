const express = require("express");
const app = express();

const { postConsumer } = require("./rabbitmq/postConsumer");
const { replyConsumer } = require("./rabbitmq/replyConsumer");

dotenv.config();

app.use(express.json());

const PORT = process.env.PORT || 7004;

postConsumer()
  .then(() => console.log("Consumer initialized."))
  .catch((err) => console.error("Error initializing consumer:", err.message));

replyConsumer()
  .then(() => console.log("Consumer initialized."))
  .catch((err) => console.error("Error initializing consumer:", err.message));
app.listen(PORT, () => {
  console.log(`Consumer Service running on port ${PORT}`);
});
