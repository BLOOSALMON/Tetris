import type { Board } from './board';
import type { ActivePiece } from './piece';
import { isValidPosition } from './piece';

export function tryMove(board: Board, piece: ActivePiece, dx: number, dy: number): ActivePiece | null {
  const moved: ActivePiece = { ...piece, x: piece.x + dx, y: piece.y + dy };
  return isValidPosition(board, moved) ? moved : null;
}

export function isGrounded(board: Board, piece: ActivePiece): boolean {
  return !isValidPosition(board, { ...piece, y: piece.y + 1 });
}

export function getHardDropDistance(board: Board, piece: ActivePiece): number {
  let distance = 0;
  while (isValidPosition(board, { ...piece, y: piece.y + distance + 1 })) {
    distance += 1;
  }
  return distance;
}

export function getGhostPiece(board: Board, piece: ActivePiece): ActivePiece {
  return { ...piece, y: piece.y + getHardDropDistance(board, piece) };
}
