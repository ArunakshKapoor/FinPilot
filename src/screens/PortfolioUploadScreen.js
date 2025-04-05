import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Alert } from 'react-native';
import { Button, Text, TextInput, Card, useTheme, ActivityIndicator } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { useDispatch, useSelector } from 'react-redux';
import { processCSVUpload, addStock, savePortfolio, clearPortfolio } from '../store/portfolioSlice';
import { validatePortfolioData } from '../utils/csvUtils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';

export default function PortfolioUploadScreen({ navigation }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { loading, error, stocks } = useSelector((state) => state.portfolio);
  const [manualEntries, setManualEntries] = useState([
    { ticker: '', quantity: '', price: '', date: new Date().toISOString().split('T')[0] }
  ]);
  const [validationErrors, setValidationErrors] = useState([]);

  // Clear existing portfolio when entering this screen
  useEffect(() => {
    dispatch(clearPortfolio());
  }, [dispatch]);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',  // Accept any file type
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        return;
      }

      if (result.assets && result.assets[0]) {
        const file = result.assets[0];
        try {
          const response = await fetch(file.uri);
          const text = await response.text();
          
          // Validate if the content looks like CSV
          const lines = text.trim().split('\n');
          const isValid = lines.every(line => {
            const parts = line.split(',');
            return parts.length === 4 && 
                   parts[0].trim() !== '' &&  // ticker
                   !isNaN(parts[1]) &&        // quantity
                   !isNaN(parts[2]) &&        // price
                   !isNaN(Date.parse(parts[3])); // date
          });

          if (!isValid) {
            Alert.alert(
              'Invalid Format',
              'The file should contain lines with: ticker, quantity, price, and date (YYYY-MM-DD)',
              [{ text: 'OK' }]
            );
            return;
          }

          await dispatch(processCSVUpload(text)).unwrap();
          await dispatch(savePortfolio()).unwrap();
          navigation.navigate('Dashboard');
        } catch (error) {
          Alert.alert(
            'Error Reading File',
            'Please ensure the file contains data in the format: AAPL,10,175.50,2024-01-15 (one entry per line)',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (err) {
      Alert.alert(
        'Error',
        'Could not access the file. Please try using manual entry instead.',
        [{ text: 'OK' }]
      );
    }
  };

  const addManualEntry = () => {
    setManualEntries([
      ...manualEntries,
      { ticker: '', quantity: '', price: '', date: new Date().toISOString().split('T')[0] }
    ]);
  };

  const removeEntry = (index) => {
    if (manualEntries.length > 1) {
      const newEntries = [...manualEntries];
      newEntries.splice(index, 1);
      setManualEntries(newEntries);
    }
  };

  const updateManualEntry = (index, field, value) => {
    const newEntries = [...manualEntries];
    newEntries[index][field] = value;
    setManualEntries(newEntries);
  };

  const handleManualSubmit = async () => {
    try {
      const stocks = manualEntries.map(entry => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        ticker: entry.ticker.toUpperCase(),
        quantity: parseFloat(entry.quantity),
        purchasePrice: parseFloat(entry.price),
        purchaseDate: entry.date,
        currentPrice: 0,
      }));

      const errors = validatePortfolioData(stocks);
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }

      // Clear any existing stocks first
      dispatch(clearPortfolio());
      
      // Add new stocks
      stocks.forEach(stock => {
        dispatch(addStock(stock));
      });

      await dispatch(savePortfolio()).unwrap();
      navigation.navigate('Dashboard');
    } catch (err) {
      Alert.alert('Error', err.message || 'Error saving portfolio data.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Add Your Portfolio</Text>
          
          <Text style={[styles.subtitle, { marginTop: 20, color: theme.colors.text }]}>
            Enter Stocks Manually
          </Text>

          {manualEntries.map((entry, index) => (
            <Card key={index} style={styles.entryCard}>
              <Card.Content>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>Stock #{index + 1}</Text>
                  {manualEntries.length > 1 && (
                    <Button
                      mode="text"
                      onPress={() => removeEntry(index)}
                      textColor={theme.colors.error}
                    >
                      Remove
                    </Button>
                  )}
                </View>
                <TextInput
                  label="Ticker Symbol (e.g., AAPL)"
                  value={entry.ticker}
                  onChangeText={(value) => updateManualEntry(index, 'ticker', value.toUpperCase())}
                  style={styles.input}
                  autoCapitalize="characters"
                />
                <TextInput
                  label="Quantity"
                  value={entry.quantity}
                  onChangeText={(value) => updateManualEntry(index, 'quantity', value)}
                  keyboardType="numeric"
                  style={styles.input}
                />
                <TextInput
                  label="Purchase Price ($)"
                  value={entry.price}
                  onChangeText={(value) => updateManualEntry(index, 'price', value)}
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
                <TextInput
                  label="Purchase Date (YYYY-MM-DD)"
                  value={entry.date}
                  onChangeText={(value) => updateManualEntry(index, 'date', value)}
                  placeholder="YYYY-MM-DD"
                  style={styles.input}
                />
              </Card.Content>
            </Card>
          ))}

          <Button
            mode="outlined"
            onPress={addManualEntry}
            style={styles.addButton}
            icon="plus"
          >
            Add Another Stock
          </Button>

          <Button
            mode="contained"
            onPress={handleManualSubmit}
            style={styles.submitButton}
          >
            Save Portfolio
          </Button>

          <Text style={styles.orText}>OR</Text>

          <Button
            mode="outlined"
            onPress={handleFilePick}
            style={styles.button}
            icon="file-upload"
          >
            Upload File
          </Button>

          <Text style={styles.helperText}>
            File should contain one stock per line in format:{'\n'}
            AAPL,10,175.50,2024-01-15
          </Text>

          {validationErrors.length > 0 && (
            <View style={styles.errorContainer}>
              {validationErrors.map((error, index) => (
                <Text key={index} style={styles.error}>{error}</Text>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  button: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  orText: {
    textAlign: 'center',
    marginVertical: theme.spacing.xl,
    fontSize: 16,
  },
  entryCard: {
    marginBottom: theme.spacing.lg,
  },
  input: {
    marginBottom: theme.spacing.sm,
  },
  addButton: {
    marginTop: theme.spacing.lg,
  },
  submitButton: {
    marginTop: theme.spacing.xl,
  },
  errorContainer: {
    marginTop: theme.spacing.lg,
  },
  error: {
    color: theme.colors.error,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 8,
  },
}); 