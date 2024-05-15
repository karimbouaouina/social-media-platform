const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Post = require('./post');

// Load PROTO FILE PATH
const PROTO_PATH = __dirname + '/post.proto';
// Load gRPC protobuf
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
// Load the proto file
const postProto = grpc.loadPackageDefinition(packageDefinition).post;
// Create gRPC server
const server = new grpc.Server();
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/social_media', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected...'))
  .catch(err => console.error(err));
// Implement gRPC service methods 
server.addService(postProto.PostService.service, {
  CreatePost: async (call, callback) => {
    const { title, content, userId } = call.request; 
    const post = new Post({ title, content, userId }); // Create a new post instance from the request
    await post.save(); // Save the post instance
    callback(null, post); // Return the saved comment
  },
  GetPost: async (call, callback) => {
    const post = await Post.findById(call.request.id); // Get the post instance by id
    callback(null, post); // Return the comment
  },
  UpdatePost: async (call, callback) => {
    const { id, title, content, userId } = call.request; 
    const post = await Post.findByIdAndUpdate(id, { title, content, userId }, { new: true }); // Get the post by id and update it with the new content
    callback(null, post); // Return the updated comment
  },
  DeletePost: async (call, callback) => {
    await Post.findByIdAndDelete(call.request.id); // Delete the post by id
    callback(null, {});
  },
});

server.bindAsync('localhost:50052', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Post microservice running on port 50052');
  server.start();
});
