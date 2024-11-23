const amqp = require("amqplib");

async function createProducer(message) {
  const connection = await amqp.connect("amqp://user:password@rabbitmq:5672");

  const channel = await connection.createChannel();

  try {
    await channel.assertQueue("REPLY_QUEUE", { durable: true });

    const messageString = JSON.stringify(message);

    channel.sendToQueue(
      "REPLY_QUEUE",
      Buffer.from(messageString),
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
