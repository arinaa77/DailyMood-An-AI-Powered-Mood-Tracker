'use client';

import { emojiFromScore, labelFromScore, colorFromScore } from '@/lib/moodUtils';
import type { MoodEntry } from '@/types';

interface MoodRingProps {
  entries: MoodEntry[];
}

const SCORES = [5, 4, 3, 2, 1] as const;
const R = 64;
const CX = 90;
const CY = 90;
const CIRCUMFERENCE = 2 * Math.PI * R;

export default function MoodRing({ entries }: MoodRingProps) {
  const total = entries.length;
  const avg = total > 0
    ? entries.reduce((s, e) => s + e.mood_score, 0) / total
    : null;

  // Build arc segments
  let dashOffset = 0;
  const segments = SCORES.map((score) => {
    const count = entries.filter((e) => e.mood_score === score).length;
    const fraction = total > 0 ? count / total : 0;
    const dash = fraction * CIRCUMFERENCE;
    const seg = { score, count, fraction, dash, offset: dashOffset };
    dashOffset += dash;
    return seg;
  }).filter((s) => s.fraction > 0);

  return (
    <div className="flex flex-col items-center gap-6">

      {/* Ring */}
      <div className="relative">
        <svg
          width={180}
          height={180}
          viewBox="0 0 180 180"
          aria-label={avg !== null ? `Average mood: ${avg.toFixed(1)}` : 'No mood data yet'}
        >
          {/* Track */}
          <circle
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={16}
          />

          {total === 0 ? (
            /* Empty state — dashed grey ring */
            <circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth={16}
              strokeDasharray="6 6"
              transform={`rotate(-90 ${CX} ${CY})`}
            />
          ) : (
            /* Coloured segments */
            segments.map((seg) => (
              <circle
                key={seg.score}
                cx={CX} cy={CY} r={R}
                fill="none"
                stroke={colorFromScore(seg.score)}
                strokeWidth={16}
                strokeLinecap="butt"
                strokeDasharray={`${seg.dash} ${CIRCUMFERENCE - seg.dash}`}
                strokeDashoffset={-seg.offset}
                transform={`rotate(-90 ${CX} ${CY})`}
              />
            ))
          )}

          {/* Center label */}
          {avg !== null ? (
            <>
              <text
                x={CX} y={CY - 8}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-gray-900"
                style={{ fontSize: 26, fontWeight: 700, fontFamily: 'inherit' }}
              >
                {avg.toFixed(1)}
              </text>
              <text
                x={CX} y={CY + 14}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-gray-400"
                style={{ fontSize: 11, fontFamily: 'inherit' }}
              >
                avg mood
              </text>
            </>
          ) : (
            <text
              x={CX} y={CY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-gray-300"
              style={{ fontSize: 11, fontFamily: 'inherit' }}
            >
              no data yet
            </text>
          )}
        </svg>
      </div>

      {/* Legend */}
      {total > 0 ? (
        <div className="w-full space-y-2">
          {SCORES.filter((score) =>
            entries.some((e) => e.mood_score === score),
          ).map((score) => {
            const count = entries.filter((e) => e.mood_score === score).length;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={score} className="flex items-center gap-2">
                <span className="text-base leading-none" aria-hidden="true">
                  {emojiFromScore(score)}
                </span>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: colorFromScore(score),
                    }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-8 text-right tabular-nums">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-gray-400 text-center">
          Your mood distribution will appear here<br />after your first entry.
        </p>
      )}

      {/* Total */}
      {total > 0 && (
        <p className="text-xs text-gray-400">
          Based on <span className="font-medium text-gray-600">{total}</span> {total === 1 ? 'entry' : 'entries'}
        </p>
      )}
    </div>
  );
}
