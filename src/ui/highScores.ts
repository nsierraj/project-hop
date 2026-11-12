import type { ScoreEntry } from '../storage/highscores';
import { renderMenu } from './focus';

/** Top-10 table. Assisted scores show a marker (FR-040). */
export function showHighScores(root: HTMLElement, entries: ScoreEntry[], onBack: () => void): void {
  const panel = renderMenu(root, {
    title: 'High scores',
    items: [{ label: 'Back', onSelect: onBack }],
  });

  const table = document.createElement('table');
  table.className = 'scores';
  table.innerHTML = '<thead><tr><th>#</th><th>Initials</th><th>Score</th><th>Level</th><th>Date</th></tr></thead>';
  const body = document.createElement('tbody');
  if (entries.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="5">No scores yet</td>';
    body.append(row);
  }
  entries.forEach((entry, i) => {
    const row = document.createElement('tr');
    const marker = entry.assisted ? ' *' : '';
    const cells = [String(i + 1), entry.initials + marker, String(entry.score), String(entry.levelReached), entry.date];
    for (const text of cells) {
      const td = document.createElement('td');
      td.textContent = text;
      row.append(td);
    }
    body.append(row);
  });
  table.append(body);

  const note = document.createElement('p');
  note.textContent = entries.some((e) => e.assisted) ? '* Set with speed assist' : '';
  panel.insertBefore(table, panel.querySelector('.menu'));
  panel.insertBefore(note, panel.querySelector('.menu'));
}
