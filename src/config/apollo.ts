import {ApolloClient, InMemoryCache, createHttpLink} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';
import auth from '@react-native-firebase/auth';

// This will point to your GraphQL server
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql', // Change this to your server URL
});

const authLink = setContext(async (_, {headers}) => {
  // Get the authentication token from Firebase
  const user = auth().currentUser;
  const token = user ? await user.getIdToken() : null;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'ignore',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});