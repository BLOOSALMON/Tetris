import {
  HARD_DROP_SCORE_PER_CELL,
  LINE_CLEAR_BASE_SCORES,
  LINES_PER_LEVEL,
  SOFT_DROP_SCORE_PER_CELL,
} from '../config/scoring';

export function computeLineClearScore(linesCleared: number, level: number): number {
  if (linesCleared < 1 || linesCleared > 4) return 0;
  const base = LINE_CLEAR_BASE_SCORES[linesCleared as 1 | 2 | 3 | 4];
  return base * level;
}

export function computeSoftDropScore(cells: number): number {
  return cells * SOFT_DROP_SCORE_PER_CELL;
}

export function computeHardDropScore(cells: number): number {
  return cells * HARD_DROP_SCORE_PER_CELL;
}

export function computeLevel(totalLinesCleared: number): number {
  return Math.floor(totalLinesCleared / LINES_PER_LEVEL) + 1;
}
