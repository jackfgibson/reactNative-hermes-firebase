import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();
  const user = auth().currentUser;

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => auth().signOut(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>AI GraphQL Query Assistant</Text>
        
        <Text style={styles.welcome}>
          Welcome, {user?.email}!
        </Text>
        
        <Text style={styles.description}>
          Use natural language to query your data. Our AI will convert your 
          questions into optimized GraphQL queries.
        </Text>
        
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Query' as never)}>
          <Text style={styles.primaryButtonText}>Start Querying</Text>
        </TouchableOpacity>
        
        <View style={styles.info}>
          <Text style={styles.infoTitle}>Available Data:</Text>
          <Text style={styles.infoText}>• Users (id, email, createdAt)</Text>
          <Text style={styles.infoText}>• Posts (id, title, content, authorId)</Text>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  welcome: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 40,
  },
  primaryButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  info: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginBottom: 40,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#ff3b30',
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: '#ff3b30',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;