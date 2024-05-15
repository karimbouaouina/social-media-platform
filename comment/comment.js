const mongoose = require('mongoose');
// Define the comment schema
const CommentSchema = new mongoose.Schema({
  content: String,
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Comment', CommentSchema);
