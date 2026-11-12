import { expect, test } from '@playwright/test';

// Keyboard-only navigation of the title, pause, and settings screens (AC-9, FR-038).
// The full run to initials entry needs a deterministic death, so it is covered by the unit tests
// and the manual pass in quickstart.md.

test.describe('keyboard only', () => {
  test('starts a game, pauses, and resumes without a pointer', async ({ page }) => {
    await page.goto('/');
    // The first-launch hint appears before the title on a fresh profile. Dismiss it with the keyboard.
    await expect(page.getByRole('dialog').first()).toBeVisible();
    if (await page.getByRole('dialog', { name: 'How to play' }).isVisible()) {
      await page.keyboard.press('Enter');
    }
    await expect(page.getByRole('dialog', { name: 'Project Hop' })).toBeVisible();

    await expect(page.getByRole('button', { name: 'Start game' })).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(page.getByRole('dialog')).toHaveCount(0);

    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Escape');
    const pause = page.getByRole('dialog', { name: 'Paused' });
    await expect(pause).toBeVisible();
    await expect(page.getByRole('button', { name: 'Resume' })).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: 'Paused' })).toHaveCount(0);
  });

  test('moves focus between menu buttons with the arrow keys and shows a focus ring', async ({ page }) => {
    await page.goto('/');
    if (await page.getByRole('dialog', { name: 'How to play' }).isVisible()) {
      await page.keyboard.press('Enter');
    }
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('button', { name: 'High scores' })).toBeFocused();
    const outline = await page.getByRole('button', { name: 'High scores' }).evaluate(
      (el) => getComputedStyle(el).outlineStyle,
    );
    expect(outline).not.toBe('none');
  });

  test('opens settings and returns with Escape', async ({ page }) => {
    await page.goto('/');
    if (await page.getByRole('dialog', { name: 'How to play' }).isVisible()) {
      await page.keyboard.press('Enter');
    }
    await page.getByRole('button', { name: 'Settings' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'Project Hop' })).toBeVisible();
  });

  test('plays to game over, enters initials, and keeps the score after a reload', async ({ page }) => {
    // One life and a fixed seed: the frog dies quickly, so the run reaches game over.
    await page.goto('/?debug&lives=1&seed=7');
    await expect(page.getByRole('dialog').first()).toBeVisible();
    if (await page.getByRole('dialog', { name: 'How to play' }).isVisible()) {
      await page.keyboard.press('Enter');
    }
    await page.getByRole('button', { name: 'Start game' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toHaveCount(0);

    // A forward hop scores 10 points, so the run qualifies for the table.
    await page.keyboard.press('ArrowUp');

    const initials = page.getByRole('dialog', { name: 'New high score' });
    await expect(initials).toBeVisible({ timeout: 60_000 });
    const entry = page.getByRole('textbox', { name: 'Initials' });
    await expect(entry).toBeFocused();
    await page.keyboard.type('abc');
    await page.keyboard.press('Enter');

    await expect(page.getByRole('dialog', { name: 'High scores' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'ABC' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: 'Project Hop' })).toBeVisible();

    // The entry survives a reload (AC-6).
    await page.reload();
    await expect(page.getByRole('dialog').first()).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('button', { name: 'High scores' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('cell', { name: 'ABC' })).toBeVisible();
  });
});
