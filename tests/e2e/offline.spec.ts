import { expect, test } from '@playwright/test';

// After one online visit the game starts and plays with no network (AC-8, FR-054).

test('launches from the service worker cache with no network', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  // Wait until the service worker controls the page, so the reload below is served from cache.
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 15_000 }).catch(() => {});
  await page.reload();

  await context.setOffline(true);
  await page.reload();

  await expect(page.getByRole('dialog', { name: /Project Hop|How to play/ })).toBeVisible();
  await page.getByRole('button', { name: 'Got it' }).click().catch(() => {});
  await page.getByRole('button', { name: 'Start game' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(500);
  expect(await page.locator('#game').isVisible()).toBe(true);
  await context.setOffline(false);
});
