import { registerSW } from 'virtual:pwa-register';

/**
 * Registers the service worker. When a new version is waiting, onUpdateReady is called with an
 * accept function. The caller decides when to show the prompt, so it never appears during a game (FR-055).
 */
export function registerUpdates(onUpdateReady: (accept: () => void) => void): void {
  let pendingReload: (() => void) | null = null;
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      pendingReload = () => void updateSW(true);
      onUpdateReady(() => pendingReload?.());
    },
  });
}
