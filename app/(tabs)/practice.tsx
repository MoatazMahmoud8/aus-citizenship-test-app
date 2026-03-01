import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { CATEGORY_INFO, QuestionCategory, QUIZ_CONFIG } from '../../constants/types';
import { getQuestionCountByCategory, getAllExams, getTotalQuestionCount } from '../../data/questionBank';

export default function PracticeScreen() {
  const router = useRouter();
  const categoryCounts = getQuestionCountByCategory();
  const allExams = getAllExams();
  const totalQuestions = getTotalQuestionCount();
  const [showAllExams, setShowAllExams] = useState(false);

  const categories: QuestionCategory[] = [
    'australian_values',
    'australia_and_its_people',
    'democratic_beliefs',
    'government_and_law',
  ];

  const difficultyColors: Record<string, string> = {
    Easy: '#00843D',
    Medium: '#FFB300',
    Hard: '#DC3545',
  };

  const displayedExams = showAllExams ? allExams : allExams.slice(0, 6);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Practice Tests</Text>
        <Text style={styles.headerSubtitle}>
          {totalQuestions} questions across {allExams.length} practice exams. Choose a format below.
        </Text>
      </View>

      {/* Full Practice Test */}
      <TouchableOpacity
        style={styles.fullTestCard}
        onPress={() => router.push('/quiz?mode=full')}
        activeOpacity={0.8}
      >
        <View style={styles.fullTestHeader}>
          <Ionicons name="document-text" size={32} color={Colors.white} />
          <View style={styles.fullTestContent}>
            <Text style={styles.fullTestTitle}>Random Practice Test</Text>
            <Text style={styles.fullTestSubtitle}>
              Random questions — like the real test
            </Text>
          </View>
        </View>
        <View style={styles.fullTestDetails}>
          <View style={styles.fullTestDetail}>
            <Text style={styles.fullTestDetailValue}>{QUIZ_CONFIG.TOTAL_QUESTIONS}</Text>
            <Text style={styles.fullTestDetailLabel}>Questions</Text>
          </View>
          <View style={styles.fullTestDetail}>
            <Text style={styles.fullTestDetailValue}>{QUIZ_CONFIG.PASS_MARK_PERCENT}%</Text>
            <Text style={styles.fullTestDetailLabel}>Pass Mark</Text>
          </View>
          <View style={styles.fullTestDetail}>
            <Text style={styles.fullTestDetailValue}>{QUIZ_CONFIG.VALUES_PASS_REQUIRED}/5</Text>
            <Text style={styles.fullTestDetailLabel}>Values</Text>
          </View>
          <View style={styles.fullTestDetail}>
            <Text style={styles.fullTestDetailValue}>{QUIZ_CONFIG.TIME_LIMIT_MINUTES}m</Text>
            <Text style={styles.fullTestDetailLabel}>Timer</Text>
          </View>
        </View>
        <View style={styles.startRow}>
          <Text style={styles.startRowText}>Start Random Test</Text>
          <Ionicons name="arrow-forward-circle" size={24} color={Colors.gold} />
        </View>
      </TouchableOpacity>

      {/* Practice Exams */}
      <Text style={styles.sectionTitle}>📝 Practice Exams ({allExams.length})</Text>
      <Text style={styles.sectionSubtitle}>
        Structured exams with fixed question sets — track your progress!
      </Text>

      <View style={styles.examGrid}>
        {displayedExams.map((exam) => (
          <TouchableOpacity
            key={exam.id}
            style={styles.examCard}
            onPress={() => router.push(`/quiz?mode=exam&examId=${exam.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.examHeader}>
              <View style={styles.examNumberBadge}>
                <Text style={styles.examNumber}>{exam.id}</Text>
              </View>
              <View style={[styles.difficultyBadge, { backgroundColor: `${difficultyColors[exam.difficulty]}20` }]}>
                <Text style={[styles.difficultyText, { color: difficultyColors[exam.difficulty] }]}>
                  {exam.difficulty}
                </Text>
              </View>
            </View>
            <Text style={styles.examTitle}>{exam.title}</Text>
            <Text style={styles.examDesc} numberOfLines={2}>{exam.description}</Text>
            <View style={styles.examFooter}>
              <Text style={styles.examQuestionCount}>{exam.totalQuestions} questions</Text>
              <Ionicons name="play-circle" size={22} color={Colors.blue} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {allExams.length > 6 && (
        <TouchableOpacity
          style={styles.showMoreButton}
          onPress={() => setShowAllExams(!showAllExams)}
        >
          <Text style={styles.showMoreText}>
            {showAllExams ? 'Show Less' : `Show All ${allExams.length} Exams`}
          </Text>
          <Ionicons name={showAllExams ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.blue} />
        </TouchableOpacity>
      )}

      {/* Category Practice */}
      <Text style={styles.sectionTitle}>📚 Practice by Category</Text>

      {categories.map((cat) => {
        const info = CATEGORY_INFO[cat];
        const count = categoryCounts[cat];
        return (
          <TouchableOpacity
            key={cat}
            style={styles.categoryCard}
            onPress={() => router.push(`/quiz?mode=category&category=${cat}`)}
            activeOpacity={0.7}
          >
            <View style={[styles.categoryIcon, { backgroundColor: `${info.color}15` }]}>
              <Ionicons name={info.icon as any} size={28} color={info.color} />
            </View>
            <View style={styles.categoryContent}>
              <Text style={styles.categoryTitle}>{info.label}</Text>
              <Text style={styles.categoryDesc} numberOfLines={2}>
                {info.description}
              </Text>
              <Text style={styles.categoryCount}>{count} questions available</Text>
            </View>
            <Ionicons name="play-circle" size={28} color={info.color} />
          </TouchableOpacity>
        );
      })}

      {/* Quick Practice */}
      <Text style={styles.sectionTitle}>Quick Practice</Text>
      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push('/quiz?mode=quick&count=10')}
        >
          <Text style={styles.quickNumber}>10</Text>
          <Text style={styles.quickLabel}>Quick Quiz</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push('/quiz?mode=quick&count=15')}
        >
          <Text style={styles.quickNumber}>15</Text>
          <Text style={styles.quickLabel}>Medium Quiz</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push('/quiz?mode=full')}
        >
          <Text style={styles.quickNumber}>20</Text>
          <Text style={styles.quickLabel}>Full Test</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  header: {
    padding: Spacing.lg,
  },
  headerTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: 'bold',
    color: Colors.charcoal,
    marginBottom: Spacing.sm,
  },
  headerSubtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.darkGray,
  },
  fullTestCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.blue,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.large,
  },
  fullTestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  fullTestContent: {
    marginLeft: Spacing.md,
  },
  fullTestTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: 'bold',
    color: Colors.white,
  },
  fullTestSubtitle: {
    fontSize: Fonts.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  fullTestDetails: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  fullTestDetail: {
    flex: 1,
    alignItems: 'center',
  },
  fullTestDetailValue: {
    fontSize: Fonts.sizes.lg,
    fontWeight: 'bold',
    color: Colors.gold,
  },
  fullTestDetailLabel: {
    fontSize: Fonts.sizes.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  startRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: Spacing.md,
  },
  startRowText: {
    fontSize: Fonts.sizes.md,
    fontWeight: 'bold',
    color: Colors.gold,
    marginRight: Spacing.sm,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryContent: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  categoryTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: 'bold',
    color: Colors.charcoal,
  },
  categoryDesc: {
    fontSize: Fonts.sizes.xs,
    color: Colors.gray,
    marginTop: 2,
    lineHeight: 16,
  },
  categoryCount: {
    fontSize: Fonts.sizes.xs,
    color: Colors.blue,
    fontWeight: '600',
    marginTop: 4,
  },
  quickGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  quickCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.small,
  },
  quickNumber: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: 'bold',
    color: Colors.blue,
  },
  quickLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.gray,
    marginTop: 4,
  },
  sectionSubtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.darkGray,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    marginTop: -Spacing.sm,
  },
  examGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  examCard: {
    width: '47%' as any,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.small,
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  examNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  examNumber: {
    fontSize: Fonts.sizes.sm,
    fontWeight: 'bold',
    color: Colors.white,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  examTitle: {
    fontSize: Fonts.sizes.sm,
    fontWeight: 'bold',
    color: Colors.charcoal,
    marginBottom: 4,
  },
  examDesc: {
    fontSize: 11,
    color: Colors.gray,
    lineHeight: 15,
    marginBottom: Spacing.sm,
  },
  examFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  examQuestionCount: {
    fontSize: Fonts.sizes.xs,
    color: Colors.blue,
    fontWeight: '600',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.blue,
  },
  showMoreText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: '600',
    color: Colors.blue,
    marginRight: Spacing.xs,
  },
});
