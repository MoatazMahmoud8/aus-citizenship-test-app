import AsyncStorage from '@react-native-async-storage/async-storage';

const RATING_KEY = 'ace_rating_prompt';
const RATING_SHOW_AFTER_QUIZZES = 1; // Show after the first passed quiz
const RATING_MINDAYS_BETWEEN_PROMPTS = 14; // …and at most once every 14 days

export interface RatingState {
  passedQuizzesCount: number;
  lastShownDate: string | null;
  dismissed: boolean; // user said "never ask again"
  rated: boolean; // user tapped Rate Now → store opened
}

const DEFAULT_STATE: RatingState = {
  passedQuizzesCount: 0,
  lastShownDate: null,
  dismissed: false,
  rated: false,
};

export async function getRatingState(): Promise<RatingState> {
  try {
    const data = await AsyncStorage.getItem(RATING_KEY);
    if (!data) return { ...DEFAULT_STATE };
    try {
      return { ...DEFAULT_STATE, ...JSON.parse(data) };
    } catch (parseError) {
      console.warn('Corrupted rating state, resetting:', parseError);
      await AsyncStorage.removeItem(RATING_KEY);
      return { ...DEFAULT_STATE };
    }
  } catch (error) {
    console.error('Error reading rating state:', error);
    return { ...DEFAULT_STATE };
  }
}

async function writeRatingState(state: RatingState): Promise<void> {
  try {
    await AsyncStorage.setItem(RATING_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error writing rating state:', error);
  }
}

export async function shouldShowRatingPrompt(): Promise<boolean> {
  const state = await getRatingState();
  if (state.dismissed || state.rated) return false;
  if (state.passedQuizzesCount < RATING_SHOW_AFTER_QUIZZES) return false;
  if (state.lastShownDate) {
    const lastDate = new Date(state.lastShownDate);
    if (!isNaN(lastDate.getTime())) {
      const daysSinceShown = Math.floor(
        (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceShown < RATING_MINDAYS_BETWEEN_PROMPTS) return false;
    }
  }
  return true;
}

export async function incrementPassedQuizzes(): Promise<void> {
  const state = await getRatingState();
  state.passedQuizzesCount += 1;
  await writeRatingState(state);
}

export async function markRatingPromptShown(): Promise<void> {
  const state = await getRatingState();
  state.lastShownDate = new Date().toISOString();
  await writeRatingState(state);
}

export async function markRated(): Promise<void> {
  const state = await getRatingState();
  state.rated = true;
  state.lastShownDate = new Date().toISOString();
  await writeRatingState(state);
}

export async function dismissRatingPrompt(): Promise<void> {
  const state = await getRatingState();
  state.dismissed = true;
  await writeRatingState(state);
}

export async function resetRatingState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(RATING_KEY);
  } catch (error) {
    console.error('Error resetting rating state:', error);
  }
}
