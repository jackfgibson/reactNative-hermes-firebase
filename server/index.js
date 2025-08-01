const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const admin = require('firebase-admin');
const redis = require('redis');
const { typeDefs } = require('./schema');
const { resolvers } = require('./resolvers');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json'); // You'll need to add this file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Initialize Redis client
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
});

redisClient.on('error', (err) => {
  console.log('Redis Client Error', err);
});

async function startServer() {
  const app = express();
  
  // Connect to Redis
  await redisClient.connect();
  console.log('Connected to Redis');

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      return {
        db,
        redis: redisClient,
        user: req.user, // This will be set by auth middleware
      };
    },
    plugins: [
      // Redis caching plugin
      {
        requestDidStart() {
          return {
            willSendResponse(requestContext) {
              // Cache successful queries
              if (!requestContext.errors && requestContext.request.query) {
                const cacheKey = `graphql:${JSON.stringify(requestContext.request.variables)}:${requestContext.request.query}`;
                redisClient.setEx(cacheKey, 300, JSON.stringify(requestContext.response.data)); // Cache for 5 minutes
              }
            },
          };
        },
      },
    ],
  });

  await server.start();
  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch(error => {
  console.error('Error starting server:', error);
});