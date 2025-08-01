import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {ApolloProvider} from '@apollo/client';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {apolloClient} from './config/apollo';
import AuthScreen from './screens/AuthScreen';
import HomeScreen from './screens/HomeScreen';
import QueryScreen from './screens/QueryScreen';

const Stack = createStackNavigator();

const App = () => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [initializing, setInitializing] = useState(true);

  const onAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    setUser(user);
    if (initializing) setInitializing(false);
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, [initializing]);

  if (initializing) return null;

  return (
    <ApolloProvider client={apolloClient}>
      <NavigationContainer>
        <Stack.Navigator>
          {user ? (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Query" component={QueryScreen} />
            </>
          ) : (
            <Stack.Screen 
              name="Auth" 
              component={AuthScreen} 
              options={{headerShown: false}}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ApolloProvider>
  );
};

export default App;