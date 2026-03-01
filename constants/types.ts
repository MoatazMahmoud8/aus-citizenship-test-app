export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  category: QuestionCategory;
  isValuesQuestion: boolean;
  explanation: string;
  source: string; // Reference to Our Common Bond section
}

export type QuestionCategory =
  | 'australian_values'
  | 'australia_and_its_people'
  | 'democratic_beliefs'
  | 'government_and_law';

export interface QuizResult {
  id: string;
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  valuesCorrect: number;
  valuesTotalQuestions: number;
  passed: boolean;
  timeTaken: number; // seconds
  answers: QuizAnswer[];
  category?: QuestionCategory | 'all';
}

export interface QuizAnswer {
  questionId: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeTaken: number;
}

export interface StudySection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  category: QuestionCategory;
  content: StudyContent[];
  keyFacts: string[];
}

export interface StudyContent {
  heading: string;
  body: string;
  bulletPoints?: string[];
  importantNote?: string;
}

export interface UserProgress {
  totalQuizzesTaken: number;
  totalQuestionsPracticed: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  categoryScores: Record<QuestionCategory, CategoryScore>;
  bookmarkedQuestions: number[];
  completedStudySections: string[];
}

export interface CategoryScore {
  totalAttempted: number;
  totalCorrect: number;
  accuracy: number;
}

export const DEFAULT_PROGRESS: UserProgress = {
  totalQuizzesTaken: 0,
  totalQuestionsPracticed: 0,
  averageScore: 0,
  bestScore: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastPracticeDate: null,
  categoryScores: {
    australian_values: { totalAttempted: 0, totalCorrect: 0, accuracy: 0 },
    australia_and_its_people: { totalAttempted: 0, totalCorrect: 0, accuracy: 0 },
    democratic_beliefs: { totalAttempted: 0, totalCorrect: 0, accuracy: 0 },
    government_and_law: { totalAttempted: 0, totalCorrect: 0, accuracy: 0 },
  },
  bookmarkedQuestions: [],
  completedStudySections: [],
};

export interface Exam {
  id: number;
  title: string;
  description: string;
  questionIds: number[];
  valuesQuestionIds: number[]; // subset of questionIds that are values questions
  totalQuestions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export const QUIZ_CONFIG = {
  TOTAL_QUESTIONS: 20,
  VALUES_QUESTIONS: 5,
  PASS_MARK_PERCENT: 75,
  PASS_MARK_QUESTIONS: 15,
  VALUES_PASS_REQUIRED: 5, // must get all 5 values questions correct
  TIME_LIMIT_MINUTES: 45,
};

export const CATEGORY_INFO: Record<QuestionCategory, { label: string; icon: string; color: string; description: string }> = {
  australian_values: {
    label: 'Australian Values',
    icon: 'heart',
    color: '#DC3545',
    description: 'Freedom, respect, equality, and the fair go. You must answer ALL values questions correctly to pass.',
  },
  australia_and_its_people: {
    label: 'Australia & Its People',
    icon: 'globe',
    color: '#002B7F',
    description: 'History, geography, national symbols, and the diverse people of Australia.',
  },
  democratic_beliefs: {
    label: 'Democratic Beliefs, Rights & Liberties',
    icon: 'shield-checkmark',
    color: '#00843D',
    description: 'Democracy, freedom of speech, religion, equality, and the rule of law.',
  },
  government_and_law: {
    label: 'Government & the Law',
    icon: 'business',
    color: '#FFD700',
    description: 'The three levels of government, the Constitution, voting, and the legal system.',
  },
};
