/** A one-time banner, for example when browser storage is blocked (FR-042) or an update is ready. */
export function showNotice(
  root: HTMLElement,
  text: string,
  action?: { label: string; onClick: () => void },
): void {
  const banner = document.createElement('div');
  banner.className = 'notice';
  banner.setAttribute('role', 'status');
  banner.textContent = text;
  if (action) {
    const act = document.createElement('button');
    act.type = 'button';
    act.textContent = action.label;
    act.dataset.focusable = '';
    act.addEventListener('click', () => {
      banner.remove();
      action.onClick();
    });
    banner.append(act);
  }
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = 'OK';
  close.dataset.focusable = '';
  close.addEventListener('click', () => banner.remove());
  banner.append(close);
  root.append(banner);
}
