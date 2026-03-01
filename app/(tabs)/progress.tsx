import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { UserProgress, CATEGORY_INFO, QuestionCategory, DEFAULT_PROGRESS } from '../../constants/types';
import { getProgress, getQuizHistory } from '../../utils/storage';
import { QuizResult } from '../../constants/types';
import { formatDate, formatPercent } from '../../utils/helpers';

export default function ProgressScreen() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [p, h] = await Promise.all([getProgress(), getQuizHistory()]);
    setProgress(p);
    setHistory(h);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const categories: QuestionCategory[] = [
    'australian_values',
    'australia_and_its_people',
    'democratic_beliefs',
    'government_and_law',
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Overview Stats */}
      <View style={styles.overviewCard}>
        <Text style={styles.overviewTitle}>📊 Overall Progress</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{progress.totalQuizzesTaken}</Text>
            <Text style={styles.statLabel}>Tests Taken</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {progress.totalQuestionsPracticed}
            </Text>
            <Text style={styles.statLabel}>Questions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatPercent(progress.averageScore)}
            </Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.green }]}>
              {formatPercent(progress.bestScore)}
            </Text>
            <Text style={styles.statLabel}>Best Score</Text>
          </View>
        </View>
      </View>

      {/* Streak */}
      <View style={styles.streakCard}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <View style={styles.streakContent}>
          <Text style={styles.streakValue}>{progress.currentStreak} day streak</Text>
          <Text style={styles.streakLabel}>
            Longest: {progress.longestStreak} days
          </Text>
        </View>
      </View>

      {/* Category Breakdown */}
      <Text style={styles.sectionTitle}>Category Performance</Text>
      {categories.map((cat) => {
        const info = CATEGORY_INFO[cat];
        const catScore = progress.categoryScores[cat];
        const percent = catScore.accuracy;

        return (
          <View key={cat} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryDot, { backgroundColor: info.color }]} />
              <Text style={styles.categoryTitle}>{info.label}</Text>
              <Text
                style={[
                  styles.categoryPercent,
                  { color: percent >= 75 ? Colors.success : Colors.error },
                ]}
              >
                {formatPercent(percent)}
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(percent, 100)}%`,
                    backgroundColor:
                      percent >= 75 ? Colors.success : percent >= 50 ? Colors.warning : Colors.error,
                  },
                ]}
              />
            </View>
            <Text style={styles.categoryMeta}>
              {catScore.totalCorrect}/{catScore.totalAttempted} correct
            </Text>
          </View>
        );
      })}

      {/* Recent History */}
      <Text style={styles.sectionTitle}>Recent Test History</Text>
      {history.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>📝</Text>
          <Text style={styles.emptyText}>
            No tests taken yet. Start practicing to see your progress!
          </Text>
        </View>
      ) : (
        history.slice(0, 10).map((result, index) => (
          <View key={result.id || index} style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyDate}>{formatDate(result.date)}</Text>
              <View
                style={[
                  styles.historyBadge,
                  {
                    backgroundColor: result.passed
                      ? Colors.correctAnswer
                      : Colors.incorrectAnswer,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.historyBadgeText,
                    {
                      color: result.passed
                        ? Colors.correctBorder
                        : Colors.incorrectBorder,
                    },
                  ]}
                >
                  {result.passed ? '✅ PASSED' : '❌ FAILED'}
                </Text>
              </View>
            </View>
            <View style={styles.historyStats}>
              <Text style={styles.historyStat}>
                Score: {result.correctAnswers}/{result.totalQuestions} (
                {Math.round((result.correctAnswers / result.totalQuestions) * 100)}
                %)
              </Text>
              <Text style={styles.historyStat}>
                Values: {result.valuesCorrect}/{result.valuesTotalQuestions}
              </Text>
            </View>
          </View>
        ))
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  overviewCard: {
    margin: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
  },
  overviewTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: 'bold',
    color: Colors.charcoal,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: Fonts.sizes.xl,
    fontWeight: 'bold',
    color: Colors.blue,
  },
  statLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.gray,
    marginTop: 2,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.lightGold,
    borderRadius: BorderRadius.lg,
  },
  streakEmoji: {
    fontSize: 36,
  },
  streakContent: {
    marginLeft: Spacing.md,
  },
  streakValue: {
    fontSize: Fonts.sizes.lg,
    fontWeight: 'bold',
    color: Colors.charcoal,
  },
  streakLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.gray,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: 'bold',
    color: Colors.charcoal,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  categoryCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  categoryTitle: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    fontWeight: '600',
    color: Colors.charcoal,
  },
  categoryPercent: {
    fontSize: Fonts.sizes.md,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },
  categoryMeta: {
    fontSize: Fonts.sizes.xs,
    color: Colors.gray,
    marginTop: Spacing.xs,
  },
  emptyCard: {
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    padding: Spacing.xl,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: Fonts.sizes.md,
    color: Colors.gray,
    textAlign: 'center',
  },
  historyCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  historyDate: {
    fontSize: Fonts.sizes.sm,
    color: Colors.darkGray,
  },
  historyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  historyBadgeText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: 'bold',
  },
  historyStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  historyStat: {
    fontSize: Fonts.sizes.xs,
    color: Colors.gray,
  },
});
