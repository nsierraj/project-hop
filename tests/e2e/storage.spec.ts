import { expect, test } from '@playwright/test';

// Blocked browser storage: the game still plays and says scores will not be saved (FR-042).

test('plays with storage blocked and shows the notice', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('SecurityError: storage blocked');
      },
    });
  });
  await page.goto('/?debug&seed=1');
  await expect(page.getByText('Scores will not be saved on this device.')).toBeVisible();
  await page.keyboard.press('Enter'); // dismiss the first-launch hint
  await page.keyboard.press('Enter'); // start the game
  await page.keyboard.press('ArrowUp');
  await expect.poll(async () =>
    page.evaluate(() => (window as unknown as { __hop: () => { row: number } }).__hop().row),
  ).toBe(11);
});
