const { test, expect } = require('@playwright/test');

// MISSION 2 — Add a Playwright test that first FAILS because of BUG-101.
// Behavior required: enabling "Available bikes only" hides Riverside Park (0 bikes)
// and shows exactly three station cards. Fix public/app.js only AFTER the test fails.

test('BUG-101: available-only filter excludes zero-bike stations', async ({ page }) => {
  await page.goto('/');

  // Initially, all four stations should be visible.
  const stationCards = page.getByTestId('station-card');
  await expect(stationCards).toHaveCount(4);

  // Enable the availability filter.
  await page.getByRole('checkbox', { name: 'Available bikes only' }).check();

  // Only three stations should remain.
  await expect(stationCards).toHaveCount(3);

  // Riverside Park should no longer be visible.
  await expect(page.getByRole('heading', { name: 'Riverside Park' })).toHaveCount(0);
});
