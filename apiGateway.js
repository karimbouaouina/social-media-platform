const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const connectDB = require('./database');
const resolvers = require('./graphql/resolvers');
const typeDefs = require('./graphql/schema');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const sendMessage = require('./kafka/kafkaProducer');

const app = express();
connectDB();

app.use(cors());
app.use(bodyParser.json());

// Load Protos
const userProtoPath = __dirname + '/user/user.proto';
const postProtoPath = __dirname + '/post/post.proto';
const commentProtoPath = __dirname + '/comment/comment.proto';

const userPackageDefinition = protoLoader.loadSync(userProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const postPackageDefinition = protoLoader.loadSync(postProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const commentPackageDefinition = protoLoader.loadSync(commentProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const userProto = grpc.loadPackageDefinition(userPackageDefinition).user;
const postProto = grpc.loadPackageDefinition(postPackageDefinition).post;
const commentProto = grpc.loadPackageDefinition(commentPackageDefinition).comment;

const userClient = new userProto.UserService('localhost:50051', grpc.credentials.createInsecure());
const postClient = new postProto.PostService('localhost:50052', grpc.credentials.createInsecure());
const commentClient = new commentProto.CommentService('localhost:50053', grpc.credentials.createInsecure());

// REST Endpoints for User
app.post('/user', (req, res) => {
  userClient.CreateUser(req.body, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('user-events', `User created: ${response.name}`);
      res.send(response);
    }
  });
});

app.get('/user/:id', (req, res) => {
  userClient.GetUser({ id: req.params.id }, (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      res.send(response);
    }
  });
});

app.put('/user/:id', (req, res) => {
  const updatedUser = { ...req.body, id: req.params.id };
  userClient.UpdateUser(updatedUser, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('user-events', `User updated: ${response.name}`);
      res.send(response);
    }
  });
});

app.delete('/user/:id', (req, res) => {
  userClient.DeleteUser({ id: req.params.id }, async (error, response) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      await sendMessage('user-events', `User deleted: ${response.name}`);
      res.send(response);
    }
  });
});


// GraphQL Endpoint
const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app, path: '/graphql' });

const port = 3000;
app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
  console.log(`GraphQL endpoint available at http://localhost:${port}${server.graphqlPath}`);
});
