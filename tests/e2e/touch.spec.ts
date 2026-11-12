import { expect, test, type Page } from '@playwright/test';

// Phone project only. Covers the mobile controls and gesture blocking (FR-031, FR-032, FR-036).
// The debug seed makes the run repeatable. The bank row is safe, so the frog can be moved there
// without a death.

type HopState = { row: number; col: number; mode: string };

async function hopState(page: Page): Promise<HopState> {
  return page.evaluate(() => (window as unknown as { __hop: () => HopState }).__hop());
}

/** Dispatches a pointer swipe or tap on the canvas, the way a finger would. */
async function gesture(page: Page, dx: number, dy: number): Promise<void> {
  await page.evaluate(
    ([dx, dy]) => {
      const canvas = document.getElementById('game') as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height * 0.9;
      const init = { bubbles: true, pointerId: 1, pointerType: 'touch' } as const;
      canvas.dispatchEvent(new PointerEvent('pointerdown', { ...init, clientX: x, clientY: y }));
      canvas.dispatchEvent(new PointerEvent('pointerup', { ...init, clientX: x + dx, clientY: y + dy }));
    },
    [dx, dy],
  );
}

async function startGame(page: Page): Promise<void> {
  await page.goto('/?debug&seed=1');
  await expect(page.getByRole('dialog').first()).toBeVisible();
  if (await page.getByRole('dialog', { name: 'How to play' }).isVisible()) {
    await page.getByRole('button', { name: 'Got it' }).tap();
  }
  await page.getByRole('button', { name: 'Start game' }).tap();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}

test.describe('phone touch controls', () => {
  test.skip(({ isMobile }) => !isMobile, 'Phone project only');

  test('starts with one tap and does not scroll or zoom during play', async ({ page }) => {
    await startGame(page);
    const scroll = await page.evaluate(() => ({
      y: window.scrollY,
      overflow: getComputedStyle(document.body).overflow,
      touchAction: getComputedStyle(document.body).touchAction,
    }));
    expect(scroll.y).toBe(0);
    expect(scroll.overflow).toBe('hidden');
    expect(scroll.touchAction).toBe('none');
  });

  test('a swipe hops sideways and a tap hops forward', async ({ page }) => {
    await startGame(page);
    const start = await hopState(page);
    expect(start.row).toBe(12);
    expect(start.col).toBe(6);

    await gesture(page, 60, 0);
    await expect.poll(async () => (await hopState(page)).col).toBe(7);

    await gesture(page, -60, 0);
    await expect.poll(async () => (await hopState(page)).col).toBe(6);

    await gesture(page, 0, 0);
    await expect.poll(async () => (await hopState(page)).row).toBe(11);
  });

  test('a swipe upward hops forward', async ({ page }) => {
    await startGame(page);
    await gesture(page, 0, -60);
    await expect.poll(async () => (await hopState(page)).row).toBe(11);
  });

  test('leaving the page pauses the game', async ({ page }) => {
    await startGame(page);
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await expect(page.getByRole('dialog', { name: 'Paused' })).toBeVisible();
  });
});
