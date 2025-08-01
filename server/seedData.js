const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const seedData = async () => {
  try {
    console.log('Starting data seeding...');

    // Create sample users
    const users = [
      {
        id: 'user1',
        email: 'john@example.com',
        createdAt: new Date('2023-12-01'),
      },
      {
        id: 'user2',
        email: 'jane@gmail.com',
        createdAt: new Date('2023-12-05'),
      },
      {
        id: 'user3',
        email: 'bob@company.com',
        createdAt: new Date('2023-12-10'),
      },
    ];

    // Add users to Firestore
    for (const user of users) {
      await db.collection('users').doc(user.id).set({
        email: user.email,
        createdAt: admin.firestore.Timestamp.fromDate(user.createdAt),
      });
      console.log(`Created user: ${user.email}`);
    }

    // Create sample posts
    const posts = [
      {
        title: 'Getting Started with React Native',
        content: 'React Native is a powerful framework for building mobile apps...',
        authorId: 'user1',
        createdAt: new Date('2023-12-02'),
      },
      {
        title: 'GraphQL Best Practices',
        content: 'When working with GraphQL, consider these best practices...',
        authorId: 'user1',
        createdAt: new Date('2023-12-03'),
      },
      {
        title: 'Firebase and React Native Integration',
        content: 'Integrating Firebase with React Native provides...',
        authorId: 'user2',
        createdAt: new Date('2023-12-06'),
      },
      {
        title: 'AI-Powered Query Generation',
        content: 'Using AI to generate GraphQL queries can significantly improve...',
        authorId: 'user2',
        createdAt: new Date('2023-12-07'),
      },
      {
        title: 'Redis Caching Strategies',
        content: 'Implementing effective caching with Redis...',
        authorId: 'user3',
        createdAt: new Date('2023-12-11'),
      },
    ];

    // Add posts to Firestore
    for (const post of posts) {
      await db.collection('posts').add({
        title: post.title,
        content: post.content,
        authorId: post.authorId,
        createdAt: admin.firestore.Timestamp.fromDate(post.createdAt),
      });
      console.log(`Created post: ${post.title}`);
    }

    console.log('Data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();