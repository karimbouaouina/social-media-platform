const { Kafka } = require('kafkajs');

// Initialize Kafka client and consumer
const kafka = new Kafka({
  clientId: 'social-media-platform',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'social-media-group' });

const run = async () => {
  await consumer.connect(); // Connect the consumer to Kafka
  await consumer.subscribe({ topic: 'user-events', fromBeginning: true }); // Subscribe to the user-events topic
  await consumer.subscribe({ topic: 'post-events', fromBeginning: true }); // Subscribe to the post-events topic
  await consumer.subscribe({ topic: 'comment-events', fromBeginning: true }); // Subscribe to the comment-events topic

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      // Log the topic, partition, and message value
      console.log({
        topic,
        partition,
        offset: message.offset,
        value: message.value.toString(),
      });
    },
  });
};

run().catch(console.error); // Run the consumer and catch any errors