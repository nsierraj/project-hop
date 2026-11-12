import { renderMenu } from './focus';

/** Short celebration between levels. It closes on its own when the game moves to the next level. */
export function showLevelClear(root: HTMLElement, level: number): void {
  renderMenu(root, {
    title: `Level ${level} cleared!`,
    body: 'All five bays are filled. The next level is faster.',
    items: [],
  });
}
