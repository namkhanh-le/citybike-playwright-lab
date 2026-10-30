const { test, expect } = require('@playwright/test');

// MISSION 3 — Add two realistic tests:
// (a) invalid email gives visible error without a POST to /api/reservations
// (b) a successful reservation; intercept/mock POST /api/reservations and assert
//     the JSON request payload and success message.

test('invalid email blocks reservation', async ({ page }) => {
  await page.goto('/');

  // Select a station with available bikes.
  await page.getByRole('button', { name: 'Reserve at Central Square' }).click();

  // Monitor reservation requests.
  let postRequests = 0;

  page.on('request', request => {
    if (
      request.url().includes('/api/reservations') &&
      request.method() === 'POST'
    ) {
      postRequests++;
    }
  });

  // Submit an invalid email.
  await page.getByLabel('Email').fill('not-an-email');
  await page.getByRole('button', { name: 'Confirm reservation' }).click();

  // An error should appear and no POST should be sent.
  await expect(page.locator('#email-error')).toBeVisible();
  expect(postRequests).toBe(0);
});

test('reservation sends correct payload and confirms booking', async ({ page }) => {
  await page.goto('/');

  // Select a station.
  await page.getByRole('button', { name: 'Reserve at Central Square' }).click();

  // Intercept and mock the reservation API.
  let requestPayload;

  await page.route('**/api/reservations', async route => {
    requestPayload = route.request().postDataJSON();

    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        reservationId: 'CB-DEMO-777'
      })
    });
  });

  // Submit a valid reservation.
  await page.getByLabel('Email').fill('student@example.com');
  await page.getByRole('button', { name: 'Confirm reservation' }).click();

  // Verify the API payload.
  await expect.poll(() => requestPayload).toEqual({
    stationId: 'central',
    email: 'student@example.com'
  });

  // Verify the confirmation message.
  await expect(page.locator('#result'))
    .toContainText('CB-DEMO-777');
});