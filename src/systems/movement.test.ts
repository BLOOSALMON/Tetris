import { describe, expect, it } from 'vitest';
import { BOARD_WIDTH } from '../config/board';
import { createEmptyBoard, mergeCellsIntoBoard } from './board';
import { getGhostPiece, getHardDropDistance, isGrounded, tryMove } from './movement';
import { createActivePiece } from './piece';

describe('tryMove', () => {
  it('빈 공간으로는 이동이 성공한다', () => {
    const board = createEmptyBoard();
    const piece = createActivePiece('T');
    const moved = tryMove(board, piece, 1, 0);
    expect(moved).not.toBeNull();
    expect(moved?.x).toBe(piece.x + 1);
  });

  it('보드 경계를 넘어가는 이동은 실패한다', () => {
    const board = createEmptyBoard();
    const piece = createActivePiece('O');
    let current = piece;
    for (let i = 0; i < BOARD_WIDTH; i++) {
      const moved = tryMove(board, current, 1, 0);
      if (moved) current = moved;
    }
    expect(tryMove(board, current, 1, 0)).toBeNull();
  });

  it('이미 채워진 칸으로는 이동할 수 없다', () => {
    let board = createEmptyBoard();
    board = mergeCellsIntoBoard(board, [{ x: 4, y: 5 }], 'I');
    const piece = createActivePiece('O');
    const blocked = tryMove(board, { ...piece, x: 3, y: 4 }, 0, 1);
    expect(blocked).toBeNull();
  });
});

describe('isGrounded / getHardDropDistance / getGhostPiece', () => {
  it('바닥 위에 떠 있으면 grounded가 아니다', () => {
    const board = createEmptyBoard();
    const piece = createActivePiece('O');
    expect(isGrounded(board, piece)).toBe(false);
  });

  it('하드 드롭 거리만큼 내려간 고스트 피스가 바닥에 닿아 있다', () => {
    const board = createEmptyBoard();
    const piece = createActivePiece('O');
    const distance = getHardDropDistance(board, piece);
    const ghost = getGhostPiece(board, piece);
    expect(ghost.y).toBe(piece.y + distance);
    expect(isGrounded(board, ghost)).toBe(true);
  });
});
