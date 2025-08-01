import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useLazyQuery} from '@apollo/client';
import {convertNaturalLanguageToGraphQL} from '../services/aiQueryService';
import {gql} from '@apollo/client';

const QueryScreen = () => {
  const [naturalQuery, setNaturalQuery] = useState('');
  const [generatedQuery, setGeneratedQuery] = useState('');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [executingQuery, setExecutingQuery] = useState(false);

  // Dynamic query execution
  const [executeQuery] = useLazyQuery(gql`query placeholder { __typename }`);

  const handleGenerateQuery = async () => {
    if (!naturalQuery.trim()) {
      Alert.alert('Error', 'Please enter a natural language query');
      return;
    }

    setLoading(true);
    try {
      const graphqlQuery = await convertNaturalLanguageToGraphQL(naturalQuery);
      setGeneratedQuery(graphqlQuery);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate query');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteQuery = async () => {
    if (!generatedQuery) {
      Alert.alert('Error', 'Please generate a query first');
      return;
    }

    setExecutingQuery(true);
    try {
      // Parse the generated query and execute it
      const query = gql(generatedQuery);
      const result = await executeQuery({
        query,
        fetchPolicy: 'cache-first', // Use Redis cache when available
      });
      
      setQueryResult(result.data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to execute query');
      setQueryResult(null);
    } finally {
      setExecutingQuery(false);
    }
  };

  const exampleQueries = [
    "Get all users who joined in the last week",
    "Show me posts with their authors",
    "Find users by email domain",
    "Get the latest 10 posts"
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>AI GraphQL Query Assistant</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Natural Language Query</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe what data you want to fetch..."
            value={naturalQuery}
            onChangeText={setNaturalQuery}
            multiline
            numberOfLines={4}
          />
          
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleGenerateQuery}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Generate GraphQL Query</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Example Queries</Text>
          {exampleQueries.map((example, index) => (
            <TouchableOpacity
              key={index}
              style={styles.exampleButton}
              onPress={() => setNaturalQuery(example)}>
              <Text style={styles.exampleText}>"{example}"</Text>
            </TouchableOpacity>
          ))}
        </View>

        {generatedQuery ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Generated GraphQL Query</Text>
            <ScrollView style={styles.codeContainer} horizontal>
              <Text style={styles.codeText}>{generatedQuery}</Text>
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.button, styles.executeButton, executingQuery && styles.buttonDisabled]}
              onPress={handleExecuteQuery}
              disabled={executingQuery}>
              {executingQuery ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Execute Query</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}

        {queryResult ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Query Result</Text>
            <ScrollView style={styles.resultContainer} horizontal>
              <Text style={styles.resultText}>
                {JSON.stringify(queryResult, null, 2)}
              </Text>
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  textArea: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  executeButton: {
    backgroundColor: '#34C759',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  exampleButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  exampleText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
  codeContainer: {
    backgroundColor: '#2d2d2d',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    maxHeight: 200,
  },
  codeText: {
    color: '#f8f8f2',
    fontFamily: 'Courier',
    fontSize: 12,
  },
  resultContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
    maxHeight: 300,
  },
  resultText: {
    color: '#333',
    fontFamily: 'Courier',
    fontSize: 12,
  },
});

export default QueryScreen;