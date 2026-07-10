export const DAS_MS = 150;
export const ARR_MS = 30;
export const LOCK_DELAY_MS = 500;
export const LOCK_DELAY_MAX_RESETS = 15;
export const SOFT_DROP_FACTOR = 20;

export interface KeyBindings {
  moveLeft: string;
  moveRight: string;
  softDrop: string;
  hardDrop: string;
  rotateClockwise: string[];
  rotateCounterClockwise: string[];
  hold: string;
  pause: string;
}

export const DEFAULT_KEY_BINDINGS: KeyBindings = {
  moveLeft: 'ArrowLeft',
  moveRight: 'ArrowRight',
  softDrop: 'ArrowDown',
  hardDrop: 'Space',
  rotateClockwise: ['ArrowUp', 'KeyX'],
  rotateCounterClockwise: ['KeyZ'],
  hold: 'KeyC',
  pause: 'Escape',
};
