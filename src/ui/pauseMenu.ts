import { renderMenu } from './focus';

export interface PauseHandlers {
  onResume: () => void;
  onHint: () => void;
  onTitle: () => void;
}

export function showPause(root: HTMLElement, handlers: PauseHandlers): void {
  renderMenu(root, {
    title: 'Paused',
    items: [
      { label: 'Resume', onSelect: handlers.onResume },
      { label: 'Control hint', onSelect: handlers.onHint },
      { label: 'Quit to title', onSelect: handlers.onTitle },
    ],
  });
}
