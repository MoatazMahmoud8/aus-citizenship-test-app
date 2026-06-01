import { Exam } from '../constants/types';

export const exams: Exam[] = [
  // ============================================================
  // 🔥 LAST-MINUTE EXAM — questions reported by recent passers
  // Sorted hottest-first. Auto-curated from recallCount in the
  // question bank (see bot repo `scripts/sync_to_app.py`).
  // ============================================================
  {
    id: 999,
    title: '🔥 Last-Minute Exam — Frequently Asked',
    description:
      'The night-before drill. Every question here has been reported by recent test-takers as one that actually appeared on the exam. Hottest questions first.',
    questionIds: [308, 9, 33, 131, 143, 144, 147, 165, 199, 208, 218, 303, 333, 346, 347, 354, 356, 378, 566, 591, 698, 9001, 9002, 9003, 9004, 9005, 9006, 9007, 4, 6, 13, 14, 21, 22, 25, 26, 34, 35, 36, 40, 44, 47, 50, 52, 57, 103, 132, 157, 164, 175, 180, 190, 193, 196, 219, 223, 326, 337, 339, 342, 350, 352, 355, 357, 361, 514, 515, 561, 562, 567, 570, 571, 592, 597, 610, 615, 636, 673, 687, 9008, 9009, 9010, 9011, 9012, 9013, 9014, 9015, 9016, 9017, 9018, 9019, 9020, 9021, 9022, 9023],
    valuesQuestionIds: [9, 33, 4, 6, 13],
    totalQuestions: 95,
    difficulty: 'Hard',
  },

  // ============================================================
  // EASY EXAMS (1-8)
  // ============================================================
  {
    id: 1,
    title: 'Practice Exam 1',
    description: 'A beginner-friendly exam covering Australian values, people, democracy, and government basics.',
    questionIds: [1, 2, 3, 4, 5, 101, 102, 103, 104, 105, 301, 302, 303, 304, 305, 501, 502, 503, 504, 505],
    valuesQuestionIds: [1, 2, 3, 4, 5],
    totalQuestions: 20,
    difficulty: 'Easy',
  },
  {
    id: 2,
    title: 'Practice Exam 2',
    description: 'An introductory exam to help you learn about Australian citizenship topics at an easy level.',
    questionIds: [6, 7, 8, 9, 10, 106, 107, 108, 109, 110, 306, 307, 308, 309, 310, 506, 507, 508, 509, 510],
    valuesQuestionIds: [6, 7, 8, 9, 10],
    totalQuestions: 20,
    difficulty: 'Easy',
  },
  {
    id: 3,
    title: 'Practice Exam 3',
    description: 'A gentle practice exam to build your confidence on Australian citizenship knowledge.',
    questionIds: [11, 12, 13, 14, 15, 111, 112, 113, 114, 115, 311, 312, 313, 314, 315, 511, 512, 513, 514, 515],
    valuesQuestionIds: [11, 12, 13, 14, 15],
    totalQuestions: 20,
    difficulty: 'Easy',
  },
  {
    id: 4,
    title: 'Practice Exam 4',
    description: 'Start with the basics — this easy exam covers values, history, democracy, and government.',
    questionIds: [16, 17, 18, 19, 20, 116, 117, 118, 119, 120, 316, 317, 318, 319, 320, 516, 517, 518, 519, 520],
    valuesQuestionIds: [16, 17, 18, 19, 20],
    totalQuestions: 20,
    difficulty: 'Easy',
  },
  {
    id: 5,
    title: 'Practice Exam 5',
    description: 'An easy-level exam designed to introduce key Australian citizenship concepts.',
    questionIds: [21, 22, 23, 24, 25, 121, 122, 123, 124, 125, 321, 322, 323, 324, 325, 521, 522, 523, 524, 525],
    valuesQuestionIds: [21, 22, 23, 24, 25],
    totalQuestions: 20,
    difficulty: 'Easy',
  },
  {
    id: 6,
    title: 'Practice Exam 6',
    description: 'A straightforward practice exam for newcomers preparing for the citizenship test.',
    questionIds: [26, 27, 28, 29, 30, 126, 127, 128, 129, 130, 326, 327, 328, 329, 330, 526, 527, 528, 529, 530],
    valuesQuestionIds: [26, 27, 28, 29, 30],
    totalQuestions: 20,
    difficulty: 'Easy',
  },
  {
    id: 7,
    title: 'Practice Exam 7',
    description: 'Build foundational knowledge with this easy practice exam on Australian citizenship.',
    questionIds: [31, 32, 33, 34, 35, 131, 132, 133, 134, 135, 331, 332, 333, 334, 335, 531, 532, 533, 534, 535],
    valuesQuestionIds: [31, 32, 33, 34, 35],
    totalQuestions: 20,
    difficulty: 'Easy',
  },
  {
    id: 8,
    title: 'Practice Exam 8',
    description: 'The final easy-level exam — test your understanding before moving to medium difficulty.',
    questionIds: [36, 37, 38, 39, 40, 136, 137, 138, 139, 140, 336, 337, 338, 339, 340, 536, 537, 538, 539, 540],
    valuesQuestionIds: [36, 37, 38, 39, 40],
    totalQuestions: 20,
    difficulty: 'Easy',
  },
  // ============================================================
  // MEDIUM EXAMS (9-17)
  // ============================================================
  {
    id: 9,
    title: 'Practice Exam 9',
    description: 'A moderately challenging exam that tests your knowledge across all citizenship topics.',
    questionIds: [41, 42, 43, 44, 45, 141, 142, 143, 144, 145, 341, 342, 343, 344, 345, 541, 542, 543, 544, 545],
    valuesQuestionIds: [41, 42, 43, 44, 45],
    totalQuestions: 20,
    difficulty: 'Medium',
  },
  {
    id: 10,
    title: 'Practice Exam 10',
    description: 'Step up the challenge with this medium-difficulty practice exam on Australian citizenship.',
    questionIds: [46, 47, 48, 49, 50, 146, 147, 148, 149, 150, 346, 347, 348, 349, 350, 546, 547, 548, 549, 550],
    valuesQuestionIds: [46, 47, 48, 49, 50],
    totalQuestions: 20,
    difficulty: 'Medium',
  },
  {
    id: 11,
    title: 'Practice Exam 11',
    description: 'A well-rounded medium exam covering values, Australian history, and governance.',
    questionIds: [51, 52, 53, 54, 55, 151, 152, 153, 154, 155, 351, 352, 353, 354, 355, 551, 552, 553, 554, 555],
    valuesQuestionIds: [51, 52, 53, 54, 55],
    totalQuestions: 20,
    difficulty: 'Medium',
  },
  {
    id: 12,
    title: 'Practice Exam 12',
    description: 'Test your intermediate knowledge of Australian citizenship with this medium exam.',
    questionIds: [56, 57, 58, 59, 60, 156, 157, 158, 159, 160, 356, 357, 358, 359, 360, 556, 557, 558, 559, 560],
    valuesQuestionIds: [56, 57, 58, 59, 60],
    totalQuestions: 20,
    difficulty: 'Medium',
  },
  {
    id: 13,
    title: 'Practice Exam 13',
    description: 'A medium-level exam that digs deeper into democratic beliefs and government structure.',
    questionIds: [61, 62, 63, 64, 65, 161, 162, 163, 164, 165, 361, 362, 363, 364, 365, 561, 562, 563, 564, 565],
    valuesQuestionIds: [61, 62, 63, 64, 65],
    totalQuestions: 20,
    difficulty: 'Medium',
  },
  {
    id: 14,
    title: 'Practice Exam 14',
    description: 'Sharpen your understanding with this moderately difficult citizenship practice exam.',
    questionIds: [66, 67, 68, 69, 70, 166, 167, 168, 169, 170, 366, 367, 368, 369, 370, 566, 567, 568, 569, 570],
    valuesQuestionIds: [66, 67, 68, 69, 70],
    totalQuestions: 20,
    difficulty: 'Medium',
  },
  {
    id: 15,
    title: 'Practice Exam 15',
    description: 'A comprehensive medium exam drawing questions from all major citizenship categories.',
    questionIds: [71, 72, 73, 74, 75, 171, 172, 173, 174, 175, 371, 372, 373, 374, 375, 571, 572, 573, 574, 575],
    valuesQuestionIds: [71, 72, 73, 74, 75],
    totalQuestions: 20,
    difficulty: 'Medium',
  },
  {
    id: 16,
    title: 'Practice Exam 16',
    description: 'Continue your medium-level preparation with questions on values, people, and law.',
    questionIds: [76, 77, 78, 79, 80, 176, 177, 178, 179, 180, 376, 377, 378, 301, 302, 576, 577, 578, 579, 580],
    valuesQuestionIds: [76, 77, 78, 79, 80],
    totalQuestions: 20,
    difficulty: 'Medium',
  },
  {
    id: 17,
    title: 'Practice Exam 17',
    description: 'The last medium exam — prove you are ready for the hard-level challenge ahead.',
    questionIds: [81, 82, 83, 84, 85, 181, 182, 183, 184, 185, 303, 304, 305, 306, 307, 581, 582, 583, 584, 585],
    valuesQuestionIds: [81, 82, 83, 84, 85],
    totalQuestions: 20,
    difficulty: 'Medium',
  },
  // ============================================================
  // HARD EXAMS (18-25)
  // ============================================================
  {
    id: 18,
    title: 'Practice Exam 18',
    description: 'A challenging exam for those who want to thoroughly test their citizenship knowledge.',
    questionIds: [86, 87, 88, 89, 90, 186, 187, 188, 189, 190, 308, 309, 310, 311, 312, 586, 587, 588, 589, 590],
    valuesQuestionIds: [86, 87, 88, 89, 90],
    totalQuestions: 20,
    difficulty: 'Hard',
  },
  {
    id: 19,
    title: 'Practice Exam 19',
    description: 'Push your limits with this hard practice exam on Australian citizenship.',
    questionIds: [91, 92, 93, 94, 1, 191, 192, 193, 194, 195, 313, 314, 315, 316, 317, 591, 592, 593, 594, 595],
    valuesQuestionIds: [91, 92, 93, 94, 1],
    totalQuestions: 20,
    difficulty: 'Hard',
  },
  {
    id: 20,
    title: 'Practice Exam 20',
    description: 'A rigorous exam covering advanced topics across all citizenship categories.',
    questionIds: [2, 3, 4, 5, 6, 196, 197, 198, 199, 200, 318, 319, 320, 321, 322, 596, 597, 598, 599, 600],
    valuesQuestionIds: [2, 3, 4, 5, 6],
    totalQuestions: 20,
    difficulty: 'Hard',
  },
  {
    id: 21,
    title: 'Practice Exam 21',
    description: 'A demanding exam that covers the trickiest areas of Australian citizenship.',
    questionIds: [7, 8, 9, 10, 11, 201, 202, 203, 204, 205, 323, 324, 325, 326, 327, 601, 602, 603, 604, 605],
    valuesQuestionIds: [7, 8, 9, 10, 11],
    totalQuestions: 20,
    difficulty: 'Hard',
  },
  {
    id: 22,
    title: 'Practice Exam 22',
    description: 'Test your deep understanding of values, democracy, and Australian governance.',
    questionIds: [12, 13, 14, 15, 16, 206, 207, 208, 209, 210, 328, 329, 330, 331, 332, 606, 607, 608, 609, 610],
    valuesQuestionIds: [12, 13, 14, 15, 16],
    totalQuestions: 20,
    difficulty: 'Hard',
  },
  {
    id: 23,
    title: 'Practice Exam 23',
    description: 'A tough practice exam to ensure you are fully prepared for the real test.',
    questionIds: [17, 18, 19, 20, 21, 211, 212, 213, 214, 215, 333, 334, 335, 336, 337, 611, 612, 613, 614, 615],
    valuesQuestionIds: [17, 18, 19, 20, 21],
    totalQuestions: 20,
    difficulty: 'Hard',
  },
  {
    id: 24,
    title: 'Practice Exam 24',
    description: 'Nearly the hardest exam — a serious challenge for dedicated learners.',
    questionIds: [22, 23, 24, 25, 26, 216, 217, 218, 219, 220, 338, 339, 340, 341, 342, 616, 617, 618, 619, 620],
    valuesQuestionIds: [22, 23, 24, 25, 26],
    totalQuestions: 20,
    difficulty: 'Hard',
  },
  {
    id: 25,
    title: 'Practice Exam 25',
    description: 'The ultimate hard exam — master this and you are ready for the Australian citizenship test.',
    questionIds: [27, 28, 29, 30, 31, 221, 222, 223, 224, 225, 343, 344, 345, 346, 347, 621, 622, 623, 624, 625],
    valuesQuestionIds: [27, 28, 29, 30, 31],
    totalQuestions: 20,
    difficulty: 'Hard',
  },
];

export const getExamById = (id: number): Exam | undefined => {
  return exams.find((exam) => exam.id === id);
};

export const getExamsByDifficulty = (difficulty: 'Easy' | 'Medium' | 'Hard'): Exam[] => {
  return exams.filter((exam) => exam.difficulty === difficulty);
};

export default exams;
