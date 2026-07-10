import { getKickOffsets } from '../config/srs-kicks';
import type { RotationState } from '../config/tetrominoes';
import type { Board } from './board';
import type { ActivePiece } from './piece';
import { isValidPosition } from './piece';

export type RotationDirection = 'CW' | 'CCW';

export function getNextRotation(rotation: RotationState, direction: RotationDirection): RotationState {
  const delta = direction === 'CW' ? 1 : -1;
  return (((rotation + delta) % 4) + 4) % 4 as RotationState;
}

export function tryRotate(
  board: Board,
  piece: ActivePiece,
  direction: RotationDirection,
): ActivePiece | null {
  const targetRotation = getNextRotation(piece.rotation, direction);
  const kicks = getKickOffsets(piece.type, piece.rotation, targetRotation);
  for (const kick of kicks) {
    const candidate: ActivePiece = {
      ...piece,
      rotation: targetRotation,
      x: piece.x + kick.x,
      y: piece.y + kick.y,
    };
    if (isValidPosition(board, candidate)) {
      return candidate;
    }
  }
  return null;
}
