import { renderMenu } from './focus';

export interface TitleHandlers {
  onStart: () => void;
  onHighScores: () => void;
  onSettings: () => void;
  /** Present only when the browser can install the app now, or on iOS, where instructions are shown. */
  install?: { label: string; onSelect: () => void };
}

export function showTitle(root: HTMLElement, handlers: TitleHandlers): void {
  const items = [
    { label: 'Start game', onSelect: handlers.onStart },
    { label: 'High scores', onSelect: handlers.onHighScores },
    { label: 'Settings', onSelect: handlers.onSettings },
  ];
  if (handlers.install) items.push({ label: handlers.install.label, onSelect: handlers.install.onSelect });
  renderMenu(root, {
    title: 'Project Hop',
    body: 'Guide the frog across the road and river to all five home bays.',
    items,
  });
}
