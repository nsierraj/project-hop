import type { Game } from '../core/game';
import { isWarning } from '../core/lifeTimer';
import type { GameConfig } from '../config/loader';
import type { CanvasView } from './canvas';
import { palette } from './palette';

/** Draws the score, high score, level, lives, and timer bar in the band above the playfield (FR-003). */
export function drawHud(view: CanvasView, game: Game, cfg: GameConfig, highScore: number): void {
  const { ctx, tile, offsetX, offsetY, hudRows } = view;
  const width = game.grid.columns * tile;
  const top = offsetY - hudRows * tile;

  ctx.save();
  ctx.fillStyle = palette.hudBg;
  ctx.fillRect(offsetX, top, width, hudRows * tile);

  const fontPx = Math.max(10, Math.floor(tile * 0.55));
  ctx.font = `bold ${fontPx}px system-ui, sans-serif`;
  ctx.textBaseline = 'middle';

  ctx.fillStyle = palette.hudText;
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE ${game.score}`, offsetX + tile * 0.3, top + tile * 0.5);

  ctx.textAlign = 'right';
  ctx.fillText(`LEVEL ${game.level}`, offsetX + width - tile * 0.3, top + tile * 0.5);

  ctx.fillStyle = palette.hudMuted;
  ctx.textAlign = 'left';
  ctx.fillText(`HI ${highScore}`, offsetX + tile * 0.3, top + tile * 1.5);

  ctx.textAlign = 'right';
  const lives = game.lives;
  ctx.fillStyle = palette.hudText;
  ctx.fillText(`LIVES ${lives}`, offsetX + width - tile * 0.3, top + tile * 1.5);

  const barTop = top + tile * (hudRows - 0.5);
  const barFraction = Math.max(0, Math.min(1, game.lifeTimerMs / lifeMs(game, cfg)));
  ctx.fillStyle = '#263238';
  ctx.fillRect(offsetX + tile * 0.3, barTop, width - tile * 0.6, tile * 0.2);
  const warn = isWarning(game.lifeTimerMs, cfg);
  ctx.fillStyle = warn ? palette.timerWarn : palette.timerOk;
  ctx.fillRect(offsetX + tile * 0.3, barTop, (width - tile * 0.6) * barFraction, tile * 0.2);
  ctx.restore();
}

function lifeMs(game: Game, cfg: GameConfig): number {
  return (game.assisted ? cfg.speedAssist.lifeTimerSeconds : cfg.lifeTimerSeconds) * 1000;
}
