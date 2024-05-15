const { ApolloError } = require('apollo-server-express');
const mongoose = require('mongoose');
const User = require('../user/user');
const Post = require('../post/post');
const Comment = require('../comment/comment');
const sendMessage = require('../kafka/kafkaProducer');

// Define GraphQL resolvers
const resolvers = {
  Query: {
    users: async () => await User.find(), // Query to fetch all users
    user: async (_, { id }) => await User.findById(id), // Query to fetch a user by id
    posts: async () => await Post.find().populate('userId'), // Query to fetch all posts
    post: async (_, { id }) => await Post.findById(id).populate('userId'), // Query to fetch a post by id
    comments: async () => await Comment.find().populate('postId userId'), // Query to fetch all comments
    comment: async (_, { id }) => await Comment.findById(id).populate('postId userId'), // Query to fetch a comment by id
  },
  Mutation: {
    createUser: async (_, { name, email, role }) => {
      const newUser = new User({ name, email, role }); // Create a new user instance
      await newUser.save(); // Save the new user instance
      await sendMessage('user-events', `User created: ${newUser.name}`); // Send a Kafka message
      return newUser;
    },
    updateUser: async (_, { id, name, email, role }) => {
      try {
        const user = await User.findByIdAndUpdate(id, { name, email, role }, { new: true }); // Find and update the user by ID
        if (!user) {
          throw new ApolloError("User not found", "NOT_FOUND");
        }
        await sendMessage('social-media-events', `User updated: ${user.name}`); // Send a Kafka message
        return user;
      } catch (error) {
        throw new ApolloError(`Error updating user: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    deleteUser: async (_, { id }) => {
      try {
        const user = await User.findByIdAndDelete(id); // Find and delete the user by ID
        if (!user) {
          throw new ApolloError("User not found", "NOT_FOUND");
        }
        await sendMessage('social-media-events', `User deleted: ${user.name}`); // Send a Kafka message
        return "User deleted successfully";
      } catch (error) {
        throw new ApolloError(`Error deleting user: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    createPost: async (_, { title, content, userId }) => {
      const newPost = new Post({ title, content, userId }); // Create a new post instance
      await newPost.save(); // Save the new post instance
      await sendMessage('post-events', `Post created: ${newPost.title}`); // Send a Kafka message
      return newPost;
    },
    updatePost: async (_, { id, title, content, userId }) => {
      try {
        const post = await Post.findByIdAndUpdate(id, { title, content, userId }, { new: true }); // Find and update the post by ID
        if (!post) {
          throw new ApolloError("Post not found", "NOT_FOUND");
        }
        await sendMessage('social-media-events', `Post updated: ${post.title}`); // Send a Kafka message
        return post;
      } catch (error) {
        throw new ApolloError(`Error updating post: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    deletePost: async (_, { id }) => {
      try {
        const post = await Post.findByIdAndDelete(id); // Find and delete the post by ID
        if (!post) {
          throw new ApolloError("Post not found", "NOT_FOUND");
        }
        await sendMessage('social-media-events', `Post deleted: ${post.title}`); // Send a Kafka message
        return "Post deleted successfully";
      } catch (error) {
        throw new ApolloError(`Error deleting post: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    createComment: async (_, { content, postId, userId }) => {
      const newComment = new Comment({ content, postId, userId }); // Create a new comment instance
      await newComment.save(); // Save the comment instance
      await sendMessage('comment-events', `Comment created: ${newComment.content}`); // Send a Kafka message
      return newComment;
    },
    updateComment: async (_, { id, content, postId, userId }) => {
      try {
        const comment = await Comment.findByIdAndUpdate(id, { content, postId, userId }, { new: true }); // Find and update the comment by id
        if (!comment) {
          throw new ApolloError("Comment not found", "NOT_FOUND");
        }
        await sendMessage('social-media-events', `Comment updated: ${comment.content}`); // Send a Kafka message
        return comment;
      } catch (error) {
        throw new ApolloError(`Error updating comment: ${error.message}`, "INTERNAL_ERROR");
      }
    },
    deleteComment: async (_, { id }) => {
      try {
        const comment = await Comment.findByIdAndDelete(id); // Find and delete the comment by id
        if (!comment) {
          throw new ApolloError("Comment not found", "NOT_FOUND");
        }
        await sendMessage('social-media-events', `Comment deleted: ${comment.content}`); // Send a Kafka message
        return "Comment deleted successfully";
      } catch (error) {
        throw new ApolloError(`Error deleting comment: ${error.message}`, "INTERNAL_ERROR");
      }
    },
  },
  Post: {
    user: async (post) => await User.findById(post.userId),
  },
  Comment: {
    post: async (comment) => await Post.findById(comment.postId),
    user: async (comment) => await User.findById(comment.userId),
  },
};

module.exports = resolvers;
