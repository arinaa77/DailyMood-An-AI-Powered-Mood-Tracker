import { test, expect, type Page } from '@playwright/test';

async function mockSignInSuccess(page: Page) {
  await page.route('**/auth/v1/token**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: { id: 'mock-user-id', email: 'test@example.com' },
      }),
    }),
  );
}

test.describe('Login page', () => {
  test('renders the login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'DailyMood' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  test('toggles to sign-up mode', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign up' }).click();
    await expect(page.getByText('Start your mood journey')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
  });

  test('shows an error for invalid credentials', async ({ page }) => {
    await page.route('**/auth/v1/token**', (route) =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'invalid_grant', error_description: 'Invalid login credentials' }),
      }),
    );

    await page.goto('/login');
    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('badpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByRole('alert').first()).toBeVisible();
  });

  test('disables the submit button while loading', async ({ page }) => {
    await mockSignInSuccess(page); // reuse helper, override below
    // Delay the response to observe the loading state
    await page.route('**/auth/v1/token**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access_token: 'tok', user: { id: 'uid' } }),
      });
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');

    const btn = page.getByRole('button', { name: 'Sign in' });
    await btn.click();

    // Button should be disabled immediately after click
    await expect(page.getByRole('button', { name: /Please wait/i })).toBeDisabled();
  });
});

test.describe('Auth redirect', () => {
  test('unauthenticated user is redirected to /login', async ({ page }) => {
    // Block session refresh so proxy sees no user
    await page.route('**/auth/v1/user', (route) =>
      route.fulfill({ status: 401, body: '{}' }),
    );
    await page.goto('/log');
    await expect(page).toHaveURL(/\/login/);
  });
});
