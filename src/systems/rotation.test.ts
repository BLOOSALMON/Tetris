import { describe, expect, it } from 'vitest';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../config/board';
import type { Board } from './board';
import { createEmptyBoard } from './board';
import { getOccupiedCells } from './piece';
import type { ActivePiece } from './piece';
import { getNextRotation, tryRotate } from './rotation';

function fillBoardExcept(piece: ActivePiece): Board {
  const board = createEmptyBoard();
  const occupied = new Set(getOccupiedCells(piece).map(({ x, y }) => `${x},${y}`));
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      if (!occupied.has(`${x},${y}`)) board[y][x] = 'I';
    }
  }
  return board;
}

describe('getNextRotation', () => {
  it('시계 방향으로 0->1->2->3->0 순환한다', () => {
    expect(getNextRotation(0, 'CW')).toBe(1);
    expect(getNextRotation(3, 'CW')).toBe(0);
  });

  it('반시계 방향으로 0->3->2->1->0 순환한다', () => {
    expect(getNextRotation(0, 'CCW')).toBe(3);
    expect(getNextRotation(1, 'CCW')).toBe(0);
  });
});

describe('tryRotate', () => {
  it('열린 공간에서는 킥 없이 회전이 성공한다', () => {
    const board = createEmptyBoard();
    const piece: ActivePiece = { type: 'T', rotation: 0, x: 4, y: 10 };
    const rotated = tryRotate(board, piece, 'CW');
    expect(rotated).not.toBeNull();
    expect(rotated?.rotation).toBe(1);
  });

  it('주변이 완전히 막혀 모든 킥이 실패하면 회전을 취소(null)한다', () => {
    const piece: ActivePiece = { type: 'T', rotation: 0, x: 4, y: 10 };
    const board = fillBoardExcept(piece);
    const rotated = tryRotate(board, piece, 'CW');
    expect(rotated).toBeNull();
  });

  it('벽 근처에서는 SRS 킥 테이블을 적용해 보정된 위치로 회전한다', () => {
    const board = createEmptyBoard();
    const piece: ActivePiece = { type: 'I', rotation: 0, x: 0, y: 10 };
    const rotated = tryRotate(board, piece, 'CW');
    expect(rotated).not.toBeNull();
    expect(rotated?.rotation).toBe(1);
  });
});
