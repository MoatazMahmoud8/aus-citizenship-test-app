import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Fonts, BorderRadius, Shadows } from '../../constants/theme';
import { UserProgress, QuestionCategory } from '../../constants/types';
import { getProgress } from '../../utils/storage';

type WrongAnswerItem = UserProgress['wrongAnswersTracking'][0];

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [groupedByCategory, setGroupedByCategory] = useState<Record<string, WrongAnswerItem[]>>({});

  // Load data on mount AND every time user navigates to this tab
  useEffect(() => {
    loadWrongAnswers();
  }, []);
  
  useFocusEffect(
    React.useCallback(() => {
      loadWrongAnswers();
    }, [])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadWrongAnswers().then(() => setRefreshing(false));
  }, []);

  const loadWrongAnswers = async () => {
    try {
      if (!refreshing) setLoading(true);
      const progress = await getProgress();
      
      console.log('🔄 Loading wrong answers:', progress.wrongAnswersTracking.length);
      
      setWrongAnswers(progress.wrongAnswersTracking || []);
      
      // Group by category
      const grouped: Record<string, WrongAnswerItem[]> = {};
      if (progress.wrongAnswersTracking && progress.wrongAnswersTracking.length > 0) {
        progress.wrongAnswersTracking.forEach((item: WrongAnswerItem) => {
          if (!grouped[item.category]) {
            grouped[item.category] = [];
          }
          grouped[item.category].push(item);
        });
      }
      
      setGroupedByCategory(grouped);
    } catch (error) {
      console.error('Error loading wrong answers:', error);
      Alert.alert('Error', 'Failed to load your wrong answers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      australian_values: '🇦🇺 Australian Values',
      australia_and_its_people: '🏙️ Australia & Its People',
      democratic_beliefs: '🗳️ Democratic Beliefs',
      government_and_law: '⚖️ Government & Law',
    };
    return labels[category] || category;
  };

  const handleClearWrongAnswer = (questionId: number) => {
    Alert.alert(
      'Clear from Review',
      'Remove this question from your review list?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Remove',
          onPress: () => {
            // TODO: Implement removal from tracking
            Alert.alert('Cleared', 'Question removed from your review list');
            loadWrongAnswers();
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.blue} />
      </View>
    );
  }

  if (wrongAnswers.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + Spacing.lg }]}>
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle" size={64} color={Colors.green} />
          <Text style={styles.emptyTitle}>Perfect! 🎉</Text>
          <Text style={styles.emptySubtitle}>
            You haven't made any mistakes yet, or you've corrected all of them!
          </Text>
          <Text style={styles.emptyHint}>
            Your wrong answers will appear here as you practice more tests.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>📋 Your Wrong Answers</Text>
        <Text style={styles.subtitle}>
          {wrongAnswers.length} question{wrongAnswers.length !== 1 ? 's' : ''} to review
        </Text>
      </View>

      {Object.entries(groupedByCategory).map(([category, items]) => (
        <View key={category} style={styles.categorySection}>
          <Text style={styles.categoryLabel}>{getCategoryLabel(category)}</Text>
          
          {items.map((item, index) => (
            <View key={`${item.questionId}-${index}`} style={styles.wrongAnswerCard}>
              <View style={styles.cardHeader}>
                <View style={styles.attemptBadge}>
                  <Text style={styles.attemptText}>×{item.timesWrong}</Text>
                </View>
                <Text style={styles.questionText} numberOfLines={3}>
                  {item.questionText}
                </Text>
              </View>

              <View style={styles.answerDetails}>
                <View style={styles.answerRow}>
                  <View style={[styles.answerLabel, { backgroundColor: '#FFE5E5' }]}>
                    <Ionicons name="close-circle" size={16} color={Colors.error} />
                    <Text style={[styles.answerLabelText, { color: Colors.error }]}>
                      Your answer
                    </Text>
                  </View>
                  <Text style={styles.answerValueWrong}>
                    Option {String.fromCharCode(65 + item.userSelectedAnswer)}
                  </Text>
                </View>

                <View style={styles.answerRow}>
                  <View style={[styles.answerLabel, { backgroundColor: '#E5F5E5' }]}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.green} />
                    <Text style={[styles.answerLabelText, { color: Colors.green }]}>
                      Correct answer
                    </Text>
                  </View>
                  <Text style={styles.answerValueCorrect}>
                    Option {String.fromCharCode(65 + item.correctAnswer)}
                  </Text>
                </View>
              </View>

              <View style={styles.lastAttemptRow}>
                <Ionicons name="time" size={14} color={Colors.gray} />
                <Text style={styles.lastAttemptText}>
                  Last attempt: {new Date(item.lastAttempted).toLocaleDateString()}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => handleClearWrongAnswer(item.questionId)}
              >
                <Ionicons name="trash-outline" size={16} color={Colors.gray} />
                <Text style={styles.clearButtonText}>Remove from review</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ))}

      <View style={styles.tipsSection}>
        <View style={styles.tipBox}>
          <Ionicons name="bulb" size={20} color={Colors.blue} />
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={styles.tipTitle}>Study Tip</Text>
            <Text style={styles.tipText}>
              Focus on reviewing these questions regularly. When you get one right, it will be removed from this list!
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  title: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.darkGray,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.gray,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: '700',
    color: Colors.darkGray,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.gray,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: Fonts.sizes.sm,
    color: Colors.gray,
    marginTop: Spacing.md,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  categorySection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  categoryLabel: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    color: Colors.darkGray,
    marginBottom: Spacing.md,
  },
  wrongAnswerCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.small,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  attemptBadge: {
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attemptText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    color: Colors.white,
  },
  questionText: {
    flex: 1,
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.darkGray,
    lineHeight: 22,
  },
  answerDetails: {
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  answerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  answerLabelText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
  },
  answerValueWrong: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    color: Colors.error,
  },
  answerValueCorrect: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    color: Colors.green,
  },
  lastAttemptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  lastAttemptText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.gray,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    marginTop: Spacing.md,
  },
  clearButtonText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.gray,
    fontWeight: '500',
  },
  tipsSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
  },
  tipBox: {
    backgroundColor: '#E5F2FF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipTitle: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '700',
    color: Colors.blue,
    marginBottom: Spacing.xs,
  },
  tipText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.blue,
    lineHeight: 18,
  },
});
