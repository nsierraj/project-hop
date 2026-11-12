/**
 * Short vibration on death and bay arrival. Only where the browser supports the Vibration API (FR-033).
 * iOS does not, so this is a no-op there.
 */
export function pulse(enabled: boolean, durationMs: number): void {
  if (!enabled) return;
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  navigator.vibrate(durationMs);
}
