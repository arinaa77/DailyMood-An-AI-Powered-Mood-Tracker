// Shared types for DailyMood

export interface MoodEntry {
  id: string;
  user_id: string;
  mood_score: number; // 1–5
  note: string;
  created_at: string; // ISO timestamp
}

export interface DailyMoodSummary {
  date: string;       // "YYYY-MM-DD"
  mood_score: number;
}

export interface InsightsResult {
  content: string | null;
  generated_at: string | null;
}
