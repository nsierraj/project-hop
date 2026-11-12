import { renderMenu } from './focus';

export interface GameOverHandlers {
  onPlayAgain: () => void;
  onTitle: () => void;
}

export function showGameOver(root: HTMLElement, score: number, handlers: GameOverHandlers): void {
  renderMenu(root, {
    title: 'Game over',
    body: `Final score: ${score}`,
    items: [
      { label: 'Play again', onSelect: handlers.onPlayAgain },
      { label: 'Title', onSelect: handlers.onTitle },
    ],
  });
}
