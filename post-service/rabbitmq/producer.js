const amqp = require("amqplib");

const QUEUE_NAME = process.env.QUEUE_NAME;
const RABBITMQ_URL = process.env.RABBITMQ_URL;

async function createProducer(message) {
  const connection = await amqp.connect("amqp://user:password@rabbitmq:5672");
  console.log(connection);
  const channel = await connection.createChannel();

  try {
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    channel.sendToQueue(
      QUEUE_NAME,
      Buffer.from(message),
      { persistent: true },
      (err) => {
        if (err) {
          console.error(`Message NOT acknowledged by broker: ${err.message}`);
        } else {
          console.log(
            `Message successfully acknowledged by broker: "${message}"`
          );
        }
      }
    );
  } catch (error) {
    console.error(`Error in producer: ${err.message}`);
  } finally {
    setTimeout(() => {
      connection.close();
    }, 500);
  }
}

module.exports = { createProducer };
