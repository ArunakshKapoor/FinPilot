import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Linking } from 'react-native';
import { Text, Card, ActivityIndicator, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { fetchMarketNews } from '../services/marketDataService';

export default function NewsScreen() {
  const theme = useTheme();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadNews = async () => {
    try {
      setLoading(true);
      const newsData = await fetchMarketNews();
      setNews(newsData);
      setError(null);
    } catch (err) {
      setError('Failed to load news. Please try again later.');
      console.error('Error loading news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  const handleNewsPress = (url) => {
    Linking.openURL(url);
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
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : (
            news.map((item) => (
              <Card 
                key={item.id} 
                style={styles.card}
                onPress={() => handleNewsPress(item.url)}
              >
                <Card.Content>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.summary} numberOfLines={3}>
                    {item.summary}
                  </Text>
                  <View style={styles.meta}>
                    <Text style={styles.source}>{item.source}</Text>
                    <Text style={styles.date}>
                      {new Date(item.date).toLocaleDateString()}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            ))
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
  card: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  summary: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  source: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  date: {
    fontSize: 14,
    color: theme.colors.text,
  },
  error: {
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
}); 