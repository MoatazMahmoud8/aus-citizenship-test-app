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
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../../../constants/theme';
import { CATEGORY_INFO, QuestionCategory, QUIZ_CONFIG } from '../../../constants/types';
import { getQuestionCountByCategory, getAllExams, getTotalQuestionCount } from '../../../data/questionBank';

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

  // Separate special exams from regular ones
  const specialExams = allExams.filter(e => e.id < 0);
  const regularExams = allExams.filter(e => e.id > 0);
  const displayedExams = showAllExams ? regularExams : regularExams.slice(0, 6);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Practice Tests</Text>
        <Text style={styles.headerSubtitle}>
          {totalQuestions} questions across {allExams.length} practice exams. Choose a format below.
        </Text>
      </View>

      {/* Review Wrong Answers Button */}
      <TouchableOpacity
        style={styles.reviewCard}
        onPress={() => router.push('/practice/review')}
        activeOpacity={0.7}
      >
        <View style={styles.reviewIcon}>
          <Ionicons name="alert-circle" size={28} color="#DC3545" />
        </View>
        <View style={styles.reviewContent}>
          <Text style={styles.reviewTitle}>📋 Review Wrong Answers</Text>
          <Text style={styles.reviewSubtitle}>
            Study questions you answered incorrectly
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={Colors.gray} />
      </TouchableOpacity>

      {/* Most Repeated Questions */}
      <Text style={styles.sectionTitle}>⚡ Most Repeated Questions</Text>
      <Text style={styles.sectionSubtitle}>
        Focus on the questions that appear most frequently in real tests
      </Text>
      
      <View style={styles.examGrid}>
        {specialExams.map((exam) => (
          <TouchableOpacity
            key={exam.id}
            style={[styles.examCard, styles.specialExamCard]}
            onPress={() => router.push(`/quiz?mode=exam&examId=${exam.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.examHeader}>
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

      {/* Practice by Section */}
      <Text style={styles.sectionTitle}>📚 Practice by Section</Text>
      <Text style={styles.sectionSubtitle}>
        Master each topic individually before taking full tests
      </Text>

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

      {/* Mixed Questions Exams */}
      <Text style={styles.sectionTitle}>🎯 Mixed Questions Exams</Text>
      <Text style={styles.sectionSubtitle}>
        Structured practice exams combining all topics — track your progress!
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

      {regularExams.length > 6 && (
        <TouchableOpacity
          style={styles.showMoreButton}
          onPress={() => setShowAllExams(!showAllExams)}
        >
          <Text style={styles.showMoreText}>
            {showAllExams ? 'Show Less' : `Show All ${regularExams.length} Exams`}
          </Text>
          <Ionicons name={showAllExams ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.blue} />
        </TouchableOpacity>
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
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: '#FFE5E5',
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#DC3545',
    ...Shadows.small,
  },
  reviewIcon: {
    marginRight: Spacing.md,
  },
  reviewContent: {
    flex: 1,
  },
  reviewTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: 'bold',
    color: Colors.charcoal,
    marginBottom: Spacing.xs,
  },
  reviewSubtitle: {
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
  specialExamCard: {
    borderWidth: 2,
    borderColor: Colors.gold,
    backgroundColor: '#FFF9E6',
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
