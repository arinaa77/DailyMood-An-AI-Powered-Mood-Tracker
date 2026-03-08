import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MoodBarChart, { CustomTooltip } from './MoodBarChart';
import type { DailyMoodSummary } from '@/types';

// Recharts uses SVG and ResizeObserver which aren't in jsdom — mock the whole library
vi.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar">{children}</div>
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => null,
  Cell: ({ fill }: { fill: string }) => <div data-testid="cell" data-fill={fill} />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

const SAMPLE_DATA: DailyMoodSummary[] = [
  { date: 'Mar 1', mood_score: 5 },
  { date: 'Mar 2', mood_score: 3 },
  { date: 'Mar 3', mood_score: 1 },
];

describe('MoodBarChart', () => {
  // ── Empty state ────────────────────────────────────────────────────────────
  it('shows empty state message when data is empty', () => {
    render(<MoodBarChart data={[]} />);
    expect(screen.getByText('No entries in this range.')).toBeInTheDocument();
  });

  it('does not show empty state when data is provided', () => {
    render(<MoodBarChart data={SAMPLE_DATA} />);
    expect(screen.queryByText('No entries in this range.')).not.toBeInTheDocument();
  });

  // ── Chart renders ──────────────────────────────────────────────────────────
  it('renders the chart container when data is provided', () => {
    render(<MoodBarChart data={SAMPLE_DATA} />);
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('renders a Cell per data point', () => {
    render(<MoodBarChart data={SAMPLE_DATA} />);
    const cells = screen.getAllByTestId('cell');
    expect(cells).toHaveLength(SAMPLE_DATA.length);
  });

  // ── Cell colours ───────────────────────────────────────────────────────────
  it('colors score 5 green (#22c55e)', () => {
    render(<MoodBarChart data={[{ date: 'Mar 1', mood_score: 5 }]} />);
    expect(screen.getByTestId('cell')).toHaveAttribute('data-fill', '#22c55e');
  });

  it('colors score 3 yellow (#eab308)', () => {
    render(<MoodBarChart data={[{ date: 'Mar 2', mood_score: 3 }]} />);
    expect(screen.getByTestId('cell')).toHaveAttribute('data-fill', '#eab308');
  });

  it('colors score 1 red (#ef4444)', () => {
    render(<MoodBarChart data={[{ date: 'Mar 3', mood_score: 1 }]} />);
    expect(screen.getByTestId('cell')).toHaveAttribute('data-fill', '#ef4444');
  });

  // ── Card header ────────────────────────────────────────────────────────────
  it('renders the Mood Trend heading', () => {
    render(<MoodBarChart data={SAMPLE_DATA} />);
    expect(screen.getByText('Mood Trend')).toBeInTheDocument();
  });

  it('shows the correct days logged count', () => {
    render(<MoodBarChart data={SAMPLE_DATA} />);
    expect(screen.getByText('3 days logged')).toBeInTheDocument();
  });

  it('renders the colour legend labels', () => {
    render(<MoodBarChart data={SAMPLE_DATA} />);
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('Okay')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });
});

// ── CustomTooltip ─────────────────────────────────────────────────────────────
describe('CustomTooltip', () => {
  it('renders nothing when active is false', () => {
    const { container } = render(
      <CustomTooltip active={false} payload={[{ value: 4 }]} label="Mar 1" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when payload is empty', () => {
    const { container } = render(
      <CustomTooltip active={true} payload={[]} label="Mar 1" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when payload is undefined', () => {
    const { container } = render(<CustomTooltip active={true} label="Mar 1" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the label and score when active with payload', () => {
    render(<CustomTooltip active={true} payload={[{ value: 4 }]} label="Mar 1" />);
    expect(screen.getByText('Mar 1')).toBeInTheDocument();
    expect(screen.getByText(/4\/5/)).toBeInTheDocument();
  });

  it('renders the mood label text', () => {
    render(<CustomTooltip active={true} payload={[{ value: 5 }]} label="Mar 2" />);
    expect(screen.getByText(/Great/)).toBeInTheDocument();
  });
});
