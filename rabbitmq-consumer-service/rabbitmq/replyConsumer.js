const amqp = require("amqplib");

const QUEUE_NAME = "REPLY_QUEUE";

async function replyConsumer() {
  const connection = await amqp.connect("amqp://user:password@rabbitmq:5672");
  const channel = await connection.createChannel();

  try {
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log(`Waiting for messages in queue: "${QUEUE_NAME}"`);

    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (msg !== null) {
          const messageContent = msg.content.toString();
          console.log(`Received message: ${messageContent}`);

          try {
            channel.ack(msg);
            console.log(`Acknowledged message: ${messageContent}`);
          } catch (error) {
            console.error(`Failed to process message: ${error.message}`);

            channel.nack(msg, false, true);
          }
        }
      },
      { noAck: false }
    );
  } catch (err) {
    console.error(`Error in consumer: ${err.message}`);
  }
}

module.exports = { replyConsumer };
