import { expect, test } from '@playwright/test';

// Frame-rate check from research R2, run in a real browser at level 12 for 60 seconds (AC-7).
// This is a proxy for the reference device. It runs in headless browsers and emulated phones, not
// on the iPhone SE hardware, so the device check in quickstart.md still applies.

test.setTimeout(150_000);

test('holds about 60 fps at level 12 for 60 seconds', async ({ page }, testInfo) => {
  await page.goto('/?debug&level=12');
  await expect(page.getByRole('dialog').first()).toBeVisible();
  if (await page.getByRole('dialog', { name: 'How to play' }).isVisible()) {
    await page.keyboard.press('Enter');
  }
  await page.getByRole('button', { name: 'Start game' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.evaluate(() => {
    const w = window as unknown as { __frames: number[]; __start: number };
    w.__frames = [];
    const sample = (t: number) => {
      w.__frames.push(t);
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });

  await page.waitForTimeout(60_000);

  const stats = await page.evaluate(() => {
    const frames = (window as unknown as { __frames: number[] }).__frames;
    const deltas = frames.slice(1).map((t, i) => t - frames[i]);
    const avgMs = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    const dropped = deltas.filter((d) => d > 1000 / 60 + 2).length;
    return { frames: deltas.length, avgMs, fps: 1000 / avgMs, droppedPct: (100 * dropped) / deltas.length };
  });

  const line = `${testInfo.project.name}: ${stats.fps.toFixed(1)} fps, ${stats.droppedPct.toFixed(1)}% dropped over ${stats.frames} frames`;
  console.log(line);
  testInfo.annotations.push({ type: 'frame-rate', description: line });

  expect(stats.fps).toBeGreaterThanOrEqual(55);
});
