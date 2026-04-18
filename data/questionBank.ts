import { Question, QuestionCategory, Exam } from '../constants/types';

// Lazy-load question data — modules are only evaluated the first time they're accessed
let _allQuestions: Question[] | null = null;
let _exams: Exam[] | null = null;
let _getExamByIdFn: ((id: number) => Exam | undefined) | null = null;

function loadQuestions(): Question[] {
  if (!_allQuestions) {
    const valuesQuestions = require('./questions-values').default;
    const australiaQuestions = require('./questions-australia').default;
    const democraticQuestions = require('./questions-democratic').default;
    const governmentQuestions = require('./questions-government').default;
    _allQuestions = [
      ...valuesQuestions,
      ...australiaQuestions,
      ...democraticQuestions,
      ...governmentQuestions,
    ];
  }
  return _allQuestions;
}

function loadExams() {
  if (!_exams) {
    const examModule = require('./exams');
    _exams = examModule.exams;
    _getExamByIdFn = examModule.getExamById;
  }
}

// Combine all questions into a single bank (lazy)
export const allQuestions: Question[] = new Proxy([] as Question[], {
  get(target, prop) {
    const questions = loadQuestions();
    return Reflect.get(questions, prop);
  },
});

// Get questions by category
export function getQuestionsByCategory(category: QuestionCategory): Question[] {
  return loadQuestions().filter((q) => q.category === category);
}

// Get values questions only
export function getValuesQuestions(): Question[] {
  return loadQuestions().filter((q) => q.isValuesQuestion);
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate a quiz with the official format:
// 5 values questions (must get all correct) + 15 general questions
// Total: 20 questions, need 75% (15/20) to pass
export function generateQuiz(): Question[] {
  const values = shuffleArray(getValuesQuestions()).slice(0, 5);
  const nonValues = shuffleArray(
    loadQuestions().filter((q) => !q.isValuesQuestion)
  ).slice(0, 15);

  // Mix values questions throughout the quiz (not all at the start)
  const combined = [...values, ...nonValues];
  return shuffleArray(combined);
}

// Generate a category-specific practice quiz
export function generateCategoryQuiz(
  category: QuestionCategory,
  count: number = 20
): Question[] {
  const categoryQuestions = getQuestionsByCategory(category);
  return shuffleArray(categoryQuestions).slice(0, Math.min(count, categoryQuestions.length));
}

// Get total question count
export function getTotalQuestionCount(): number {
  return loadQuestions().length;
}

// Get question count by category
export function getQuestionCountByCategory(): Record<QuestionCategory, number> {
  return {
    australian_values: getQuestionsByCategory('australian_values').length,
    australia_and_its_people: getQuestionsByCategory('australia_and_its_people').length,
    democratic_beliefs: getQuestionsByCategory('democratic_beliefs').length,
    government_and_law: getQuestionsByCategory('government_and_law').length,
  };
}

// ========== EXAM FUNCTIONS ==========

// Get all exams
export function getAllExams(): Exam[] {
  loadExams();
  return _exams!;
}

// Get exam by ID
export function getExamById(id: number): Exam | undefined {
  loadExams();
  return _getExamByIdFn!(id);
}

// Generate quiz questions for a specific exam
export function generateExamQuiz(examId: number): Question[] {
  loadExams();
  const exam = _getExamByIdFn!(examId);
  if (!exam) return [];

  const questions = loadQuestions();
  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const examQuestions = exam.questionIds
    .map((id) => questionMap.get(id))
    .filter((q): q is Question => q !== undefined);

  return shuffleArray(examQuestions);
}

// Get total number of exams
export function getTotalExamCount(): number {
  loadExams();
  return _exams!.length;
}

// Get exams by difficulty
export function getExamsByDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): Exam[] {
  loadExams();
  return _exams!.filter((exam) => exam.difficulty === difficulty);
}
