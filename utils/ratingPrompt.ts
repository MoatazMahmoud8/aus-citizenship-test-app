import AsyncStorage from '@react-native-async-storage/async-storage';

const RATING_KEY = 'ace_rating_prompt';
const RATING_SHOW_AFTER_QUIZZES = 3; // Show after 3 passed quizzes
const RATING_MINDAYS_BETWEEN_PROMPTS = 7; // Show at most once every 7 days

export interface RatingState {
  passedQuizzesCount: number;
  lastShownDate: string | null;
  dismissed: boolean;
}

export async function getRatingState(): Promise<RatingState> {
  try {
    const data = await AsyncStorage.getItem(RATING_KEY);
    if (!data) {
      return {
        passedQuizzesCount: 0,
        lastShownDate: null,
        dismissed: false,
      };
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading rating state:', error);
    return {
      passedQuizzesCount: 0,
      lastShownDate: null,
      dismissed: false,
    };
  }
}

export async function shouldShowRatingPrompt(): Promise<boolean> {
  const state = await getRatingState();

  // Don't show if user dismissed it
  if (state.dismissed) {
    return false;
  }

  // Check if enough quizzes have been passed
  if (state.passedQuizzesCount < RATING_SHOW_AFTER_QUIZZES) {
    return false;
  }

  // Check if enough days have passed since last shown
  if (state.lastShownDate) {
    const lastShown = new Date(state.lastShownDate);
    const daysSinceShown = Math.floor(
      (Date.now() - lastShown.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceShown < RATING_MINDAYS_BETWEEN_PROMPTS) {
      return false;
    }
  }

  return true;
}

export async function incrementPassedQuizzes(): Promise<void> {
  try {
    const state = await getRatingState();
    state.passedQuizzesCount += 1;
    await AsyncStorage.setItem(RATING_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error incrementing passed quizzes:', error);
  }
}

export async function markRatingPromptShown(): Promise<void> {
  try {
    const state = await getRatingState();
    state.lastShownDate = new Date().toISOString();
    await AsyncStorage.setItem(RATING_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error marking rating prompt shown:', error);
  }
}

export async function dismissRatingPrompt(): Promise<void> {
  try {
    const state = await getRatingState();
    state.dismissed = true;
    await AsyncStorage.setItem(RATING_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error dismissing rating prompt:', error);
  }
}

export async function resetRatingState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(RATING_KEY);
  } catch (error) {
    console.error('Error resetting rating state:', error);
  }
}
