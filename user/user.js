const mongoose = require('mongoose');
// Define the user schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
});

module.exports = mongoose.model('User', UserSchema);
