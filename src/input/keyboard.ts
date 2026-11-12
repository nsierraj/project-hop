import type { Action } from '../core/game';

const KEY_ACTIONS: Record<string, Action> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
  W: 'up',
  S: 'down',
  A: 'left',
  D: 'right',
  p: 'pause',
  P: 'pause',
  Escape: 'pause',
  Enter: 'confirm',
  ' ': 'confirm',
};

export function actionForKey(key: string): Action | null {
  return KEY_ACTIONS[key] ?? null;
}

/**
 * Sends key presses as actions. Key repeat is ignored so holding a key does not run hops (FR-6).
 * The caller decides whether to prevent the default action, so menu buttons still respond to Enter and Space.
 */
export function bindKeyboard(target: Window, onAction: (action: Action, event: KeyboardEvent) => void): void {
  target.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const action = actionForKey(event.key);
    if (!action) return;
    onAction(action, event);
  });
}
