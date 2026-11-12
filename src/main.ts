import './style.css';
import { loadConfig } from './config/loader';
import { FixedClock } from './core/clock';
import { Game, type Action, type Mode } from './core/game';
import { SoundBoard } from './audio/audio';
import { pulse } from './audio/haptics';
import { Music } from './audio/music';
import { createCanvasView } from './render/canvas';
import { createDebugOverlay } from './render/debugOverlay';
import { drawHud } from './render/hud';
import { palette } from './render/palette';
import { drawPlayfield } from './render/playfield';
import { bindKeyboard } from './input/keyboard';
import { bindTouch } from './input/touch';
import { captureInstallPrompt, canPromptInstall, IOS_INSTALL_TEXT, isIosSafari, promptInstall } from './pwa/install';
import { registerUpdates } from './pwa/update';
import { HINT_KEY, showHint } from './ui/hint';
import { moveFocus } from './ui/focus';
import { showGameOver } from './ui/gameOver';
import { showHighScores } from './ui/highScores';
import { showInitials } from './ui/initials';
import { showLevelClear } from './ui/levelClear';
import { showNotice } from './ui/notice';
import { isLandscapePhone, setRotateScreen } from './ui/rotate';
import { showPause } from './ui/pauseMenu';
import { showSettings } from './ui/settings';
import { showTitle } from './ui/title';
import { createStore } from './storage/store';
import {
  insertScore,
  loadHighScores,
  qualifies,
  saveHighScores,
  type ScoreEntry,
} from './storage/highscores';
import { loadSettings, saveSettings, type Settings } from './storage/settings';

/** Screens shown on top of the playfield. 'none' means the playfield is in control. */
type Screen =
  | 'none'
  | 'title'
  | 'pause'
  | 'settings'
  | 'highScores'
  | 'initials'
  | 'gameOver'
  | 'levelClear'
  | 'hint';

/** Rows above the playfield used for the HUD. Must match the drawing in src/render/hud.ts. */
const HUD_ROWS = 2;

const cfg = loadConfig();
const store = createStore();
let settings: Settings = loadSettings(store);
let highScores: ScoreEntry[] = loadHighScores(store, cfg.game.highScores.maxEntries);

const canvas = document.getElementById('game') as HTMLCanvasElement;
const ui = document.getElementById('ui') as HTMLElement;
const view = createCanvasView(canvas, cfg.layout.grid.columns, cfg.layout.grid.rows, HUD_ROWS);
const game = new Game(cfg, Math.floor(Math.random() * 0xffffffff));
const board = new SoundBoard();
const music = new Music(() => board.context());
const debug = createDebugOverlay();
const touchDevice = window.matchMedia('(pointer: coarse)').matches;
const clock = new FixedClock();

let screen: Screen = 'none';
let hintReturnsTo: Screen = 'title';
let pending: Action[] = [];
let lastFrame = performance.now();
let updateAccept: (() => void) | null = null;
let updateNoticeShown = false;
let storageNoticeShown = false;

applySettings();

// ---- input ----

function unlockAudio(): void {
  board.unlock();
  board.configure(settings);
  if (game.mode === 'title' || game.mode === 'playing') {
    music.start(settings.musicVolume, settings.muted);
  }
}

window.addEventListener('pointerdown', unlockAudio);
window.addEventListener('keydown', unlockAudio);

bindKeyboard(window, (action, event) => {
  if (screen !== 'none') {
    if (event.key.startsWith('Arrow')) {
      if (moveFocus(ui, event.key)) event.preventDefault();
      return;
    }
    if (action === 'pause' && screen === 'pause') {
      event.preventDefault();
      pending.push('pause');
    }
    if (action === 'pause' && (screen === 'settings' || screen === 'highScores' || screen === 'hint')) {
      event.preventDefault();
      setScreen(screen === 'hint' ? hintReturnsTo : 'title');
    }
    return;
  }
  // Game keys. Prevent default so arrows and space do not scroll the page.
  event.preventDefault();
  pending.push(action);
});

bindTouch(canvas, cfg.game, (action) => {
  if (screen === 'none') pending.push(action);
});

// Stop the game when the player leaves the page (FR-036).
document.addEventListener('visibilitychange', () => {
  if (document.hidden) requestPause();
});
window.addEventListener('blur', requestPause);

function requestPause(): void {
  if (game.mode === 'playing') pending.push('pause');
}

// ---- PWA ----

captureInstallPrompt(() => {
  if (screen === 'title') setScreen('title', true);
});

registerUpdates((accept) => {
  updateAccept = accept;
});

// ---- screens ----

function setScreen(next: Screen, force = false): void {
  if (next === screen && !force) return;
  screen = next;
  render();
}

function render(): void {
  switch (screen) {
    case 'none':
      ui.replaceChildren();
      break;
    case 'title':
      showTitle(ui, {
        onStart: startGame,
        onHighScores: () => setScreen('highScores'),
        onSettings: () => setScreen('settings'),
        install: installOption(),
      });
      break;
    case 'pause':
      showPause(ui, {
        onResume: () => pending.push('pause'),
        onHint: () => openHint('pause'),
        onTitle: () => pending.push('back'),
      });
      break;
    case 'settings':
      showSettings(ui, settings, {
        onChange: (patch) => {
          settings = { ...settings, ...patch };
          saveSettings(store, settings);
          applySettings();
        },
        onResetScores: () => {
          if (window.confirm('Reset all high scores on this device?')) {
            highScores = [];
            saveHighScores(store, highScores);
            render();
          }
        },
        onBack: () => setScreen('title'),
      });
      break;
    case 'highScores':
      showHighScores(ui, highScores, () => {
        if (game.mode === 'gameOver') game.returnToTitle();
        setScreen('title');
      });
      break;
    case 'initials':
      showInitials(ui, game.score, {
        onSubmit: (initials) => {
          const entry: ScoreEntry = {
            initials,
            score: game.score,
            levelReached: game.level,
            date: new Date().toISOString().slice(0, 10),
            assisted: game.assisted,
          };
          highScores = insertScore(highScores, entry, cfg.game.highScores.maxEntries);
          saveHighScores(store, highScores);
          setScreen('highScores');
        },
      });
      break;
    case 'gameOver':
      showGameOver(ui, game.score, {
        onPlayAgain: startGame,
        onTitle: () => {
          game.returnToTitle();
          setScreen('title');
        },
      });
      break;
    case 'levelClear':
      showLevelClear(ui, game.level);
      break;
    case 'hint':
      showHint(ui, touchDevice, () => {
        store.set(HINT_KEY, '1');
        setScreen(hintReturnsTo);
      });
      break;
  }
}

function openHint(from: Screen): void {
  hintReturnsTo = from;
  setScreen('hint');
}

function installOption(): { label: string; onSelect: () => void } | undefined {
  if (canPromptInstall()) {
    return { label: 'Install app', onSelect: () => void promptInstall() };
  }
  if (isIosSafari()) {
    return { label: 'How to install', onSelect: () => showNotice(document.body, IOS_INSTALL_TEXT) };
  }
  return undefined;
}

/** Keeps the screen in step with the game mode. Sticky screens stay open until the player leaves them. */
function syncScreen(): void {
  const mode: Mode = game.mode;
  let next: Screen;
  switch (mode) {
    case 'playing':
      next = 'none';
      break;
    case 'paused':
      next = screen === 'hint' ? 'hint' : 'pause';
      break;
    case 'levelClear':
      next = 'levelClear';
      break;
    case 'gameOver':
      if (screen === 'highScores') next = 'highScores';
      else next = qualifies(highScores, game.score, cfg.game.highScores.maxEntries) ? 'initials' : 'gameOver';
      break;
    default:
      next = screen === 'settings' || screen === 'highScores' || screen === 'hint' ? screen : 'title';
  }
  setScreen(next);
  maybeShowFirstHint();
  maybeShowUpdate();
  maybeShowStorageNotice();
}

function maybeShowFirstHint(): void {
  if (screen === 'title' && store.get(HINT_KEY) === null) openHint('title');
}

function maybeShowUpdate(): void {
  if (!updateAccept || updateNoticeShown || game.mode === 'playing') return;
  updateNoticeShown = true;
  showNotice(document.body, 'A new version is available.', {
    label: 'Update now',
    onClick: () => updateAccept?.(),
  });
}

function maybeShowStorageNotice(): void {
  if (!store.failed || storageNoticeShown) return;
  storageNoticeShown = true;
  showNotice(document.body, 'Scores will not be saved on this device.');
}

// ---- game flow ----

function startGame(): void {
  pending = [];
  unlockAudio();
  game.start(settings.speedAssist);
  setScreen('none');
  music.start(settings.musicVolume, settings.muted);
}

function applySettings(): void {
  board.configure(settings);
  music.setVolume(settings.musicVolume, settings.muted);
}

function handleEvents(): void {
  for (const event of game.events) {
    switch (event.type) {
      case 'hop':
        board.play('hop');
        break;
      case 'death':
        board.play('death');
        pulse(settings.haptics, 60);
        break;
      case 'bay':
        board.play('bay');
        pulse(settings.haptics, 30);
        break;
      case 'bonusLife':
        board.play('bonus');
        break;
      case 'timerWarning':
        board.play('timerWarning');
        break;
      case 'levelClear':
        board.play('levelClear');
        break;
      case 'gameOver':
        board.play('gameOver');
        music.stop();
        break;
    }
  }
}

// ---- rotation ----

function updateRotation(): void {
  const landscape = touchDevice && isLandscapePhone();
  setRotateScreen(document.body, landscape);
  if (landscape && game.mode === 'playing') pending.push('pause');
}

window.addEventListener('resize', () => {
  view.resize();
  updateRotation();
});
window.matchMedia('(orientation: landscape)').addEventListener('change', updateRotation);

// ---- main loop ----

function draw(): void {
  const ctx = view.ctx;
  ctx.fillStyle = palette.menuBg;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  drawHud(view, game, cfg.game, highScores[0]?.score ?? 0);
  drawPlayfield(view, game);
  if (debug.enabled) debug.draw(ctx);
}

function frame(now: number): void {
  const frameMs = now - lastFrame;
  lastFrame = now;
  debug.record(frameMs);

  const { steps } = clock.advance(frameMs);
  if (steps > 0) {
    const actions = pending;
    pending = [];
    for (let i = 0; i < steps; i++) {
      game.step(i === 0 ? actions : []);
      handleEvents();
    }
    syncScreen();
  }
  draw();
  requestAnimationFrame(frame);
}

syncScreen();
requestAnimationFrame((now) => {
  lastFrame = now;
  requestAnimationFrame(frame);
});
