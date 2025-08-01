const admin = require('firebase-admin');

const resolvers = {
  Query: {
    users: async (_, { limit, offset, filter }, { db, redis }) => {
      try {
        // Check Redis cache first
        const cacheKey = `users:${JSON.stringify({ limit, offset, filter })}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
          console.log('Returning cached users data');
          return JSON.parse(cached);
        }

        let query = db.collection('users');

        // Apply filters
        if (filter) {
          if (filter.email) {
            query = query.where('email', '==', filter.email);
          }
          if (filter.emailDomain) {
            query = query.where('email', '>=', `@${filter.emailDomain}`)
                         .where('email', '<', `@${filter.emailDomain}~`);
          }
          if (filter.createdAfter) {
            query = query.where('createdAt', '>=', new Date(filter.createdAfter));
          }
          if (filter.createdBefore) {
            query = query.where('createdAt', '<=', new Date(filter.createdBefore));
          }
        }

        query = query.offset(offset).limit(limit);
        
        const snapshot = await query.get();
        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toISOString() || new Date().toISOString(),
        }));

        // Cache the result
        await redis.setEx(cacheKey, 300, JSON.stringify(users));

        return users;
      } catch (error) {
        console.error('Error fetching users:', error);
        throw new Error('Failed to fetch users');
      }
    },

    posts: async (_, { limit, offset, filter }, { db, redis }) => {
      try {
        const cacheKey = `posts:${JSON.stringify({ limit, offset, filter })}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
          console.log('Returning cached posts data');
          return JSON.parse(cached);
        }

        let query = db.collection('posts');

        if (filter) {
          if (filter.authorId) {
            query = query.where('authorId', '==', filter.authorId);
          }
          if (filter.title) {
            query = query.where('title', '>=', filter.title)
                         .where('title', '<', filter.title + '~');
          }
          if (filter.createdAfter) {
            query = query.where('createdAt', '>=', new Date(filter.createdAfter));
          }
          if (filter.createdBefore) {
            query = query.where('createdAt', '<=', new Date(filter.createdBefore));
          }
        }

        query = query.orderBy('createdAt', 'desc').offset(offset).limit(limit);
        
        const snapshot = await query.get();
        const posts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toISOString() || new Date().toISOString(),
        }));

        await redis.setEx(cacheKey, 300, JSON.stringify(posts));

        return posts;
      } catch (error) {
        console.error('Error fetching posts:', error);
        throw new Error('Failed to fetch posts');
      }
    },

    user: async (_, { id }, { db, redis }) => {
      try {
        const cacheKey = `user:${id}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }

        const doc = await db.collection('users').doc(id).get();
        if (!doc.exists) {
          throw new Error('User not found');
        }

        const user = {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toISOString() || new Date().toISOString(),
        };

        await redis.setEx(cacheKey, 600, JSON.stringify(user));
        return user;
      } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error('Failed to fetch user');
      }
    },

    post: async (_, { id }, { db, redis }) => {
      try {
        const cacheKey = `post:${id}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }

        const doc = await db.collection('posts').doc(id).get();
        if (!doc.exists) {
          throw new Error('Post not found');
        }

        const post = {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toISOString() || new Date().toISOString(),
        };

        await redis.setEx(cacheKey, 600, JSON.stringify(post));
        return post;
      } catch (error) {
        console.error('Error fetching post:', error);
        throw new Error('Failed to fetch post');
      }
    },
  },

  User: {
    posts: async (parent, _, { db }) => {
      try {
        const snapshot = await db.collection('posts')
          .where('authorId', '==', parent.id)
          .orderBy('createdAt', 'desc')
          .get();
        
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toISOString() || new Date().toISOString(),
        }));
      } catch (error) {
        console.error('Error fetching user posts:', error);
        return [];
      }
    },
  },

  Post: {
    author: async (parent, _, { db }) => {
      try {
        const doc = await db.collection('users').doc(parent.authorId).get();
        if (!doc.exists) {
          return null;
        }

        return {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toISOString() || new Date().toISOString(),
        };
      } catch (error) {
        console.error('Error fetching post author:', error);
        return null;
      }
    },
  },

  Mutation: {
    createUser: async (_, { email, password }, { db }) => {
      try {
        // Create user in Firebase Auth first
        const userRecord = await admin.auth().createUser({
          email,
          password,
        });

        // Then save to Firestore
        const userData = {
          email,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection('users').doc(userRecord.uid).set(userData);

        return {
          id: userRecord.uid,
          email,
          createdAt: new Date().toISOString(),
        };
      } catch (error) {
        console.error('Error creating user:', error);
        throw new Error('Failed to create user');
      }
    },

    createPost: async (_, { title, content }, { db, user }) => {
      try {
        if (!user) {
          throw new Error('Authentication required');
        }

        const postData = {
          title,
          content,
          authorId: user.uid,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await db.collection('posts').add(postData);

        return {
          id: docRef.id,
          title,
          content,
          authorId: user.uid,
          createdAt: new Date().toISOString(),
        };
      } catch (error) {
        console.error('Error creating post:', error);
        throw new Error('Failed to create post');
      }
    },

    updatePost: async (_, { id, title, content }, { db, user }) => {
      try {
        if (!user) {
          throw new Error('Authentication required');
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;

        await db.collection('posts').doc(id).update(updateData);

        const doc = await db.collection('posts').doc(id).get();
        return {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toISOString() || new Date().toISOString(),
        };
      } catch (error) {
        console.error('Error updating post:', error);
        throw new Error('Failed to update post');
      }
    },

    deletePost: async (_, { id }, { db, user }) => {
      try {
        if (!user) {
          throw new Error('Authentication required');
        }

        await db.collection('posts').doc(id).delete();
        return true;
      } catch (error) {
        console.error('Error deleting post:', error);
        throw new Error('Failed to delete post');
      }
    },
  },
};

module.exports = { resolvers };