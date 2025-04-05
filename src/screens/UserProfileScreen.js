import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Card, RadioButton, useTheme, HelperText } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';

const ageRanges = [
  '18-25', '26-35', '36-45', '46-55', '56-65', '65+'
];

const incomeRanges = [
  'Under $30,000',
  '$30,000 - $60,000',
  '$60,000 - $100,000',
  '$100,000 - $200,000',
  'Over $200,000'
];

const financialGoals = [
  'Retirement Planning',
  'Wealth Building',
  'Short-term Savings',
  'Children\'s Education',
  'Home Purchase',
  'Other'
];

const timelineOptions = [
  'Less than 1 year',
  '1-3 years',
  '3-5 years',
  '5-10 years',
  'More than 10 years'
];

const riskToleranceOptions = [
  'Conservative (Prefer stability)',
  'Moderate (Balance of growth and stability)',
  'Aggressive (Focus on growth)',
  'Very Aggressive (Maximum growth)'
];

const knowledgeLevels = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert'
];

const familyStatus = [
  'Single',
  'Married',
  'Married with Children',
  'Single Parent',
  'Other'
];

export default function UserProfileScreen({ navigation }) {
  const appTheme = useTheme();
  const [profile, setProfile] = useState({
    ageRange: '',
    occupation: '',
    income: '',
    financialGoals: [],
    timeline: '',
    riskTolerance: '',
    knowledgeLevel: '',
    financialSituation: '',
    familyStatus: '',
    questions: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!profile.ageRange) newErrors.ageRange = 'Please select your age range';
    if (!profile.income) newErrors.income = 'Please select your income range';
    if (profile.financialGoals.length === 0) newErrors.financialGoals = 'Please select at least one financial goal';
    if (!profile.timeline) newErrors.timeline = 'Please select your investment timeline';
    if (!profile.riskTolerance) newErrors.riskTolerance = 'Please select your risk tolerance';
    if (!profile.knowledgeLevel) newErrors.knowledgeLevel = 'Please select your knowledge level';
    if (!profile.familyStatus) newErrors.familyStatus = 'Please select your family status';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // TODO: When RAG API is ready, send profile data here
    try {
      // const response = await sendProfileToRAG(profile);
      // For now, navigate to insights with placeholder data
      navigation.navigate('Insights', { 
        insights: {
          summary: `Based on your profile as a ${profile.ageRange} ${profile.occupation} with ${profile.knowledgeLevel} investment knowledge and ${profile.riskTolerance} risk tolerance, here are our personalized insights:`,
          riskAnalysis: {
            title: "Risk Analysis",
            content: `Your ${profile.riskTolerance} approach aligns with your financial goals of ${profile.financialGoals.join(', ')}.`,
            recommendations: [
              "Consider diversifying into more defensive sectors",
              "Maintain your current asset allocation",
              "Review portfolio quarterly"
            ]
          },
          portfolioFit: {
            title: "Portfolio-Goal Fit",
            content: `With a ${profile.timeline} investment timeline, your portfolio should be structured for ${profile.financialGoals[0]}.`,
            recommendations: [
              `Focus on your primary goal of ${profile.financialGoals[0]}`,
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
        }
      });
    } catch (error) {
      console.error('Error submitting profile:', error);
    }
  };

  const toggleFinancialGoal = (goal) => {
    const goals = [...profile.financialGoals];
    const index = goals.indexOf(goal);
    if (index === -1) {
      goals.push(goal);
    } else {
      goals.splice(index, 1);
    }
    setProfile({ ...profile, financialGoals: goals });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Investment Profile</Text>
            <Text style={styles.subtitle}>Help us understand your investment needs better</Text>

            {/* Age Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Age Range</Text>
              <RadioButton.Group
                onValueChange={value => setProfile({ ...profile, ageRange: value })}
                value={profile.ageRange}
              >
                {ageRanges.map(range => (
                  <RadioButton.Item
                    key={range}
                    label={range}
                    value={range}
                    style={styles.radioItem}
                  />
                ))}
              </RadioButton.Group>
              {errors.ageRange && <HelperText type="error">{errors.ageRange}</HelperText>}
            </View>

            {/* Occupation */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Occupation</Text>
              <TextInput
                mode="outlined"
                value={profile.occupation}
                onChangeText={text => setProfile({ ...profile, occupation: text })}
                style={styles.input}
              />
            </View>

            {/* Income Level */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Annual Income Range</Text>
              <RadioButton.Group
                onValueChange={value => setProfile({ ...profile, income: value })}
                value={profile.income}
              >
                {incomeRanges.map(range => (
                  <RadioButton.Item
                    key={range}
                    label={range}
                    value={range}
                    style={styles.radioItem}
                  />
                ))}
              </RadioButton.Group>
              {errors.income && <HelperText type="error">{errors.income}</HelperText>}
            </View>

            {/* Financial Goals */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Financial Goals (Select all that apply)</Text>
              {financialGoals.map(goal => (
                <RadioButton.Item
                  key={goal}
                  label={goal}
                  status={profile.financialGoals.includes(goal) ? 'checked' : 'unchecked'}
                  onPress={() => toggleFinancialGoal(goal)}
                  style={styles.radioItem}
                />
              ))}
              {errors.financialGoals && <HelperText type="error">{errors.financialGoals}</HelperText>}
            </View>

            {/* Investment Timeline */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Investment Timeline</Text>
              <RadioButton.Group
                onValueChange={value => setProfile({ ...profile, timeline: value })}
                value={profile.timeline}
              >
                {timelineOptions.map(option => (
                  <RadioButton.Item
                    key={option}
                    label={option}
                    value={option}
                    style={styles.radioItem}
                  />
                ))}
              </RadioButton.Group>
              {errors.timeline && <HelperText type="error">{errors.timeline}</HelperText>}
            </View>

            {/* Risk Tolerance */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Risk Tolerance</Text>
              <RadioButton.Group
                onValueChange={value => setProfile({ ...profile, riskTolerance: value })}
                value={profile.riskTolerance}
              >
                {riskToleranceOptions.map(option => (
                  <RadioButton.Item
                    key={option}
                    label={option}
                    value={option}
                    style={styles.radioItem}
                  />
                ))}
              </RadioButton.Group>
              {errors.riskTolerance && <HelperText type="error">{errors.riskTolerance}</HelperText>}
            </View>

            {/* Financial Knowledge */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Financial Knowledge Level</Text>
              <RadioButton.Group
                onValueChange={value => setProfile({ ...profile, knowledgeLevel: value })}
                value={profile.knowledgeLevel}
              >
                {knowledgeLevels.map(level => (
                  <RadioButton.Item
                    key={level}
                    label={level}
                    value={level}
                    style={styles.radioItem}
                  />
                ))}
              </RadioButton.Group>
              {errors.knowledgeLevel && <HelperText type="error">{errors.knowledgeLevel}</HelperText>}
            </View>

            {/* Current Financial Situation */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Financial Situation</Text>
              <TextInput
                mode="outlined"
                value={profile.financialSituation}
                onChangeText={text => setProfile({ ...profile, financialSituation: text })}
                multiline
                numberOfLines={4}
                style={styles.input}
                placeholder="Describe your current financial situation, including savings, debt, and other investments"
              />
            </View>

            {/* Family Status */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Family Status</Text>
              <RadioButton.Group
                onValueChange={value => setProfile({ ...profile, familyStatus: value })}
                value={profile.familyStatus}
              >
                {familyStatus.map(status => (
                  <RadioButton.Item
                    key={status}
                    label={status}
                    value={status}
                    style={styles.radioItem}
                  />
                ))}
              </RadioButton.Group>
              {errors.familyStatus && <HelperText type="error">{errors.familyStatus}</HelperText>}
            </View>

            {/* Questions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Questions</Text>
              <TextInput
                mode="outlined"
                value={profile.questions}
                onChangeText={text => setProfile({ ...profile, questions: text })}
                multiline
                numberOfLines={4}
                style={styles.input}
                placeholder="What specific questions do you have about your portfolio or investment strategy?"
              />
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
            >
              Get Personalized Insights
            </Button>
          </Card.Content>
        </Card>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: theme.spacing.lg,
    color: theme.colors.text,
    opacity: 0.7,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  input: {
    backgroundColor: theme.colors.surface,
  },
  radioItem: {
    paddingVertical: theme.spacing.xs,
  },
  submitButton: {
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
}); 