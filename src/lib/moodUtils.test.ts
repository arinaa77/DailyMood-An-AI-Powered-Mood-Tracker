import { describe, it, expect } from 'vitest';
import { emojiFromScore, labelFromScore, colorFromScore } from '@/lib/moodUtils';

describe('emojiFromScore', () => {
  it.each([
    [5, '😄'],
    [4, '🙂'],
    [3, '😐'],
    [2, '😞'],
    [1, '😢'],
  ])('returns %s for score %i', (score, emoji) => {
    expect(emojiFromScore(score)).toBe(emoji);
  });

  it('returns ❓ for an unknown score', () => {
    expect(emojiFromScore(0)).toBe('❓');
    expect(emojiFromScore(99)).toBe('❓');
  });
});

describe('labelFromScore', () => {
  it.each([
    [5, 'Great'],
    [4, 'Good'],
    [3, 'Okay'],
    [2, 'Bad'],
    [1, 'Awful'],
  ])('returns %s for score %i', (score, label) => {
    expect(labelFromScore(score)).toBe(label);
  });

  it('returns "Unknown" for an unrecognised score', () => {
    expect(labelFromScore(0)).toBe('Unknown');
    expect(labelFromScore(6)).toBe('Unknown');
  });
});

describe('colorFromScore', () => {
  it('returns green (#22c55e) for score 5', () => {
    expect(colorFromScore(5)).toBe('#22c55e');
  });

  it('returns green (#22c55e) for score 4', () => {
    expect(colorFromScore(4)).toBe('#22c55e');
  });

  it('returns yellow (#eab308) for score 3', () => {
    expect(colorFromScore(3)).toBe('#eab308');
  });

  it('returns red (#ef4444) for score 2', () => {
    expect(colorFromScore(2)).toBe('#ef4444');
  });

  it('returns red (#ef4444) for score 1', () => {
    expect(colorFromScore(1)).toBe('#ef4444');
  });

  it('returns red for any score below 3', () => {
    expect(colorFromScore(0)).toBe('#ef4444');
  });
});
