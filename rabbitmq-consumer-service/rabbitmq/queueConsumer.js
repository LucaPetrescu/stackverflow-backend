const amqp = require("amqplib");
const sseClients = [];

const QUEUE_NAME = "POST_QUEUE";

async function queueConsumer(queuqName) {
  const connection = await amqp.connect("amqp://user:password@rabbitmq:5672");
  const channel = await connection.createChannel();

  try {
    await channel.assertQueue(queuqName, { durable: true });
    console.log(`Waiting for messages in queue: "${queuqName}"`);

    channel.consume(
      queuqName,
      async (msg) => {
        if (msg !== null) {
          const messageContent = msg.content.toString();
          console.log(`Received message: ${messageContent}`);

          sseClients.forEach((client) => {
            client.write(
              `data: ${JSON.stringify({ message: messageContent })}\n\n`
            );
          });

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

function addSSEClient(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders();

  sseClients.push(res);

  req.on("close", () => {
    const index = sseClients.indexOf(res);
    if (index !== -1) {
      sseClients.splice(index, 1);
    }
  });
}

module.exports = { addSSEClient, queueConsumer };
