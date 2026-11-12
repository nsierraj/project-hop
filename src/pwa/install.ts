/**
 * Install support (FR-056). Chrome and Edge fire beforeinstallprompt, which we keep until the player
 * asks to install. iOS Safari has no prompt, so it gets written instructions instead.
 */

interface InstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: InstallPromptEvent | null = null;

export function captureInstallPrompt(onAvailable: () => void): void {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferred = event as InstallPromptEvent;
    onAvailable();
  });
}

export function canPromptInstall(): boolean {
  return deferred !== null;
}

export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  const choice = await deferred.prompt();
  deferred = null;
  return choice.outcome === 'accepted';
}

export function isIosSafari(): boolean {
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
}

export const IOS_INSTALL_TEXT = 'To install, tap Share, then Add to Home Screen.';
