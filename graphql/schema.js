const { gql } = require('apollo-server-express');

// Define the GraphQL schema and methods
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    user: User!
  }

  type Comment {
    id: ID!
    content: String!
    post: Post!
    user: User!
  }

  type Query {
    users: [User!]
    user(id: ID!): User
    posts: [Post!]
    post(id: ID!): Post
    comments: [Comment!]
    comment(id: ID!): Comment
  }

  type Mutation {
    createUser(name: String!, email: String!, role: String!): User!
    updateUser(id: ID!, name: String!, email: String!, role: String!): User!
    deleteUser(id: ID!): String!
    createPost(title: String!, content: String!, userId: ID!): Post!
    updatePost(id: ID!, title: String!, content: String!, userId: ID!): Post!
    deletePost(id: ID!): String!
    createComment(content: String!, postId: ID!, userId: ID!): Comment!
    updateComment(id: ID!, content: String!, postId: ID!, userId: ID!): Comment!
    deleteComment(id: ID!): String!
  }
`;

module.exports = typeDefs;
