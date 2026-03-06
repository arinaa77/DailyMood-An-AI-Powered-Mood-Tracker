// Mood scale: 1 = Awful, 2 = Bad, 3 = Okay, 4 = Good, 5 = Great
// Single source of truth. Never hardcode emoji or labels in components.

const EMOJI_MAP: Record<number, string> = {
  1: '😢',
  2: '😞',
  3: '😐',
  4: '🙂',
  5: '😄',
};

const LABEL_MAP: Record<number, string> = {
  1: 'Awful',
  2: 'Bad',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

export function emojiFromScore(score: number): string {
  return EMOJI_MAP[score] ?? '❓';
}

export function labelFromScore(score: number): string {
  return LABEL_MAP[score] ?? 'Unknown';
}

/** Returns the bar-chart hex color for a given mood score. */
export function colorFromScore(score: number): string {
  if (score >= 4) return '#22c55e'; // green  (Good / Great)
  if (score === 3) return '#eab308'; // yellow (Okay)
  return '#ef4444';                  // red    (Bad / Awful)
}
