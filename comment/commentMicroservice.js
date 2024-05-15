const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Comment = require('./comment');

// Load PROTO FILE PATH
const PROTO_PATH = __dirname + '/comment.proto';
// Load gRPC protobuf
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
// Load the proto file
const commentProto = grpc.loadPackageDefinition(packageDefinition).comment;

// Create gRPC server
const server = new grpc.Server();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/social_media', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected...'))
  .catch(err => console.error(err));

// Implement gRPC service methods 
server.addService(commentProto.CommentService.service, {
  CreateComment: async (call, callback) => {
    const { content, postId, userId } = call.request;
    const comment = new Comment({ content, postId, userId }); // Create a new comment instance from the request
    await comment.save(); // Save the comment to the database
    callback(null, comment); // Return the saved comment
  },
  GetComment: async (call, callback) => {
    const comment = await Comment.findById(call.request.id); // Find the comment by ID
    callback(null, comment); // Return the found comment
  },
  UpdateComment: async (call, callback) => {
    const { id, content, postId, userId } = call.request; 
    const comment = await Comment.findByIdAndUpdate(id, { content, postId, userId }, { new: true }); // Find and update the comment by ID
    callback(null, comment); // Return the updated comment
  },
  DeleteComment: async (call, callback) => {
    await Comment.findByIdAndDelete(call.request.id); // Find and delete the comment by ID
    callback(null, {});
  },
});

// Start the gRPC server
server.bindAsync('localhost:50053', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Comment microservice running on port 50053');
  server.start(); // Start the server
});
