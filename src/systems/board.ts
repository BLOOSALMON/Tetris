import { BOARD_HEIGHT, BOARD_WIDTH } from '../config/board';
import type { Cell, TetrominoType } from '../config/tetrominoes';

export type BoardCell = TetrominoType | null;
export type Board = BoardCell[][];

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () => Array<BoardCell>(BOARD_WIDTH).fill(null));
}

export function isWithinBounds(x: number, y: number): boolean {
  return x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT;
}

export function mergeCellsIntoBoard(board: Board, cells: Cell[], type: TetrominoType): Board {
  const next = board.map((row) => [...row]);
  cells.forEach(({ x, y }) => {
    if (isWithinBounds(x, y)) next[y][x] = type;
  });
  return next;
}
