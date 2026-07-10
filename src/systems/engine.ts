import { getDropIntervalMs } from '../config/gravity';
import { LOCK_DELAY_MAX_RESETS, LOCK_DELAY_MS, SOFT_DROP_FACTOR } from '../config/input';
import { NEXT_QUEUE_SIZE } from '../config/game';
import type { Cell, TetrominoType } from '../config/tetrominoes';
import type { Board } from './board';
import { createEmptyBoard, mergeCellsIntoBoard } from './board';
import { clearLines, findFullLines } from './line-clear';
import { getGhostPiece, getHardDropDistance, isGrounded, tryMove } from './movement';
import { createActivePiece, getOccupiedCells, isValidPosition } from './piece';
import type { ActivePiece } from './piece';
import type { RotationDirection } from './rotation';
import { tryRotate } from './rotation';
import { computeHardDropScore, computeLevel, computeLineClearScore, computeSoftDropScore } from './scoring';
import { SevenBagGenerator } from './seven-bag';

export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover';

export interface LastClearInfo {
  lines: number;
  isTetris: boolean;
}

export interface LockInfo {
  cells: Cell[];
  type: TetrominoType;
}

export interface EngineState {
  board: Board;
  active: ActivePiece | null;
  ghost: ActivePiece | null;
  hold: TetrominoType | null;
  canHold: boolean;
  next: TetrominoType[];
  score: number;
  level: number;
  totalLines: number;
  status: GameStatus;
  lastClear: LastClearInfo | null;
  lastLocked: LockInfo | null;
}

export class TetrisEngine {
  private board: Board = createEmptyBoard();
  private bag: SevenBagGenerator;
  private active: ActivePiece | null = null;
  private holdType: TetrominoType | null = null;
  private canHold = true;
  private score = 0;
  private totalLines = 0;
  private status: GameStatus = 'ready';
  private lastClear: LastClearInfo | null = null;
  private lastLocked: LockInfo | null = null;

  private dropAccumulatorMs = 0;
  private lockTimerMs = 0;
  private lockResets = 0;
  private softDropping = false;

  constructor(rng: () => number = Math.random) {
    this.bag = new SevenBagGenerator(rng);
  }

  start(): void {
    this.board = createEmptyBoard();
    this.holdType = null;
    this.canHold = true;
    this.score = 0;
    this.totalLines = 0;
    this.lastClear = null;
    this.lastLocked = null;
    this.dropAccumulatorMs = 0;
    this.lockTimerMs = 0;
    this.lockResets = 0;
    this.softDropping = false;
    this.bag = new SevenBagGenerator();
    this.status = 'playing';
    this.spawnNext();
  }

  private get level(): number {
    return computeLevel(this.totalLines);
  }

  private spawnNext(): void {
    const type = this.bag.next();
    const piece = createActivePiece(type);
    if (!isValidPosition(this.board, piece)) {
      this.active = piece;
      this.status = 'gameover';
      return;
    }
    this.active = piece;
    this.canHold = true;
    this.dropAccumulatorMs = 0;
    this.lockTimerMs = 0;
    this.lockResets = 0;
  }

  private resetLockDelayIfGrounded(): void {
    if (!this.active) return;
    if (isGrounded(this.board, this.active) && this.lockResets < LOCK_DELAY_MAX_RESETS) {
      this.lockTimerMs = 0;
      this.lockResets += 1;
    }
  }

  moveLeft(): void {
    if (this.status !== 'playing' || !this.active) return;
    const moved = tryMove(this.board, this.active, -1, 0);
    if (moved) {
      this.active = moved;
      this.resetLockDelayIfGrounded();
    }
  }

  moveRight(): void {
    if (this.status !== 'playing' || !this.active) return;
    const moved = tryMove(this.board, this.active, 1, 0);
    if (moved) {
      this.active = moved;
      this.resetLockDelayIfGrounded();
    }
  }

  setSoftDropping(active: boolean): void {
    this.softDropping = active;
  }

  rotate(direction: RotationDirection): void {
    if (this.status !== 'playing' || !this.active) return;
    const rotated = tryRotate(this.board, this.active, direction);
    if (rotated) {
      this.active = rotated;
      this.resetLockDelayIfGrounded();
    }
  }

  hardDrop(): void {
    if (this.status !== 'playing' || !this.active) return;
    const distance = getHardDropDistance(this.board, this.active);
    this.active = { ...this.active, y: this.active.y + distance };
    this.score += computeHardDropScore(distance);
    this.lockPiece();
  }

  hold(): void {
    if (this.status !== 'playing' || !this.active || !this.canHold) return;
    const currentType = this.active.type;
    const nextType = this.holdType ?? this.bag.next();
    const piece = createActivePiece(nextType);
    if (!isValidPosition(this.board, piece)) return;
    this.holdType = currentType;
    this.active = piece;
    this.canHold = false;
    this.dropAccumulatorMs = 0;
    this.lockTimerMs = 0;
    this.lockResets = 0;
  }

  private lockPiece(): void {
    if (!this.active) return;
    const cells = getOccupiedCells(this.active);
    this.board = mergeCellsIntoBoard(this.board, cells, this.active.type);
    this.lastLocked = { cells, type: this.active.type };

    const fullLines = findFullLines(this.board);
    if (fullLines.length > 0) {
      this.board = clearLines(this.board, fullLines);
      this.score += computeLineClearScore(fullLines.length, this.level);
      this.totalLines += fullLines.length;
      this.lastClear = { lines: fullLines.length, isTetris: fullLines.length === 4 };
    } else {
      this.lastClear = null;
    }

    this.spawnNext();
  }

  pause(): void {
    if (this.status === 'playing') this.status = 'paused';
  }

  resume(): void {
    if (this.status === 'paused') this.status = 'playing';
  }

  tick(deltaMs: number): void {
    if (this.status !== 'playing' || !this.active) return;

    const baseInterval = getDropIntervalMs(this.level);
    const interval = this.softDropping ? baseInterval / SOFT_DROP_FACTOR : baseInterval;

    this.dropAccumulatorMs += deltaMs;

    while (this.dropAccumulatorMs >= interval) {
      this.dropAccumulatorMs -= interval;
      const moved = tryMove(this.board, this.active, 0, 1);
      if (moved) {
        this.active = moved;
        if (this.softDropping) this.score += computeSoftDropScore(1);
        this.lockTimerMs = 0;
      } else {
        break;
      }
    }

    if (this.active && isGrounded(this.board, this.active)) {
      this.lockTimerMs += deltaMs;
      if (this.lockTimerMs >= LOCK_DELAY_MS) {
        this.lockPiece();
      }
    } else {
      this.lockTimerMs = 0;
      this.lockResets = 0;
    }
  }

  getState(): EngineState {
    return {
      board: this.board,
      active: this.active,
      ghost: this.active ? getGhostPiece(this.board, this.active) : null,
      hold: this.holdType,
      canHold: this.canHold,
      next: this.bag.peek(NEXT_QUEUE_SIZE),
      score: this.score,
      level: this.level,
      totalLines: this.totalLines,
      status: this.status,
      lastClear: this.lastClear,
      lastLocked: this.lastLocked,
    };
  }
}
