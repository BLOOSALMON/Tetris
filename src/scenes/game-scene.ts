import Phaser from 'phaser';
import { BOARD_BUFFER_HEIGHT, BOARD_HEIGHT, BOARD_WIDTH } from '../config/board';
import { COUNTDOWN_SECONDS, ONBOARDING_OVERLAY_MS } from '../config/game';
import { ARR_MS, DAS_MS, DEFAULT_KEY_BINDINGS } from '../config/input';
import {
  BOARD_PIXEL_HEIGHT,
  BOARD_PIXEL_WIDTH,
  BOARD_X,
  BOARD_Y,
  CELL_SIZE,
  CREAM_TEXT_COLOR,
  GLASS_BORDER_ALPHA,
  GLASS_BORDER_COLOR,
  GLASS_FILL_ALPHA,
  GLASS_FILL_COLOR,
  GRID_LINE_ALPHA,
  GRID_LINE_COLOR,
  HOLD_PANEL_X,
  HOLD_PANEL_Y,
  INK_TEXT_COLOR,
  JELLY_CORNER_RADIUS,
  JELLY_HIGHLIGHT_ALPHA,
  JELLY_SHADOW_ALPHA,
  NEXT_PANEL_X,
  NEXT_PANEL_Y,
  NEXT_SLOT_HEIGHT,
  PANEL_LABEL_COLOR,
  PREVIEW_CELL_SIZE,
  SIDE_PANEL_WIDTH,
} from '../config/render';
import { getTetrominoCells, TETROMINO_COLORS } from '../config/tetrominoes';
import type { TetrominoType } from '../config/tetrominoes';
import type { EngineState, LastClearInfo, LockInfo } from '../systems/engine';
import { TetrisEngine } from '../systems/engine';
import { soundManager } from '../systems/sound-manager';
import { useGameStore } from '../store/game-store';

interface DasState {
  held: boolean;
  elapsedMs: number;
  arrElapsedMs: number;
}

function createDasState(): DasState {
  return { held: false, elapsedMs: 0, arrElapsedMs: 0 };
}

export class GameScene extends Phaser.Scene {
  private engine = new TetrisEngine();

  private boardGraphics!: Phaser.GameObjects.Graphics;
  private ghostGraphics!: Phaser.GameObjects.Graphics;
  private holdGraphics!: Phaser.GameObjects.Graphics;
  private nextGraphics!: Phaser.GameObjects.Graphics;
  private flashOverlay!: Phaser.GameObjects.Rectangle;
  private tetrisBanner!: Phaser.GameObjects.Text;
  private countdownText: Phaser.GameObjects.Text | null = null;
  private onboardingText: Phaser.GameObjects.Text | null = null;

  private squashPool: Phaser.GameObjects.Graphics[] = [];
  private dropletPool: Phaser.GameObjects.Arc[] = [];
  private ripplePool: Phaser.GameObjects.Ellipse[] = [];

  private dasState = { left: createDasState(), right: createDasState() };
  private lastLevel = 1;
  private gameOverReported = false;
  private previousClear: LastClearInfo | null = null;
  private previousLocked: LockInfo | null = null;

  private readonly onKeyDown = (event: KeyboardEvent): void => this.handleKeyDown(event);
  private readonly onKeyUp = (event: KeyboardEvent): void => this.handleKeyUp(event);
  private readonly onVisibilityChange = (): void => this.handleVisibilityChange();

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.drawStaticFrame();

    this.boardGraphics = this.add.graphics();
    this.ghostGraphics = this.add.graphics();
    this.holdGraphics = this.add.graphics();
    this.nextGraphics = this.add.graphics();

    this.flashOverlay = this.add
      .rectangle(BOARD_X, BOARD_Y, BOARD_PIXEL_WIDTH, BOARD_PIXEL_HEIGHT, 0xeafbff, 0)
      .setOrigin(0);

    this.tetrisBanner = this.add
      .text(BOARD_X + BOARD_PIXEL_WIDTH / 2, BOARD_Y + BOARD_PIXEL_HEIGHT / 2, '첨벙! 테트리스!', {
        fontSize: '28px',
        color: '#f5424b',
        fontStyle: 'bold',
        stroke: CREAM_TEXT_COLOR,
        strokeThickness: 6,
        align: 'center',
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.initEffectPools();

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());

    useGameStore.getState().registerControls({
      startGame: () => this.beginRun(true),
      pauseGame: () => this.pauseRun(),
      resumeGame: () => this.resumeRun(),
      restartGame: () => this.beginRun(false),
      quitToTitle: () => this.quitToTitle(),
    });
  }

  private cleanup(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  update(_time: number, delta: number): void {
    this.stepDas('left', delta, () => this.engine.moveLeft());
    this.stepDas('right', delta, () => this.engine.moveRight());
    this.engine.tick(delta);
    this.render();
  }

  // ----- 입력 처리 -----

  private handleKeyDown(event: KeyboardEvent): void {
    const bindings = DEFAULT_KEY_BINDINGS;
    if (event.repeat) return;

    if (event.code === bindings.hardDrop) {
      event.preventDefault();
      this.engine.hardDrop();
    } else if (bindings.rotateClockwise.includes(event.code)) {
      event.preventDefault();
      this.engine.rotate('CW');
    } else if (bindings.rotateCounterClockwise.includes(event.code)) {
      event.preventDefault();
      this.engine.rotate('CCW');
    } else if (event.code === bindings.hold) {
      event.preventDefault();
      this.engine.hold();
    } else if (event.code === bindings.pause) {
      event.preventDefault();
      this.togglePause();
    } else if (event.code === bindings.moveLeft) {
      event.preventDefault();
      this.engine.moveLeft();
      this.dasState.left = { held: true, elapsedMs: 0, arrElapsedMs: 0 };
    } else if (event.code === bindings.moveRight) {
      event.preventDefault();
      this.engine.moveRight();
      this.dasState.right = { held: true, elapsedMs: 0, arrElapsedMs: 0 };
    } else if (event.code === bindings.softDrop) {
      event.preventDefault();
      this.engine.setSoftDropping(true);
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    const bindings = DEFAULT_KEY_BINDINGS;
    if (event.code === bindings.moveLeft) this.dasState.left.held = false;
    else if (event.code === bindings.moveRight) this.dasState.right.held = false;
    else if (event.code === bindings.softDrop) this.engine.setSoftDropping(false);
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.dasState.left.held = false;
      this.dasState.right.held = false;
      this.engine.setSoftDropping(false);
      if (this.engine.getState().status === 'playing') this.pauseRun();
    }
  }

  private stepDas(direction: 'left' | 'right', deltaMs: number, move: () => void): void {
    const state = this.dasState[direction];
    if (!state.held) {
      state.elapsedMs = 0;
      state.arrElapsedMs = 0;
      return;
    }
    state.elapsedMs += deltaMs;
    if (state.elapsedMs < DAS_MS) return;
    state.arrElapsedMs += deltaMs;
    while (state.arrElapsedMs >= ARR_MS) {
      state.arrElapsedMs -= ARR_MS;
      move();
    }
  }

  // ----- 화면 전환 제어 -----

  private beginRun(withOnboarding: boolean): void {
    this.engine = new TetrisEngine();
    this.dasState = { left: createDasState(), right: createDasState() };
    this.lastLevel = 1;
    this.gameOverReported = false;
    this.tetrisBanner.setAlpha(0);
    this.flashOverlay.setAlpha(0);
    this.resetEffectPools();
    this.previousLocked = null;
    this.onboardingText?.destroy();
    this.onboardingText = null;
    this.countdownText?.destroy();
    this.countdownText = null;

    useGameStore.getState().setScreen('playing');
    useGameStore.getState().updateHud({ score: 0, level: 1, totalLines: 0, hold: null, next: [] });

    if (withOnboarding) {
      this.onboardingText = this.add
        .text(
          BOARD_X + BOARD_PIXEL_WIDTH / 2,
          BOARD_Y + BOARD_PIXEL_HEIGHT / 2,
          '← → 이동   ↓ 소프트드롭   Space 하드드롭\n↑ / X 시계방향 회전   Z 반시계방향 회전\nC 홀드   Esc 일시정지',
          {
            fontSize: '15px',
            color: INK_TEXT_COLOR,
            align: 'center',
            backgroundColor: '#fff8e8ee',
            padding: { x: 16, y: 12 },
          },
        )
        .setOrigin(0.5);
      this.time.delayedCall(ONBOARDING_OVERLAY_MS, () => {
        this.onboardingText?.destroy();
        this.onboardingText = null;
        this.runCountdown(COUNTDOWN_SECONDS);
      });
    } else {
      this.runCountdown(COUNTDOWN_SECONDS);
    }
  }

  private runCountdown(secondsLeft: number): void {
    this.countdownText?.destroy();
    if (secondsLeft <= 0) {
      this.countdownText = null;
      this.engine.start();
      return;
    }
    this.countdownText = this.add
      .text(BOARD_X + BOARD_PIXEL_WIDTH / 2, BOARD_Y + BOARD_PIXEL_HEIGHT / 2, String(secondsLeft), {
        fontSize: '64px',
        color: INK_TEXT_COLOR,
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 8,
      })
      .setOrigin(0.5);
    this.time.delayedCall(1000, () => this.runCountdown(secondsLeft - 1));
  }

  private togglePause(): void {
    const status = this.engine.getState().status;
    if (status === 'playing') this.pauseRun();
    else if (status === 'paused') this.resumeRun();
  }

  private pauseRun(): void {
    this.engine.pause();
    if (this.engine.getState().status === 'paused') useGameStore.getState().setScreen('paused');
  }

  private resumeRun(): void {
    this.engine.resume();
    useGameStore.getState().setScreen('playing');
  }

  private quitToTitle(): void {
    this.engine.pause();
    this.countdownText?.destroy();
    this.countdownText = null;
    this.onboardingText?.destroy();
    this.onboardingText = null;
    useGameStore.getState().setScreen('title');
  }

  // ----- 렌더링 -----

  private drawStaticFrame(): void {
    const frame = this.add.graphics();

    frame.fillStyle(GLASS_FILL_COLOR, GLASS_FILL_ALPHA);
    frame.fillRoundedRect(BOARD_X, BOARD_Y, BOARD_PIXEL_WIDTH, BOARD_PIXEL_HEIGHT, 20);

    frame.lineStyle(1, GRID_LINE_COLOR, GRID_LINE_ALPHA);
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      frame.lineBetween(BOARD_X + x * CELL_SIZE, BOARD_Y, BOARD_X + x * CELL_SIZE, BOARD_Y + BOARD_PIXEL_HEIGHT);
    }
    for (let y = 0; y <= BOARD_HEIGHT - BOARD_BUFFER_HEIGHT; y++) {
      frame.lineBetween(BOARD_X, BOARD_Y + y * CELL_SIZE, BOARD_X + BOARD_PIXEL_WIDTH, BOARD_Y + y * CELL_SIZE);
    }

    frame.lineStyle(2, GLASS_BORDER_COLOR, GLASS_BORDER_ALPHA);
    frame.strokeRoundedRect(BOARD_X, BOARD_Y, BOARD_PIXEL_WIDTH, BOARD_PIXEL_HEIGHT, 20);

    frame.fillStyle(GLASS_FILL_COLOR, GLASS_FILL_ALPHA);
    frame.fillRoundedRect(HOLD_PANEL_X, HOLD_PANEL_Y, SIDE_PANEL_WIDTH - 10, NEXT_SLOT_HEIGHT, 18);
    frame.fillRoundedRect(NEXT_PANEL_X, NEXT_PANEL_Y, SIDE_PANEL_WIDTH - 10, BOARD_PIXEL_HEIGHT, 18);
    frame.lineStyle(2, GLASS_BORDER_COLOR, GLASS_BORDER_ALPHA);
    frame.strokeRoundedRect(HOLD_PANEL_X, HOLD_PANEL_Y, SIDE_PANEL_WIDTH - 10, NEXT_SLOT_HEIGHT, 18);
    frame.strokeRoundedRect(NEXT_PANEL_X, NEXT_PANEL_Y, SIDE_PANEL_WIDTH - 10, BOARD_PIXEL_HEIGHT, 18);

    this.add.text(HOLD_PANEL_X + 12, HOLD_PANEL_Y + 10, 'HOLD', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: PANEL_LABEL_COLOR,
    });
    this.add.text(NEXT_PANEL_X + 12, NEXT_PANEL_Y + 10, 'NEXT', {
      fontSize: '13px',
      fontStyle: 'bold',
      color: PANEL_LABEL_COLOR,
    });
  }

  // 젤리 질감: 기본 채색 위에 아래쪽 그림자 → 위쪽 광택 하이라이트 순으로 겹쳐 입체감을 낸다.
  // 보드 셀과 락 이펙트 오버레이가 이 로직을 공유해 애니메이션 중에도 동일한 젤리 룩을 유지한다.
  private paintJellyCell(graphics: Phaser.GameObjects.Graphics, x: number, y: number, size: number, color: number): void {
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(x, y, size, size, JELLY_CORNER_RADIUS);

    graphics.fillStyle(0x102a3d, JELLY_SHADOW_ALPHA);
    graphics.fillRoundedRect(x + 2, y + size * 0.55, size - 4, size * 0.4, JELLY_CORNER_RADIUS * 0.6);

    graphics.fillStyle(0xffffff, JELLY_HIGHLIGHT_ALPHA);
    graphics.fillRoundedRect(x + 3, y + 2, size * 0.55, size * 0.32, JELLY_CORNER_RADIUS * 0.6);
  }

  private drawCell(graphics: Phaser.GameObjects.Graphics, boardX: number, visibleY: number, color: number): void {
    if (visibleY < 0) return;
    const px = BOARD_X + boardX * CELL_SIZE;
    const py = BOARD_Y + visibleY * CELL_SIZE;
    this.paintJellyCell(graphics, px + 1, py + 1, CELL_SIZE - 2, color);
  }

  private drawCellOutline(graphics: Phaser.GameObjects.Graphics, boardX: number, visibleY: number, color: number): void {
    if (visibleY < 0) return;
    const px = BOARD_X + boardX * CELL_SIZE;
    const py = BOARD_Y + visibleY * CELL_SIZE;
    graphics.lineStyle(2, color, 0.85);
    graphics.strokeRoundedRect(px + 3, py + 3, CELL_SIZE - 6, CELL_SIZE - 6, JELLY_CORNER_RADIUS * 0.7);
  }

  private drawPreview(
    graphics: Phaser.GameObjects.Graphics,
    type: TetrominoType,
    originX: number,
    originY: number,
  ): void {
    const cells = getTetrominoCells(type, 0);
    const minX = Math.min(...cells.map((c) => c.x));
    const maxX = Math.max(...cells.map((c) => c.x));
    const minY = Math.min(...cells.map((c) => c.y));
    const maxY = Math.max(...cells.map((c) => c.y));
    const widthPx = (maxX - minX + 1) * PREVIEW_CELL_SIZE;
    const heightPx = (maxY - minY + 1) * PREVIEW_CELL_SIZE;
    const offsetX = originX - widthPx / 2;
    const offsetY = originY - heightPx / 2;
    const previewRadius = 4;

    graphics.fillStyle(TETROMINO_COLORS[type], 1);
    cells.forEach((cell) => {
      const px = offsetX + (cell.x - minX) * PREVIEW_CELL_SIZE;
      const py = offsetY + (cell.y - minY) * PREVIEW_CELL_SIZE;
      graphics.fillRoundedRect(px + 1, py + 1, PREVIEW_CELL_SIZE - 2, PREVIEW_CELL_SIZE - 2, previewRadius);
    });

    graphics.fillStyle(0xffffff, JELLY_HIGHLIGHT_ALPHA);
    cells.forEach((cell) => {
      const px = offsetX + (cell.x - minX) * PREVIEW_CELL_SIZE;
      const py = offsetY + (cell.y - minY) * PREVIEW_CELL_SIZE;
      graphics.fillRoundedRect(px + 2, py + 2, (PREVIEW_CELL_SIZE - 4) * 0.5, (PREVIEW_CELL_SIZE - 4) * 0.35, 2);
    });
  }

  private render(): void {
    const state = this.engine.getState();

    this.boardGraphics.clear();
    this.ghostGraphics.clear();

    for (let y = BOARD_BUFFER_HEIGHT; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const cell = state.board[y][x];
        if (cell) this.drawCell(this.boardGraphics, x, y - BOARD_BUFFER_HEIGHT, TETROMINO_COLORS[cell]);
      }
    }

    if (state.ghost) {
      const ghost = state.ghost;
      getTetrominoCells(ghost.type, ghost.rotation).forEach((cell) => {
        this.drawCellOutline(
          this.ghostGraphics,
          cell.x + ghost.x,
          cell.y + ghost.y - BOARD_BUFFER_HEIGHT,
          TETROMINO_COLORS[ghost.type],
        );
      });
    }

    if (state.active) {
      const active = state.active;
      getTetrominoCells(active.type, active.rotation).forEach((cell) => {
        this.drawCell(
          this.boardGraphics,
          cell.x + active.x,
          cell.y + active.y - BOARD_BUFFER_HEIGHT,
          TETROMINO_COLORS[active.type],
        );
      });
    }

    this.renderHoldPanel(state.hold);
    this.renderNextPanel(state.next);
    this.handleLockFeedback(state.lastLocked);
    this.handleLineClearFeedback(state.lastClear);
    this.handleLevelUpFeedback(state.level);
    this.handleGameOver(state);

    useGameStore.getState().updateHud({
      score: state.score,
      level: state.level,
      totalLines: state.totalLines,
      hold: state.hold,
      next: state.next,
    });
  }

  private renderHoldPanel(hold: TetrominoType | null): void {
    this.holdGraphics.clear();
    if (!hold) return;
    this.drawPreview(this.holdGraphics, hold, HOLD_PANEL_X + (SIDE_PANEL_WIDTH - 10) / 2, HOLD_PANEL_Y + 55);
  }

  private renderNextPanel(next: TetrominoType[]): void {
    this.nextGraphics.clear();
    next.forEach((type, index) => {
      const slotCenterY = NEXT_PANEL_Y + 45 + index * NEXT_SLOT_HEIGHT * 0.62;
      this.drawPreview(this.nextGraphics, type, NEXT_PANEL_X + (SIDE_PANEL_WIDTH - 10) / 2, slotCenterY);
    });
  }

  // ----- 락 바운스 + 스플래시 이펙트 -----
  // 락은 매 조각마다 반복 발생하므로, 이펙트용 게임 오브젝트는 create() 시점에
  // 미리 풀링해두고 재사용한다(게임 루프 중 새 오브젝트 생성 금지 원칙).

  private initEffectPools(): void {
    const squashCount = 8;
    const dropletCount = 10;
    const rippleCount = 4;

    for (let i = 0; i < squashCount; i++) {
      const overlay = this.add.graphics().setVisible(false);
      this.squashPool.push(overlay);
    }
    for (let i = 0; i < dropletCount; i++) {
      const droplet = this.add.circle(0, 0, 4, 0x7fd8f2, 1).setVisible(false);
      this.dropletPool.push(droplet);
    }
    for (let i = 0; i < rippleCount; i++) {
      const ripple = this.add
        .ellipse(0, 0, CELL_SIZE, CELL_SIZE * 0.5, 0xffffff, 0)
        .setStrokeStyle(2, 0xffffff, 0.8)
        .setVisible(false);
      this.ripplePool.push(ripple);
    }
  }

  private resetEffectPools(): void {
    [...this.squashPool, ...this.dropletPool, ...this.ripplePool].forEach((obj) => {
      this.tweens.killTweensOf(obj);
      obj.setVisible(false);
    });
  }

  private getFreeFromPool<T extends { visible: boolean }>(pool: T[]): T | undefined {
    return pool.find((item) => !item.visible);
  }

  private handleLockFeedback(lastLocked: LockInfo | null): void {
    if (lastLocked && lastLocked !== this.previousLocked) {
      this.playLockEffect(lastLocked);
    }
    this.previousLocked = lastLocked;
  }

  private playLockEffect(locked: LockInfo): void {
    const visibleCells = locked.cells
      .map((cell) => ({ x: cell.x, y: cell.y - BOARD_BUFFER_HEIGHT }))
      .filter((cell) => cell.y >= 0);
    if (visibleCells.length === 0) return;

    const color = TETROMINO_COLORS[locked.type];
    visibleCells.forEach((cell) => this.playSquash(cell.x, cell.y, color));

    const centroidX = visibleCells.reduce((sum, cell) => sum + cell.x, 0) / visibleCells.length;
    const bottomY = Math.max(...visibleCells.map((cell) => cell.y));
    this.playSplash(centroidX, bottomY, color);
  }

  private playSquash(cellX: number, cellY: number, color: number): void {
    const overlay = this.getFreeFromPool(this.squashPool);
    if (!overlay) return;

    const size = CELL_SIZE - 2;
    const px = BOARD_X + cellX * CELL_SIZE + CELL_SIZE / 2;
    const py = BOARD_Y + cellY * CELL_SIZE + CELL_SIZE / 2;

    overlay.clear();
    this.paintJellyCell(overlay, -size / 2, -size / 2, size, color);
    overlay.setPosition(px, py);
    overlay.setScale(1, 1);
    overlay.setAlpha(1);
    overlay.setVisible(true);

    this.tweens.killTweensOf(overlay);
    // 임팩트(짓눌림, 매우 빠름) → 반동(위로 튕김) → 안착(살짝 오버슈트 후 정지) 3단 체인으로
    // 단일 트윈보다 훨씬 스냅감 있게 만든다.
    this.tweens.chain({
      targets: overlay,
      tweens: [
        { scaleX: 1.34, scaleY: 0.48, duration: 60, ease: 'Quad.Out' },
        { scaleX: 0.88, scaleY: 1.18, duration: 110, ease: 'Sine.Out' },
        { scaleX: 1, scaleY: 1, duration: 130, ease: 'Back.Out', easeParams: [2.4] },
      ],
      onComplete: () => overlay.setVisible(false),
    });
  }

  private playSplash(cellX: number, cellY: number, color: number): void {
    const originX = BOARD_X + (cellX + 0.5) * CELL_SIZE;
    const originY = BOARD_Y + (cellY + 1) * CELL_SIZE;
    const dropletOffsets = [-30, -15, 0, 15, 30];

    dropletOffsets.forEach((dx) => {
      const droplet = this.getFreeFromPool(this.dropletPool);
      if (!droplet) return;

      droplet.setPosition(originX, originY);
      droplet.setFillStyle(color, 1);
      droplet.setScale(1);
      droplet.setAlpha(1);
      droplet.setVisible(true);

      this.tweens.add({
        targets: droplet,
        x: originX + dx,
        y: originY - Phaser.Math.Between(14, 26),
        alpha: 0,
        scale: 0.4,
        duration: 480,
        ease: 'Cubic.Out',
        onComplete: () => droplet.setVisible(false),
      });
    });

    const ripple = this.getFreeFromPool(this.ripplePool);
    if (ripple) {
      ripple.setPosition(originX, originY);
      ripple.setScale(0.3);
      ripple.setAlpha(0.7);
      ripple.setVisible(true);

      this.tweens.add({
        targets: ripple,
        scale: 1.6,
        alpha: 0,
        duration: 420,
        ease: 'Cubic.Out',
        onComplete: () => ripple.setVisible(false),
      });
    }
  }

  private handleLineClearFeedback(lastClear: LastClearInfo | null): void {
    if (lastClear && lastClear !== this.previousClear) {
      soundManager.play(lastClear.isTetris ? 'tetris' : 'lineClear');
      const flashAlpha = lastClear.isTetris ? 0.5 : 0.25;
      this.flashOverlay.setAlpha(flashAlpha);
      this.tweens.add({ targets: this.flashOverlay, alpha: 0, duration: 250 });

      if (lastClear.isTetris) {
        this.tetrisBanner.setAlpha(1);
        this.tweens.add({ targets: this.tetrisBanner, alpha: 0, duration: 600, delay: 300 });
      }
    }
    this.previousClear = lastClear;
  }

  private handleLevelUpFeedback(level: number): void {
    if (level > this.lastLevel) {
      soundManager.play('levelUp');
    }
    this.lastLevel = level;
  }

  private handleGameOver(state: EngineState): void {
    if (state.status === 'gameover' && !this.gameOverReported) {
      this.gameOverReported = true;
      soundManager.play('gameOver');
      useGameStore.getState().reportGameOver(state.score);
    }
  }
}
