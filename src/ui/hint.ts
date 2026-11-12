import { renderMenu } from './focus';

export const HINT_KEY = 'hop.hintSeen.v1';

export function hintText(touch: boolean): string {
  return touch
    ? 'Swipe to hop in any direction. Tap to hop forward.'
    : 'Arrow keys or WASD to hop. P or Esc to pause.';
}

/** One-screen control hint for the current device type (FR-034). */
export function showHint(root: HTMLElement, touch: boolean, onClose: () => void): void {
  renderMenu(root, {
    title: 'How to play',
    body: hintText(touch),
    items: [{ label: 'Got it', onSelect: onClose }],
  });
}
