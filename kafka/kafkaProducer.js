const { Kafka } = require('kafkajs');

// Initialize Kafka client and producer
const kafka = new Kafka({
  clientId: 'social-media-platform',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();

const sendMessage = async (topic, message) => {
  await producer.connect(); // Connect to Kafka
  await producer.send({
    topic,
    messages: [{ value: message }], // Send the message to the specified topic
  });
  await producer.disconnect(); // Disconnect the producer
};

module.exports = sendMessage; // Export the sendMessage function
