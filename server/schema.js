const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    createdAt: String!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    authorId: ID!
    author: User
    createdAt: String!
  }

  input UserFilter {
    email: String
    emailDomain: String
    createdAfter: String
    createdBefore: String
  }

  input PostFilter {
    authorId: ID
    title: String
    createdAfter: String
    createdBefore: String
  }

  type Query {
    users(limit: Int = 10, offset: Int = 0, filter: UserFilter): [User!]!
    posts(limit: Int = 10, offset: Int = 0, filter: PostFilter): [Post!]!
    user(id: ID!): User
    post(id: ID!): Post
  }

  type Mutation {
    createUser(email: String!, password: String!): User!
    createPost(title: String!, content: String!): Post!
    updatePost(id: ID!, title: String, content: String): Post!
    deletePost(id: ID!): Boolean!
  }
`;

module.exports = { typeDefs };