/**
 * Shared menu rendering and keyboard focus movement (FR-038). Every control is a native button or
 * input, so Tab, Enter, and Space work without extra code. Arrow keys move between buttons.
 */

export interface MenuItem {
  label: string;
  onSelect: () => void;
}

export interface MenuOptions {
  title: string;
  body?: string;
  items: MenuItem[];
}

export function renderMenu(root: HTMLElement, options: MenuOptions): HTMLElement {
  const panel = document.createElement('section');
  panel.className = 'panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', options.title);

  const heading = document.createElement('h2');
  heading.textContent = options.title;
  panel.append(heading);

  if (options.body) {
    const body = document.createElement('p');
    body.textContent = options.body;
    panel.append(body);
  }

  const list = document.createElement('div');
  list.className = 'menu';
  for (const item of options.items) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = item.label;
    button.dataset.focusable = '';
    button.addEventListener('click', item.onSelect);
    list.append(button);
  }
  panel.append(list);

  root.replaceChildren(panel);
  list.querySelector<HTMLButtonElement>('button')?.focus();
  return panel;
}

/** Moves focus between focusable controls inside root. Returns true if the key was handled. */
export function moveFocus(root: HTMLElement, key: string): boolean {
  const controls = Array.from(root.querySelectorAll<HTMLElement>('[data-focusable]'));
  if (controls.length === 0) return false;
  const current = controls.indexOf(document.activeElement as HTMLElement);
  const step = key === 'ArrowDown' || key === 'ArrowRight' ? 1 : key === 'ArrowUp' || key === 'ArrowLeft' ? -1 : 0;
  if (step === 0) return false;
  const next = current < 0 ? 0 : (current + step + controls.length) % controls.length;
  controls[next].focus();
  return true;
}
