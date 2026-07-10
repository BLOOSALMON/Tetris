import { TETROMINO_TYPES } from '../config/tetrominoes';
import type { TetrominoType } from '../config/tetrominoes';

function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export class SevenBagGenerator {
  private queue: TetrominoType[] = [];
  private readonly rng: () => number;

  constructor(rng: () => number = Math.random) {
    this.rng = rng;
  }

  private refill(): void {
    this.queue.push(...shuffle(TETROMINO_TYPES, this.rng));
  }

  next(): TetrominoType {
    if (this.queue.length === 0) this.refill();
    return this.queue.shift() as TetrominoType;
  }

  peek(count: number): TetrominoType[] {
    while (this.queue.length < count) this.refill();
    return this.queue.slice(0, count);
  }
}
