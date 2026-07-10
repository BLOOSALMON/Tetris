import { getSpawnPosition, getTetrominoCells } from '../config/tetrominoes';
import type { Cell, RotationState, TetrominoType } from '../config/tetrominoes';
import type { Board } from './board';
import { isWithinBounds } from './board';

export interface ActivePiece {
  type: TetrominoType;
  rotation: RotationState;
  x: number;
  y: number;
}

export function createActivePiece(type: TetrominoType): ActivePiece {
  const spawn = getSpawnPosition(type);
  return { type, rotation: 0, x: spawn.x, y: spawn.y };
}

export function getOccupiedCells(piece: ActivePiece): Cell[] {
  return getTetrominoCells(piece.type, piece.rotation).map((cell) => ({
    x: cell.x + piece.x,
    y: cell.y + piece.y,
  }));
}

export function isValidPosition(board: Board, piece: ActivePiece): boolean {
  return getOccupiedCells(piece).every(({ x, y }) => {
    if (!isWithinBounds(x, y)) return false;
    return board[y][x] === null;
  });
}
