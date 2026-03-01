export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function getGradeEmoji(percent: number): string {
  if (percent >= 90) return '🌟';
  if (percent >= 75) return '✅';
  if (percent >= 60) return '📈';
  return '📚';
}

export function getGradeText(percent: number): string {
  if (percent >= 90) return 'Excellent!';
  if (percent >= 75) return 'Passed!';
  if (percent >= 60) return 'Almost There!';
  return 'Keep Studying';
}

export function getMotivationalMessage(percent: number): string {
  if (percent >= 95) return 'Outstanding! You\'re extremely well prepared for the test!';
  if (percent >= 90) return 'Excellent work! You\'re ready for the citizenship test!';
  if (percent >= 75) return 'Well done! You passed. Keep practising to improve further.';
  if (percent >= 60) return 'Almost there! Review the areas you got wrong and try again.';
  if (percent >= 40) return 'Good effort! Spend more time studying the materials and you\'ll get there.';
  return 'Don\'t give up! Read through the study guide carefully and try again.';
}

export function generateQuizId(): string {
  return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    australian_values: 'Australian Values',
    australia_and_its_people: 'Australia & Its People',
    democratic_beliefs: 'Democratic Beliefs',
    government_and_law: 'Government & Law',
    all: 'Full Practice Test',
  };
  return labels[category] || category;
}
