import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here',
});

// GraphQL schema definition for reference
const SCHEMA_CONTEXT = `
GraphQL Schema:
type User {
  id: ID!
  email: String!
  createdAt: String!
}

type Post {
  id: ID!
  title: String!
  content: String!
  authorId: ID!
  author: User
  createdAt: String!
}

type Query {
  users(limit: Int, offset: Int, filter: UserFilter): [User!]!
  posts(limit: Int, offset: Int, filter: PostFilter): [Post!]!
  user(id: ID!): User
  post(id: ID!): Post
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
`;

export const convertNaturalLanguageToGraphQL = async (naturalQuery: string): Promise<string> => {
  try {
    const prompt = `
${SCHEMA_CONTEXT}

Convert the following natural language query into an optimized GraphQL query that fetches only the required fields:

Natural Language Query: "${naturalQuery}"

Rules:
1. Only select the fields that are actually needed based on the request
2. Use appropriate filters when possible
3. Include proper pagination if needed (limit/offset)
4. Return a valid GraphQL query string
5. If querying posts with authors, use the author field to get user data
6. For date filters, use ISO string format

Return only the GraphQL query, no explanations:
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a GraphQL expert that converts natural language to optimized GraphQL queries. Return only the query, no explanations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.1,
    });

    const generatedQuery = response.choices[0]?.message?.content?.trim();
    
    if (!generatedQuery) {
      throw new Error('Failed to generate GraphQL query');
    }

    // Clean up the response to ensure it's a valid GraphQL query
    const cleanQuery = generatedQuery
      .replace(/```graphql/g, '')
      .replace(/```/g, '')
      .trim();

    return cleanQuery;
  } catch (error: any) {
    console.error('Error converting natural language to GraphQL:', error);
    throw new Error(`AI Query Service Error: ${error.message}`);
  }
};

// Example usage and test queries
export const getExampleQueries = () => {
  return [
    {
      natural: "Get all users who joined in the last week",
      expected: `
query {
  users(filter: { createdAfter: "2023-12-01T00:00:00Z" }) {
    id
    email
    createdAt
  }
}
      `.trim(),
    },
    {
      natural: "Show me posts with their authors",
      expected: `
query {
  posts {
    id
    title
    content
    author {
      id
      email
    }
  }
}
      `.trim(),
    },
    {
      natural: "Find users with gmail addresses",
      expected: `
query {
  users(filter: { emailDomain: "gmail.com" }) {
    id
    email
    createdAt
  }
}
      `.trim(),
    },
  ];
};