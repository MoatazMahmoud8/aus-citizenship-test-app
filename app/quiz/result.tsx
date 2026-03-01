import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { QUIZ_CONFIG } from '../../constants/types';
import {
  formatTime,
  getGradeEmoji,
  getGradeText,
  getMotivationalMessage,
} from '../../utils/helpers';

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    totalQuestions: string;
    correctAnswers: string;
    valuesCorrect: string;
    valuesTotalQuestions: string;
    passed: string;
    timeTaken: string;
    scorePercent: string;
  }>();

  const totalQuestions = parseInt(params.totalQuestions || '0', 10);
  const correctAnswers = parseInt(params.correctAnswers || '0', 10);
  const valuesCorrect = parseInt(params.valuesCorrect || '0', 10);
  const valuesTotalQuestions = parseInt(params.valuesTotalQuestions || '0', 10);
  const passed = params.passed === 'true';
  const timeTaken = parseInt(params.timeTaken || '0', 10);
  const scorePercent = parseInt(params.scorePercent || '0', 10);

  const valuesAllCorrect = valuesCorrect === valuesTotalQuestions;
  const emoji = getGradeEmoji(scorePercent);
  const gradeText = getGradeText(scorePercent);
  const message = getMotivationalMessage(scorePercent);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Result Header */}
      <View
        style={[
          styles.resultHeader,
          { backgroundColor: passed ? Colors.green : Colors.error },
        ]}
      >
        <Text style={styles.resultEmoji}>{passed ? '🎉' : '📚'}</Text>
        <Text style={styles.resultTitle}>
          {passed ? 'Congratulations!' : 'Keep Practising!'}
        </Text>
        <Text style={styles.resultSubtitle}>
          {passed
            ? 'You passed the practice test!'
            : 'You didn\'t pass this time, but don\'t give up!'}
        </Text>
      </View>

      {/* Score Circle */}
      <View style={styles.scoreCard}>
        <View
          style={[
            styles.scoreCircle,
            {
              borderColor: passed ? Colors.success : Colors.error,
            },
          ]}
        >
          <Text style={styles.scorePercent}>{scorePercent}%</Text>
          <Text style={styles.scoreLabel}>
            {correctAnswers}/{totalQuestions}
          </Text>
        </View>
        <Text style={styles.gradeText}>
          {emoji} {gradeText}
        </Text>
        <Text style={styles.messageText}>{message}</Text>
      </View>

      {/* Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Test Details</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Overall Score</Text>
          <Text
            style={[
              styles.detailValue,
              {
                color:
                  scorePercent >= QUIZ_CONFIG.PASS_MARK_PERCENT
                    ? Colors.success
                    : Colors.error,
              },
            ]}
          >
            {correctAnswers}/{totalQuestions} ({scorePercent}%)
          </Text>
        </View>

        <View style={styles.detailDivider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Pass Mark Required</Text>
          <Text style={styles.detailValue}>
            {QUIZ_CONFIG.PASS_MARK_PERCENT}% ({QUIZ_CONFIG.PASS_MARK_QUESTIONS}/
            {QUIZ_CONFIG.TOTAL_QUESTIONS})
          </Text>
        </View>

        <View style={styles.detailDivider} />

        {valuesTotalQuestions > 0 && (
          <>
            <View style={styles.detailRow}>
              <View style={styles.detailLabelRow}>
                <Ionicons name="heart" size={16} color={Colors.error} />
                <Text style={styles.detailLabel}> Values Questions</Text>
              </View>
              <Text
                style={[
                  styles.detailValue,
                  {
                    color: valuesAllCorrect ? Colors.success : Colors.error,
                    fontWeight: 'bold',
                  },
                ]}
              >
                {valuesCorrect}/{valuesTotalQuestions}{' '}
                {valuesAllCorrect ? '✅' : '❌'}
              </Text>
            </View>

            {!valuesAllCorrect && (
              <View style={styles.warningBox}>
                <Ionicons name="warning" size={18} color={Colors.error} />
                <Text style={styles.warningText}>
                  You must answer ALL values questions correctly to pass the real
                  test. Focus on studying Australian Values.
                </Text>
              </View>
            )}

            <View style={styles.detailDivider} />
          </>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Time Taken</Text>
          <Text style={styles.detailValue}>{formatTime(timeTaken)}</Text>
        </View>

        <View style={styles.detailDivider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Result</Text>
          <View
            style={[
              styles.resultBadge,
              {
                backgroundColor: passed
                  ? Colors.correctAnswer
                  : Colors.incorrectAnswer,
              },
            ]}
          >
            <Text
              style={[
                styles.resultBadgeText,
                {
                  color: passed ? Colors.correctBorder : Colors.incorrectBorder,
                },
              ]}
            >
              {passed ? 'PASSED ✅' : 'NOT PASSED ❌'}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/quiz')}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={20} color={Colors.white} />
          <Text style={styles.primaryButtonText}>Take Another Test</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/(tabs)/study')}
          activeOpacity={0.8}
        >
          <Ionicons name="book" size={20} color={Colors.blue} />
          <Text style={styles.secondaryButtonText}>Review Study Guide</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tertiaryButton}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.8}
        >
          <Text style={styles.tertiaryButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  resultHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  resultTitle: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  resultSubtitle: {
    fontSize: Fonts.sizes.md,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  scoreCard: {
    alignItems: 'center',
    marginTop: -30,
    marginBottom: Spacing.lg,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.large,
  },
  scorePercent: {
    fontSize: Fonts.sizes.hero,
    fontWeight: 'bold',
    color: Colors.charcoal,
  },
  scoreLabel: {
    fontSize: Fonts.sizes.sm,
    color: Colors.gray,
  },
  gradeText: {
    fontSize: Fonts.sizes.xl,
    fontWeight: 'bold',
    color: Colors.charcoal,
    marginTop: Spacing.md,
  },
  messageText: {
    fontSize: Fonts.sizes.md,
    color: Colors.darkGray,
    textAlign: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    lineHeight: 22,
  },
  detailsCard: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
  },
  detailsTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: 'bold',
    color: Colors.charcoal,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: Fonts.sizes.md,
    color: Colors.darkGray,
  },
  detailValue: {
    fontSize: Fonts.sizes.md,
    color: Colors.charcoal,
    fontWeight: '600',
  },
  detailDivider: {
    height: 1,
    backgroundColor: Colors.lightGray,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3F3',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
    fontSize: Fonts.sizes.sm,
    color: Colors.error,
    lineHeight: 20,
  },
  resultBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  resultBadgeText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: 'bold',
  },
  actions: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.blue,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    ...Shadows.medium,
  },
  primaryButtonText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: 'bold',
    color: Colors.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.blue,
    gap: Spacing.sm,
  },
  secondaryButtonText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: 'bold',
    color: Colors.blue,
  },
  tertiaryButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  tertiaryButtonText: {
    fontSize: Fonts.sizes.md,
    color: Colors.gray,
  },
});
