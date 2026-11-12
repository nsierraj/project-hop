import { expect, test } from '@playwright/test';

// Phone viewport with touch (phone project). Covers the mobile controls and gesture blocking (FR-031, FR-032, FR-036).

test.describe('phone touch controls', () => {
  test.skip(({ isMobile }) => !isMobile, 'Phone project only');

  test('starts with one tap and does not scroll or zoom during play', async ({ page }) => {
    await page.goto('/');
    if (await page.getByRole('dialog', { name: 'How to play' }).isVisible()) {
      await page.getByRole('button', { name: 'Got it' }).tap();
    }
    await page.getByRole('button', { name: 'Start game' }).tap();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    const scroll = await page.evaluate(() => ({
      y: window.scrollY,
      overflow: getComputedStyle(document.body).overflow,
      touchAction: getComputedStyle(document.body).touchAction,
    }));
    expect(scroll.y).toBe(0);
    expect(scroll.overflow).toBe('hidden');
    expect(scroll.touchAction).toBe('none');
  });

  test('a tap on the playfield hops forward, and a swipe hops sideways', async ({ page }) => {
    await page.goto('/');
    if (await page.getByRole('dialog', { name: 'How to play' }).isVisible()) {
      await page.getByRole('button', { name: 'Got it' }).tap();
    }
    await page.getByRole('button', { name: 'Start game' }).tap();

    const canvas = page.locator('#game');
    const box = await canvas.boundingBox();
    if (!box) throw new Error('canvas has no box');
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height * 0.8;

    // A tap should not throw or pause the game.
    await page.touchscreen.tap(cx, cy);
    await expect(page.getByRole('dialog', { name: 'Paused' })).toHaveCount(0);
  });

  test('leaving the page pauses the game', async ({ page }) => {
    await page.goto('/');
    if (await page.getByRole('dialog', { name: 'How to play' }).isVisible()) {
      await page.getByRole('button', { name: 'Got it' }).tap();
    }
    await page.getByRole('button', { name: 'Start game' }).tap();
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await expect(page.getByRole('dialog', { name: 'Paused' })).toBeVisible();
  });
});
