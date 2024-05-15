const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const User = require('./user');

// Load PROTO FILE PATH
const PROTO_PATH = __dirname + '/user.proto';
// Load gRPC protobuf
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
// Load the proto file
const userProto = grpc.loadPackageDefinition(packageDefinition).user;
// Create gRPC server
const server = new grpc.Server();
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/social_media', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected...'))
  .catch(err => console.error(err));
// Implement gRPC service methods 
server.addService(userProto.UserService.service, {
  CreateUser: async (call, callback) => {
    const { name, email, role } = call.request;
    const user = new User({ name, email, role }); // Create a new user instance from the request
    await user.save(); // Save the user
    callback(null, user); // Return the user instance
  },
  GetUser: async (call, callback) => {
    const user = await User.findById(call.request.id); // Get the user instance by id
    callback(null, user); // Return the user instance
  },
  UpdateUser: async (call, callback) => {
    const { id, name, email, role } = call.request;
    const user = await User.findByIdAndUpdate(id, { name, email, role }, { new: true }); // Get the user instance by id and update it with the new content
    callback(null, user); // Return the user instance
  },
  DeleteUser: async (call, callback) => {
    await User.findByIdAndDelete(call.request.id); // Delete the user instance by id
    callback(null, {});
  },
});

server.bindAsync('localhost:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('User microservice running on port 50051');
  server.start();
});
