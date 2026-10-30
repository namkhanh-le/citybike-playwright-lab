const { test, expect } = require('@playwright/test');

test('station API outage shows an error and retry restores results', async ({ page }) => {
  let requestCount = 0;

  // Intercept requests to the stations API.
  await page.route('**/api/stations', async route => {
    requestCount++;

    if (requestCount === 1) {
      // Simulate the first request failing with HTTP 503.
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Service unavailable' })
      });
    } else {
      // Allow subsequent requests to reach the real server.
      await route.continue();
    }
  });

  await page.goto('/');

  // Confirm the error message appears.
  await expect(page.getByText('Unable to load stations.')).toBeVisible();

  // Click the retry button.
  await page.getByRole('button', { name: 'Retry loading' }).click();

  // Confirm the real server response restores all four stations.
  await expect(page.getByTestId('station-card')).toHaveCount(4);

  // Confirm the error message disappears.
  await expect(page.getByText('Unable to load stations.')).toBeHidden();

  // Confirm that both requests happened.
  expect(requestCount).toBe(2);
});