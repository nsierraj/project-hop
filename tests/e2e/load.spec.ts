import { expect, test } from '@playwright/test';

// Load budget on a throttled 4G connection (NFR-006): playable within 3 s on first visit and 1 s on
// repeat visits. Uses the Chrome DevTools protocol to throttle, so it runs in Chromium only.

test.setTimeout(120_000);

test('title screen is ready within the load budget on 4G', async ({ browser, browserName }, testInfo) => {
  test.skip(browserName !== 'chromium', 'Network throttling uses the Chrome DevTools protocol');

  const context = await browser.newContext({ serviceWorkers: 'allow' });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  // Slow 4G profile: 150 ms latency, 1.6 Mbps down, 750 Kbps up.
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });

  const firstStart = Date.now();
  await page.goto('/');
  await expect(page.getByRole('dialog').first()).toBeVisible();
  const firstMs = Date.now() - firstStart;

  // Wait for the service worker to take control, so the repeat visit is served from cache.
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 15_000 }).catch(() => {});
  await page.reload();
  await expect(page.getByRole('dialog').first()).toBeVisible();

  const repeatStart = Date.now();
  await page.reload();
  await expect(page.getByRole('dialog').first()).toBeVisible();
  const repeatMs = Date.now() - repeatStart;

  const line = `first visit ${firstMs} ms, repeat visit ${repeatMs} ms (budget 3000 / 1000 ms)`;
  console.log(line);
  testInfo.annotations.push({ type: 'load', description: line });

  await context.close();
  expect(firstMs).toBeLessThan(3000);
  expect(repeatMs).toBeLessThan(1000);
});
