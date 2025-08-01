# AI-Powered GraphQL React Native App

A React Native application that combines Firebase Authentication, Firestore, GraphQL, Redis caching, and AI-powered natural language to GraphQL query conversion.

## Features

- 🔐 Firebase Authentication (Email/Password)
- 🗄️ Firebase Firestore Database
- 🚀 GraphQL API with Apollo
- ⚡ Redis Caching for GraphQL queries
- 🤖 AI-powered natural language to GraphQL conversion
- 📱 React Native with TypeScript
- ⚙️ Hermes JS Engine (enabled by default in RN 0.72+)

## Tech Stack

- **Frontend**: React Native, TypeScript, Apollo Client
- **Backend**: Node.js, Express, Apollo Server
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Caching**: Redis
- **AI**: OpenAI GPT-3.5-turbo
- **GraphQL**: Apollo Server & Client

## Quick Start

### Prerequisites

- Node.js (v16+)
- React Native CLI
- Redis Server
- Firebase Project
- OpenAI API Key

### Installation

1. **Clone and Install Dependencies**
   ```bash
   npm install
   ```

2. **Firebase Setup**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Download configuration files:
     - `google-services.json` → `android/app/`
     - `GoogleService-Info.plist` → `ios/`
   - Download service account key → `server/serviceAccountKey.json`

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Add your OpenAI API key and other configurations
   ```

4. **Start Redis Server**
   ```bash
   redis-server
   ```

5. **Start GraphQL Server**
   ```bash
   npm run server:dev
   ```

6. **Seed Sample Data**
   ```bash
   node server/seedData.js
   ```

7. **Start React Native App**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

## Project Structure

```
├── src/
│   ├── config/          # Firebase & Apollo configuration
│   ├── screens/         # React Native screens
│   ├── services/        # AI query service
│   └── App.tsx          # Main app component
├── server/
│   ├── index.js         # GraphQL server
│   ├── schema.js        # GraphQL schema
│   ├── resolvers.js     # GraphQL resolvers
│   └── seedData.js      # Data seeding script
└── android/ios/         # Platform-specific files
```

## Usage

### Natural Language Queries

The app converts natural language to GraphQL queries. Examples:

- "Get all users who joined in the last week"
- "Show me posts with their authors"
- "Find users with gmail addresses"
- "Get the latest 10 posts"

### API Examples

```graphql
# Get users with posts
query {
  users(limit: 5) {
    id
    email
    posts {
      title
      createdAt
    }
  }
}

# Get posts with authors
query {
  posts(limit: 10) {
    title
    content
    author {
      email
    }
  }
}
```

## Development Notes

### Hermes Configuration

Hermes is enabled by default in React Native 0.72+. It provides:
- Improved app startup time
- Reduced memory usage
- Better performance on Android

### Redis Caching

GraphQL queries are automatically cached in Redis for 5 minutes, reducing Firestore reads and improving performance.

### AI Query Generation

The app uses OpenAI's GPT-3.5-turbo to convert natural language into optimized GraphQL queries that:
- Select only required fields
- Apply appropriate filters
- Use proper pagination
- Follow GraphQL best practices

## Building for Production

1. **Update Firebase Configuration**
   - Use production Firebase project
   - Update security rules
   - Configure App Check

2. **Build React Native App**
   ```bash
   # Android
   cd android && ./gradlew assembleRelease
   
   # iOS
   cd ios && xcodebuild -workspace App.xcworkspace -scheme App archive
   ```

3. **Deploy GraphQL Server**
   - Deploy to your preferred cloud provider
   - Update GRAPHQL_SERVER_URL in app

## Security Considerations

- Enable Firebase Security Rules
- Use Firebase App Check in production
- Secure Redis instance
- Rotate API keys regularly
- Implement rate limiting on GraphQL server

## License

MIT License - feel free to use this project as a starting point for your own applications.
