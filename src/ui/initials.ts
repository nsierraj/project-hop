import { renderMenu } from './focus';

export interface InitialsHandlers {
  onSubmit: (initials: string) => void;
}

/** Three-letter initials entry, A to Z only (FR-024). Works with keyboard and touch. */
export function showInitials(root: HTMLElement, score: number, handlers: InitialsHandlers): void {
  const panel = renderMenu(root, {
    title: 'New high score',
    body: `You scored ${score}. Enter your three-letter initials.`,
    items: [],
  });
  const list = panel.querySelector('.menu') as HTMLElement;
  list.replaceChildren();

  const input = document.createElement('input');
  input.type = 'text';
  input.maxLength = 3;
  input.pattern = '[A-Za-z]{3}';
  input.autocomplete = 'off';
  input.autocapitalize = 'characters';
  input.setAttribute('aria-label', 'Initials');
  input.className = 'initials';
  input.dataset.focusable = '';
  input.addEventListener('input', () => {
    input.value = input.value.replace(/[^A-Za-z]/g, '').toUpperCase();
  });

  const submit = document.createElement('button');
  submit.type = 'button';
  submit.textContent = 'Save';
  submit.dataset.focusable = '';

  const confirm = () => {
    if (/^[A-Z]{3}$/.test(input.value)) handlers.onSubmit(input.value);
    else input.setCustomValidity('Enter three letters');
    input.reportValidity();
  };
  submit.addEventListener('click', confirm);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      confirm();
    }
  });
  input.addEventListener('input', () => input.setCustomValidity(''));

  list.append(input, submit);
  input.focus();
}
