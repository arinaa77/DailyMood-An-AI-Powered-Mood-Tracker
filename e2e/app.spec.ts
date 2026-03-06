import { test, expect, type Page } from '@playwright/test';

// ── Shared auth + data mocks ──────────────────────────────────────────────

async function mockAuthenticatedSession(page: Page) {
  // Mock session check (proxy / middleware)
  await page.route('**/auth/v1/user', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'mock-user-id', email: 'test@example.com' }),
    }),
  );

  // Mock token refresh
  await page.route('**/auth/v1/token**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        user: { id: 'mock-user-id', email: 'test@example.com' },
      }),
    }),
  );
}

const MOCK_ENTRIES = [
  {
    id: 'e1',
    user_id: 'mock-user-id',
    mood_score: 5,
    note: 'Great day!',
    created_at: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'e2',
    user_id: 'mock-user-id',
    mood_score: 3,
    note: 'Okay day.',
    created_at: '2026-03-02T10:00:00.000Z',
  },
  {
    id: 'e3',
    user_id: 'mock-user-id',
    mood_score: 4,
    note: 'Pretty good.',
    created_at: '2026-03-03T10:00:00.000Z',
  },
  {
    id: 'e4',
    user_id: 'mock-user-id',
    mood_score: 2,
    note: 'Rough day.',
    created_at: '2026-03-04T10:00:00.000Z',
  },
  {
    id: 'e5',
    user_id: 'mock-user-id',
    mood_score: 4,
    note: 'Good vibes.',
    created_at: '2026-03-05T10:00:00.000Z',
  },
];

async function mockEntriesApi(page: Page) {
  await page.route('**/rest/v1/mood_entries**', (route) => {
    const method = route.request().method();

    if (method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_ENTRIES),
      });
    }

    if (method === 'POST') {
      return route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify([{ ...MOCK_ENTRIES[0], id: 'new-entry' }]),
      });
    }

    if (method === 'PATCH') {
      return route.fulfill({ status: 200, body: '[]' });
    }

    if (method === 'DELETE') {
      return route.fulfill({ status: 200, body: '[]' });
    }

    return route.continue();
  });

  // Mock Realtime (WebSocket) — just let it fail silently
  await page.route('**/realtime/**', (route) => route.abort());
}

// ── Log page ──────────────────────────────────────────────────────────────

test.describe('Log page', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedSession(page);
    await mockEntriesApi(page);
  });

  test('renders the Daily Check-in card', async ({ page }) => {
    await page.goto('/log');
    await expect(page.getByRole('heading', { name: 'Daily Check-in' })).toBeVisible();
  });

  test('shows all 5 mood buttons', async ({ page }) => {
    await page.goto('/log');
    for (const label of ['Great', 'Good', 'Okay', 'Bad', 'Awful']) {
      await expect(
        page.getByRole('button', { name: `Select mood: ${label}` }),
      ).toBeVisible();
    }
  });

  test('Save Entry button is disabled until a mood is selected', async ({ page }) => {
    await page.goto('/log');
    await expect(page.getByRole('button', { name: 'Save Entry' })).toBeDisabled();
  });

  test('Save Entry button enables after selecting a mood', async ({ page }) => {
    await page.goto('/log');
    await page.getByRole('button', { name: 'Select mood: Great' }).click();
    await expect(page.getByRole('button', { name: 'Save Entry' })).toBeEnabled();
  });

  test('shows the feeling indicator after mood selection', async ({ page }) => {
    await page.goto('/log');
    await page.getByRole('button', { name: 'Select mood: Good' }).click();
    await expect(page.getByText(/You're feeling/i)).toBeVisible();
  });

  test('can type a note and see the character counter decrement', async ({ page }) => {
    await page.goto('/log');
    await page.getByLabel('Your note').fill('Hello world');
    await expect(page.getByText('489 remaining')).toBeVisible();
  });
});

// ── Navigation ────────────────────────────────────────────────────────────

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedSession(page);
    await mockEntriesApi(page);
  });

  test('nav bar is visible on the log page', async ({ page }) => {
    await page.goto('/log');
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  });

  test('can navigate to the Calendar page', async ({ page }) => {
    await page.goto('/log');
    await page.getByRole('link', { name: 'Calendar' }).first().click();
    await expect(page).toHaveURL('/calendar');
  });

  test('can navigate to the Insights page', async ({ page }) => {
    await page.goto('/log');
    await page.getByRole('link', { name: 'Insights' }).first().click();
    await expect(page).toHaveURL('/insights');
  });
});

// ── Calendar page ─────────────────────────────────────────────────────────

test.describe('Calendar page', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedSession(page);
    await mockEntriesApi(page);
  });

  test('renders the month navigation controls', async ({ page }) => {
    await page.goto('/calendar');
    await expect(page.getByRole('button', { name: 'Previous month' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next month' })).toBeVisible();
  });

  test('can navigate to the previous month', async ({ page }) => {
    await page.goto('/calendar');
    const heading = page.getByRole('heading').first();
    const currentMonth = await heading.textContent();
    await page.getByRole('button', { name: 'Previous month' }).click();
    const newMonth = await heading.textContent();
    expect(newMonth).not.toBe(currentMonth);
  });

  test('renders a calendar grid with day buttons', async ({ page }) => {
    await page.goto('/calendar');
    // The grid always has buttons for 1-28+ days of the month
    const dayButtons = page.getByRole('button', { name: /^\d{1,2}$/ });
    await expect(dayButtons.first()).toBeVisible();
  });
});

// ── Insights page ─────────────────────────────────────────────────────────

test.describe('Insights page', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedSession(page);
    await mockEntriesApi(page);
  });

  test('renders the Insights heading', async ({ page }) => {
    await page.goto('/insights');
    await expect(page.getByRole('heading', { name: 'Insights' })).toBeVisible();
  });

  test('renders time-range toggle buttons', async ({ page }) => {
    await page.goto('/insights');
    await expect(page.getByRole('button', { name: '7 days' })).toBeVisible();
    await expect(page.getByRole('button', { name: '30 days' })).toBeVisible();
    await expect(page.getByRole('button', { name: '90 days' })).toBeVisible();
  });

  test('time-range buttons are toggleable', async ({ page }) => {
    await page.goto('/insights');
    await page.getByRole('button', { name: '7 days' }).click();
    await expect(page.getByRole('button', { name: '7 days' })).toHaveAttribute(
      'aria-pressed', 'true',
    );
  });

  test('shows the AI Insights card placeholder', async ({ page }) => {
    await page.goto('/insights');
    await expect(page.getByText('AI Insights')).toBeVisible();
  });
});

// ── Mobile layout ─────────────────────────────────────────────────────────

test.describe('Mobile layout', () => {
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14

  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedSession(page);
    await mockEntriesApi(page);
  });

  test('bottom tab bar is visible on mobile', async ({ page }) => {
    await page.goto('/log');
    await expect(
      page.getByRole('navigation', { name: 'Mobile navigation' }),
    ).toBeVisible();
  });

  test('mobile tab bar has Log, Calendar and Insights links', async ({ page }) => {
    await page.goto('/log');
    const mobileNav = page.getByRole('navigation', { name: 'Mobile navigation' });
    await expect(mobileNav.getByRole('link', { name: /Log/i })).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: /Calendar/i })).toBeVisible();
    await expect(mobileNav.getByRole('link', { name: /Insights/i })).toBeVisible();
  });
});
