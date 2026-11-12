/**
 * Original colour palette. Every hazard also differs by shape and outline, not hue alone (FR-049).
 * Text pairs are listed here so scripts/check-contrast.ts can verify WCAG AA contrast (FR-052).
 */
export const palette = {
  water: '#1565c0',
  waterWave: '#90caf9',
  road: '#37474f',
  laneLine: '#78909c',
  median: '#558b2f',
  bank: '#6d4c41',
  homeRow: '#2e7d32',
  wall: '#3e2723',
  bayEmpty: '#fdd835',
  bayFilled: '#f57f17',
  frog: '#aed581',
  frogOutline: '#000000',
  log: '#8d6e63',
  logRing: '#4e342e',
  turtle: '#00695c',
  turtleSubmerged: '#004d40',
  vehicle: '#c62828',
  vehicleStripe: '#ffffff',
  border: '#0d260f',
  hudBg: '#101010',
  hudText: '#ffffff',
  hudMuted: '#cfd8dc',
  timerOk: '#66bb6a',
  timerWarn: '#ffca28',
  focus: '#ffeb3b',
  menuBg: '#1b1b1b',
  button: '#ffd54f',
  buttonText: '#111111',
} as const;

export type PaletteKey = keyof typeof palette;

/** Foreground and background pairs for every piece of UI text. Checked by scripts/check-contrast.ts. */
export const textPairs: { name: string; fg: string; bg: string }[] = [
  { name: 'HUD text on HUD background', fg: palette.hudText, bg: palette.hudBg },
  { name: 'HUD muted text on HUD background', fg: palette.hudMuted, bg: palette.hudBg },
  { name: 'Menu text on menu background', fg: palette.hudText, bg: palette.menuBg },
  { name: 'Button text on button', fg: palette.buttonText, bg: palette.button },
];
