import type { Settings } from '../storage/settings';
import { renderMenu } from './focus';

export interface SettingsHandlers {
  /** Receives only the changed fields, so rapid changes never overwrite each other. */
  onChange: (patch: Partial<Settings>) => void;
  onResetScores: () => void;
  onBack: () => void;
}

/** Settings screen. Speed assist only takes effect at the start of the next game (FR-050). */
export function showSettings(root: HTMLElement, settings: Settings, handlers: SettingsHandlers): void {
  const panel = renderMenu(root, {
    title: 'Settings',
    items: [],
  });
  const list = panel.querySelector('.menu') as HTMLElement;
  list.replaceChildren();

  const update = (patch: Partial<Settings>) => handlers.onChange(patch);

  list.append(
    rangeRow('Music volume', settings.musicVolume, (v) => update({ musicVolume: v })),
    rangeRow('Effects volume', settings.effectsVolume, (v) => update({ effectsVolume: v })),
    checkRow('Mute all', settings.muted, (v) => update({ muted: v })),
    checkRow('Speed assist (next game)', settings.speedAssist, (v) => update({ speedAssist: v })),
    checkRow('Haptics', settings.haptics, (v) => update({ haptics: v })),
    button('Reset high scores', () => handlers.onResetScores()),
    button('Back', handlers.onBack),
  );
}

function rangeRow(label: string, value: number, onInput: (v: number) => void): HTMLElement {
  const row = document.createElement('label');
  row.className = 'row';
  row.textContent = label;
  const input = document.createElement('input');
  input.type = 'range';
  input.min = '0';
  input.max = '1';
  input.step = '0.05';
  input.value = String(value);
  input.dataset.focusable = '';
  input.addEventListener('input', () => onInput(Number(input.value)));
  row.append(input);
  return row;
}

function checkRow(label: string, checked: boolean, onChange: (v: boolean) => void): HTMLElement {
  const row = document.createElement('label');
  row.className = 'row';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = checked;
  input.dataset.focusable = '';
  input.addEventListener('change', () => onChange(input.checked));
  row.append(input, ` ${label}`);
  return row;
}

function button(label: string, onClick: () => void): HTMLElement {
  const el = document.createElement('button');
  el.type = 'button';
  el.textContent = label;
  el.dataset.focusable = '';
  el.addEventListener('click', onClick);
  return el;
}
