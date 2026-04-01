import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserProgress,
  QuizResult,
  DEFAULT_PROGRESS,
  CategoryScore,
  QuestionCategory,
} from '../constants/types';

const STORAGE_KEYS = {
  PROGRESS: '@citizenship_progress',
  QUIZ_HISTORY: '@citizenship_quiz_history',
  BOOKMARKS: '@citizenship_bookmarks',
  SETTINGS: '@citizenship_settings',
};

// ============= Progress Management =============

export async function getProgress(): Promise<UserProgress> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);
    return data ? JSON.parse(data) : DEFAULT_PROGRESS;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export async function saveProgress(progress: UserProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}

export async function updateProgressAfterQuiz(result: QuizResult): Promise<UserProgress> {
  const progress = await getProgress();

  progress.totalQuizzesTaken += 1;
  progress.totalQuestionsPracticed += result.totalQuestions;

  const scorePercent = (result.correctAnswers / result.totalQuestions) * 100;
  progress.averageScore =
    (progress.averageScore * (progress.totalQuizzesTaken - 1) + scorePercent) /
    progress.totalQuizzesTaken;

  if (scorePercent > progress.bestScore) {
    progress.bestScore = scorePercent;
  }

  // Update streak
  const today = new Date().toISOString().split('T')[0];
  if (progress.lastPracticeDate) {
    const lastDate = new Date(progress.lastPracticeDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 1) {
      progress.currentStreak += 1;
    } else if (diffDays > 1) {
      progress.currentStreak = 1;
    }
  } else {
    progress.currentStreak = 1;
  }

  if (progress.currentStreak > progress.longestStreak) {
    progress.longestStreak = progress.currentStreak;
  }

  progress.lastPracticeDate = today;

  // Update category scores from answers
  for (const answer of result.answers) {
    // Find the category for this question from the result
    // We'll need to update the category based on the question data
  }

  await saveProgress(progress);
  return progress;
}

export async function updateCategoryScore(
  category: QuestionCategory,
  correct: number,
  total: number
): Promise<void> {
  try {
    const progress = await getProgress();
    const catScore = progress.categoryScores[category];
    if (!catScore) {
      console.warn(`Category '${category}' not found in progress, skipping.`);
      return;
    }
    catScore.totalAttempted += total;
    catScore.totalCorrect += correct;
    catScore.accuracy =
      catScore.totalAttempted > 0
        ? (catScore.totalCorrect / catScore.totalAttempted) * 100
        : 0;
    await saveProgress(progress);
  } catch (error) {
    console.error('Error updating category score:', error);
  }
}

// ============= Quiz History =============

export async function getQuizHistory(): Promise<QuizResult[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveQuizResult(result: QuizResult): Promise<void> {
  try {
    const history = await getQuizHistory();
    history.unshift(result); // Add to beginning
    // Keep only last 50 results
    const trimmed = history.slice(0, 50);
    await AsyncStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error saving quiz result:', error);
  }
}

// ============= Bookmarks =============

export async function getBookmarks(): Promise<number[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function toggleBookmark(questionId: number): Promise<boolean> {
  try {
    const bookmarks = await getBookmarks();
    const index = bookmarks.indexOf(questionId);
    if (index >= 0) {
      bookmarks.splice(index, 1);
      await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
      return false; // removed
    } else {
      bookmarks.push(questionId);
      await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
      return true; // added
    }
  } catch {
    return false;
  }
}

// ============= Settings =============

export interface AppSettings {
  showTimer: boolean;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

export const DEFAULT_SETTINGS: AppSettings = {
  showTimer: true,
  soundEnabled: true,
  hapticEnabled: true,
  darkMode: false,
  fontSize: 'medium',
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

// ============= Reset =============

export async function resetAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.PROGRESS,
      STORAGE_KEYS.QUIZ_HISTORY,
      STORAGE_KEYS.BOOKMARKS,
    ]);
  } catch (error) {
    console.error('Error resetting data:', error);
  }
}

// ============= Study Section Tracking =============

export async function markStudySectionComplete(sectionId: string): Promise<void> {
  const progress = await getProgress();
  if (!progress.completedStudySections.includes(sectionId)) {
    progress.completedStudySections.push(sectionId);
    await saveProgress(progress);
  }
}

export async function isStudySectionComplete(sectionId: string): Promise<boolean> {
  const progress = await getProgress();
  return progress.completedStudySections.includes(sectionId);
}
