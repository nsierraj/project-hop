/**
 * Shown when a phone is held in landscape. Play is portrait-only (FR-048). The game pauses while this is up.
 */
export function isLandscapePhone(): boolean {
  return window.matchMedia('(orientation: landscape) and (max-height: 500px)').matches;
}

export function setRotateScreen(root: HTMLElement, visible: boolean): void {
  let el = root.querySelector<HTMLElement>('.rotate');
  if (!visible) {
    el?.remove();
    return;
  }
  if (el) return;
  el = document.createElement('div');
  el.className = 'rotate';
  el.setAttribute('role', 'alert');
  el.textContent = 'Rotate your device to portrait to keep playing.';
  root.append(el);
}
