import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Button, useTheme, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';

export default function InsightsScreen({ route, navigation }) {
  const appTheme = useTheme();
  const { insights } = route.params || { insights: null };

  // Placeholder insights while waiting for RAG API
  const placeholderInsights = {
    summary: "Based on your profile and portfolio, here are our personalized insights:",
    riskAnalysis: {
      title: "Risk Analysis",
      content: "Your portfolio risk level appears to be moderate, which aligns with your stated risk tolerance.",
      recommendations: [
        "Consider diversifying into more defensive sectors",
        "Maintain your current asset allocation",
        "Review portfolio quarterly"
      ]
    },
    portfolioFit: {
      title: "Portfolio-Goal Fit",
      content: "Your current portfolio composition is well-aligned with your long-term financial goals.",
      recommendations: [
        "Stay focused on your retirement planning strategy",
        "Consider increasing contributions to match your timeline",
        "Review insurance coverage"
      ]
    },
    actionItems: {
      title: "Recommended Actions",
      items: [
        {
          action: "Rebalance Portfolio",
          description: "Consider rebalancing to maintain your target asset allocation",
          priority: "High"
        },
        {
          action: "Review Risk Management",
          description: "Evaluate stop-loss orders and position sizes",
          priority: "Medium"
        },
        {
          action: "Tax Planning",
          description: "Consider tax-loss harvesting opportunities",
          priority: "Low"
        }
      ]
    }
  };

  const displayedInsights = insights || placeholderInsights;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Summary Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Personalized Insights</Text>
            <Text style={styles.summary}>{displayedInsights.summary}</Text>
          </Card.Content>
        </Card>

        {/* Risk Analysis Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>{displayedInsights.riskAnalysis.title}</Text>
            <Text style={styles.content}>{displayedInsights.riskAnalysis.content}</Text>
            <View style={styles.recommendationsList}>
              {displayedInsights.riskAnalysis.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Portfolio Fit Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>{displayedInsights.portfolioFit.title}</Text>
            <Text style={styles.content}>{displayedInsights.portfolioFit.content}</Text>
            <View style={styles.recommendationsList}>
              {displayedInsights.portfolioFit.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Action Items Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>{displayedInsights.actionItems.title}</Text>
            {displayedInsights.actionItems.items.map((item, index) => (
              <View key={index} style={styles.actionItem}>
                <View style={styles.actionHeader}>
                  <Text style={styles.actionTitle}>{item.action}</Text>
                  <Text style={[
                    styles.priorityTag,
                    { color: item.priority === 'High' ? appTheme.colors.error :
                            item.priority === 'Medium' ? appTheme.colors.warning :
                            appTheme.colors.success }
                  ]}>
                    {item.priority}
                  </Text>
                </View>
                <Text style={styles.actionDescription}>{item.description}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('UserProfile')}
            style={[styles.button, { marginRight: 10 }]}
          >
            Update Profile
          </Button>

          <Button
            mode="contained"
            onPress={() => navigation.navigate('Dashboard')}
            style={styles.button}
          >
            Back to Dashboard
          </Button>
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
  card: {
    margin: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
    color: theme.colors.primary,
  },
  summary: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  content: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  recommendationsList: {
    marginTop: theme.spacing.sm,
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    marginRight: theme.spacing.sm,
    color: theme.colors.primary,
  },
  recommendationText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  actionItem: {
    marginBottom: theme.spacing.lg,
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  priorityTag: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionDescription: {
    fontSize: 16,
    color: theme.colors.text,
    opacity: 0.8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: theme.spacing.lg,
    marginTop: 0,
  },
  button: {
    flex: 1,
  },
}); 