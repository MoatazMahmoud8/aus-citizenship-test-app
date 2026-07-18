import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Sentry from '@sentry/react-native';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import {
  Question,
  QuizAnswer,
  QuizResult,
  QUIZ_CONFIG,
  QuestionCategory,
} from '../../constants/types';
import {
  generateQuiz,
  generateCategoryQuiz,
  generateExamQuiz,
  allQuestions,
} from '../../data/questionBank';
import {
  saveQuizResult,
  updateProgressAfterQuiz,
  updateCategoryScore,
  getSettings,
  saveWrongAnswerImmediately,
} from '../../utils/storage';
import { formatTime, generateQuizId } from '../../utils/helpers';

const { width } = Dimensions.get('window');

export default function QuizScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode?: string;
    category?: string;
    count?: string;
    examId?: string;
  }>();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showTimer, setShowTimer] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [reportedExamQuestionIds, setReportedExamQuestionIds] = useState<number[]>([]);
  const [reportedIssueQuestionIds, setReportedIssueQuestionIds] = useState<number[]>([]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  // Initialize quiz
  useEffect(() => {
    initQuiz();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const initQuiz = async () => {
    const settings = await getSettings();
    setShowTimer(settings.showTimer);
    setHapticEnabled(settings.hapticEnabled);

    let quizQuestions: Question[];

    if (params.mode === 'exam' && params.examId) {
      const examId = parseInt(params.examId, 10);
      quizQuestions = generateExamQuiz(examId);
    } else if (params.mode === 'category' && params.category) {
      quizQuestions = generateCategoryQuiz(
        params.category as QuestionCategory
      );
    } else if (params.mode === 'quick' && params.count) {
      const count = parseInt(params.count, 10) || 10;
      // Shuffle all questions and take requested count
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      quizQuestions = shuffled.slice(0, count);
    } else {
      // Full practice test
      quizQuestions = generateQuiz();
    }

    setQuestions(quizQuestions);
    setIsLoading(false);
    setQuestionStartTime(Date.now());

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
  };

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const handleSelectAnswer = useCallback(
    (optionIndex: number) => {
      if (showExplanation) return; // Already answered
      if (!currentQuestion) return; // Guard against undefined question

      setSelectedAnswer(optionIndex);
      setShowExplanation(true);

      const isCorrect = optionIndex === currentQuestion.correctAnswer;
      const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);

      // Haptic feedback (native only, not available on web)
      if (hapticEnabled && Platform.OS !== 'web') {
        if (isCorrect) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }

      // Save wrong answer immediately (don't wait for quiz to finish)
      if (!isCorrect) {
        saveWrongAnswerImmediately(currentQuestion, optionIndex);
      }

      setAnswers((prev) => [
        ...prev,
        {
          questionId: currentQuestion.id,
          selectedAnswer: optionIndex,
          isCorrect,
          timeTaken,
        },
      ]);
    },
    [currentQuestion, showExplanation, questionStartTime, hapticEnabled]
  );

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      finishQuiz();
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setQuestionStartTime(Date.now());
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [isLastQuestion, answers]);

  const finishQuiz = async () => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (!questions.length) {
      Alert.alert('Quiz Error', 'No questions loaded. Please try again.');
      router.back();
      return;
    }

    const updatedAnswers = [...answers];
    const totalCorrect = updatedAnswers.filter((a) => a.isCorrect).length;

    // Calculate values score
    const valuesQuestionIds = questions
      .filter((q) => q.isValuesQuestion)
      .map((q) => q.id);
    const valuesAnswers = updatedAnswers.filter((a) =>
      valuesQuestionIds.includes(a.questionId)
    );
    const valuesCorrect = valuesAnswers.filter((a) => a.isCorrect).length;

    const scorePercent = questions.length > 0 ? (totalCorrect / questions.length) * 100 : 0;
    const valuesAllCorrect = valuesCorrect === valuesQuestionIds.length;
    const overallPass = scorePercent >= QUIZ_CONFIG.PASS_MARK_PERCENT;
    // CRITICAL: Values questions must be answered ALL correctly for ANY test to pass
    // This is non-negotiable per citizenship test requirements
    const passed = overallPass && (valuesQuestionIds.length === 0 || valuesAllCorrect);

    const result: QuizResult = {
      id: generateQuizId(),
      date: new Date().toISOString(),
      totalQuestions: questions.length,
      correctAnswers: totalCorrect,
      valuesCorrect,
      valuesTotalQuestions: valuesQuestionIds.length,
      passed,
      timeTaken: timeElapsed,
      answers: updatedAnswers,
      category: params.category as QuestionCategory | undefined || 'all',
    };

    try {
      // Save results
      await saveQuizResult(result);
      await updateProgressAfterQuiz(result, questions);

      // Update category scores
      const categoryGroups: Record<string, { correct: number; total: number }> = {};
      for (const answer of updatedAnswers) {
        const question = questions.find((q) => q.id === answer.questionId);
        if (question) {
          if (!categoryGroups[question.category]) {
            categoryGroups[question.category] = { correct: 0, total: 0 };
          }
          categoryGroups[question.category].total += 1;
          if (answer.isCorrect) {
            categoryGroups[question.category].correct += 1;
          }
        }
      }
      for (const [cat, scores] of Object.entries(categoryGroups)) {
        await updateCategoryScore(
          cat as QuestionCategory,
          scores.correct,
          scores.total
        );
      }
    } catch (error) {
      console.error('Error saving quiz results:', error);
      // Continue to results screen even if save fails
    }

    // Navigate to results
    router.replace({
      pathname: '/quiz/result',
      params: {
        resultId: result.id,
        totalQuestions: result.totalQuestions.toString(),
        correctAnswers: result.correctAnswers.toString(),
        valuesCorrect: result.valuesCorrect.toString(),
        valuesTotalQuestions: result.valuesTotalQuestions.toString(),
        passed: result.passed.toString(),
        timeTaken: result.timeTaken.toString(),
        scorePercent: Math.round(scorePercent).toString(),
      },
    });
  };

  const handleQuit = () => {
    Alert.alert(
      'Quit Test?',
      'Your progress will be lost. Are you sure?',
      [
        { text: 'Continue Test', style: 'cancel' },
        {
          text: 'Quit',
          style: 'destructive',
          onPress: () => {
            if (timerRef.current) clearInterval(timerRef.current);
            router.back();
          },
        },
      ]
    );
  };

  const getQuestionReportContext = () => ({
    questionId: currentQuestion.id,
    question: currentQuestion.question,
    category: currentQuestion.category,
    source: currentQuestion.source,
    quizMode: params.mode || 'practice',
    quizCategory: params.category || 'all',
    currentIndex: currentIndex + 1,
    totalQuestions: questions.length,
    selectedAnswerIndex: selectedAnswer,
    selectedAnswer:
      selectedAnswer !== null ? currentQuestion.options[selectedAnswer] : null,
    correctAnswerIndex: currentQuestion.correctAnswer,
    correctAnswer: currentQuestion.options[currentQuestion.correctAnswer],
    explanationShown: showExplanation,
  });

  const handleReportExamQuestion = () => {
    if (reportedExamQuestionIds.includes(currentQuestion.id)) {
      Alert.alert('Already Reported', 'Thanks, this question was already marked as similar to one in your exam.');
      return;
    }

    Sentry.captureMessage('Question reported as similar to real exam topic', {
      level: 'info',
      tags: {
        reportType: 'similar_in_exam',
        questionId: String(currentQuestion.id),
        category: currentQuestion.category,
      },
      contexts: {
        questionReport: getQuestionReportContext(),
      },
    });

    setReportedExamQuestionIds((prev) => [...prev, currentQuestion.id]);
    Alert.alert('Reported', 'Thanks. This helps us identify topics to mark as most repeated.');
  };

  const handleReportQuestionIssue = () => {
    if (reportedIssueQuestionIds.includes(currentQuestion.id)) {
      Alert.alert('Already Reported', 'Thanks, this question issue was already sent.');
      return;
    }

    Alert.alert(
      'Report Question Issue',
      'Send this question to support for review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Report',
          onPress: () => {
            Sentry.captureMessage('Question reported for review', {
              level: 'warning',
              tags: {
                reportType: 'question_issue',
                questionId: String(currentQuestion.id),
                category: currentQuestion.category,
              },
              contexts: {
                questionReport: getQuestionReportContext(),
              },
            });

            setReportedIssueQuestionIds((prev) => [...prev, currentQuestion.id]);
            Alert.alert('Report Sent', 'Thanks. We will review this question and answer.');
          },
        },
      ]
    );
  };

  if (isLoading || !currentQuestion) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Preparing your test...</Text>
      </View>
    );
  }

  const getOptionStyle = (index: number) => {
    if (!showExplanation) {
      return index === selectedAnswer ? styles.optionSelected : styles.option;
    }
    if (index === currentQuestion.correctAnswer) {
      return styles.optionCorrect;
    }
    if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
      return styles.optionIncorrect;
    }
    return styles.option;
  };

  const getOptionTextStyle = (index: number) => {
    if (!showExplanation) {
      return index === selectedAnswer
        ? styles.optionTextSelected
        : styles.optionText;
    }
    if (index === currentQuestion.correctAnswer) {
      return styles.optionTextCorrect;
    }
    if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
      return styles.optionTextIncorrect;
    }
    return styles.optionText;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View pointerEvents="box-only">
            <TouchableOpacity 
              onPress={handleQuit}
              style={styles.quitButton}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              activeOpacity={0.5}
            >
              <Ionicons name="close" size={28} color={Colors.darkGray} />
            </TouchableOpacity>
          </View>
          <Text style={styles.questionNumber}>
            {currentIndex + 1} / {questions.length}
          </Text>
          {showTimer && (
            <Text style={styles.timer}>{formatTime(timeElapsed)}</Text>
          )}
        </View>
        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Question */}
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionActions}>
          <TouchableOpacity
            style={styles.questionActionButton}
            onPress={handleReportExamQuestion}
            activeOpacity={0.75}
          >
            <Ionicons name="flame" size={15} color={Colors.blue} />
            <Text style={styles.questionActionText}>Similar in exam</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.questionActionButton, styles.issueActionButton]}
            onPress={handleReportQuestionIssue}
            activeOpacity={0.75}
          >
            <Ionicons name="flag" size={15} color={Colors.error} />
            <Text style={[styles.questionActionText, styles.issueActionText]}>Issue</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={getOptionStyle(index)}
              onPress={() => handleSelectAnswer(index)}
              disabled={showExplanation}
              activeOpacity={0.7}
            >
              <View style={styles.optionLetter}>
                <Text style={styles.optionLetterText}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text style={getOptionTextStyle(index)}>{option}</Text>
              {showExplanation && index === currentQuestion.correctAnswer && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={Colors.correctBorder}
                />
              )}
              {showExplanation &&
                index === selectedAnswer &&
                index !== currentQuestion.correctAnswer && (
                  <Ionicons
                    name="close-circle"
                    size={24}
                    color={Colors.incorrectBorder}
                  />
                )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Explanation */}
        {showExplanation && (
          <View style={styles.explanationCard}>
            <View style={styles.explanationHeader}>
              <Ionicons
                name={
                  selectedAnswer === currentQuestion.correctAnswer
                    ? 'checkmark-circle'
                    : 'information-circle'
                }
                size={22}
                color={
                  selectedAnswer === currentQuestion.correctAnswer
                    ? Colors.success
                    : Colors.info
                }
              />
              <Text
                style={[
                  styles.explanationTitle,
                  {
                    color:
                      selectedAnswer === currentQuestion.correctAnswer
                        ? Colors.success
                        : Colors.info,
                  },
                ]}
              >
                {selectedAnswer === currentQuestion.correctAnswer
                  ? 'Correct!'
                  : 'Incorrect'}
              </Text>
            </View>
            <Text style={styles.explanationText}>
              {currentQuestion.explanation}
            </Text>
            <Text style={styles.sourceText}>
              📖 Source: {currentQuestion.source}
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Button */}
      {showExplanation && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
              {isLastQuestion ? 'See Results' : 'Next Question'}
            </Text>
            <Ionicons
              name={isLastQuestion ? 'trophy' : 'arrow-forward'}
              size={20}
              color={Colors.white}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.offWhite,
  },
  loadingText: {
    fontSize: Fonts.sizes.lg,
    color: Colors.gray,
  },
  header: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    ...Shadows.small,
    zIndex: 100,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  quitButton: {
    padding: 8,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: Colors.lightGray,
    zIndex: 101,
  },
  questionNumber: {
    fontSize: Fonts.sizes.md,
    fontWeight: 'bold',
    color: Colors.charcoal,
  },
  timer: {
    fontSize: Fonts.sizes.md,
    color: Colors.blue,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: Colors.blue,
    borderRadius: 3,
  },
  valuesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    backgroundColor: '#FFF3F3',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 6,
  },
  valuesBadgeText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.error,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  questionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  questionActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#DDE7FF',
    gap: 5,
  },
  issueActionButton: {
    borderColor: '#F4C7CC',
  },
  questionActionText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
    color: Colors.blue,
  },
  issueActionText: {
    color: Colors.error,
  },
  questionText: {
    fontSize: Fonts.sizes.xl,
    fontWeight: '700',
    color: Colors.charcoal,
    lineHeight: 30,
    marginBottom: Spacing.lg,
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.lightGray,
    ...Shadows.small,
  },
  optionSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.selectedAnswer,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.selectedBorder,
  },
  optionCorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.correctAnswer,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.correctBorder,
  },
  optionIncorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.incorrectAnswer,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.incorrectBorder,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  optionLetterText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: 'bold',
    color: Colors.darkGray,
  },
  optionText: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    color: Colors.charcoal,
    lineHeight: 22,
  },
  optionTextSelected: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    color: Colors.blue,
    fontWeight: '600',
    lineHeight: 22,
  },
  optionTextCorrect: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    color: Colors.correctBorder,
    fontWeight: '600',
    lineHeight: 22,
  },
  optionTextIncorrect: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    color: Colors.incorrectBorder,
    fontWeight: '600',
    lineHeight: 22,
  },
  explanationCard: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  explanationTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: 'bold',
  },
  explanationText: {
    fontSize: Fonts.sizes.md,
    color: Colors.darkGray,
    lineHeight: 24,
    marginBottom: Spacing.sm,
  },
  sourceText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.gray,
    fontStyle: 'italic',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 36 : Spacing.lg,
    backgroundColor: Colors.white,
    ...Shadows.large,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.blue,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  nextButtonText: {
    fontSize: Fonts.sizes.lg,
    fontWeight: 'bold',
    color: Colors.white,
  },
});
