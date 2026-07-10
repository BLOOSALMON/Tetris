import { BOARD_WIDTH } from '../config/board';
import type { Board } from './board';

export function findFullLines(board: Board): number[] {
  const fullLines: number[] = [];
  board.forEach((row, index) => {
    if (row.length === BOARD_WIDTH && row.every((cell) => cell !== null)) {
      fullLines.push(index);
    }
  });
  return fullLines;
}

export function clearLines(board: Board, lineIndices: number[]): Board {
  if (lineIndices.length === 0) return board;
  const lineSet = new Set(lineIndices);
  const remainingRows = board.filter((_, index) => !lineSet.has(index));
  const clearedCount = board.length - remainingRows.length;
  const newRows = Array.from({ length: clearedCount }, () => Array<null>(BOARD_WIDTH).fill(null));
  return [...newRows, ...remainingRows];
}
