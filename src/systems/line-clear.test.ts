import { describe, expect, it } from 'vitest';
import { BOARD_WIDTH } from '../config/board';
import { createEmptyBoard } from './board';
import { clearLines, findFullLines } from './line-clear';

function fillRow(board: ReturnType<typeof createEmptyBoard>, row: number): void {
  for (let x = 0; x < BOARD_WIDTH; x++) {
    board[row][x] = 'I';
  }
}

describe('findFullLines', () => {
  it('빈 보드에서는 완성된 줄이 없다', () => {
    const board = createEmptyBoard();
    expect(findFullLines(board)).toEqual([]);
  });

  it('가로 한 줄이 모두 채워지면 해당 줄을 찾아낸다', () => {
    const board = createEmptyBoard();
    fillRow(board, 10);
    expect(findFullLines(board)).toEqual([10]);
  });

  it('여러 줄(최대 4줄, 테트리스)을 동시에 판정한다', () => {
    const board = createEmptyBoard();
    [5, 6, 7, 8].forEach((row) => fillRow(board, row));
    expect(findFullLines(board)).toEqual([5, 6, 7, 8]);
  });

  it('한 칸이라도 비어있으면 완성된 줄로 판정하지 않는다', () => {
    const board = createEmptyBoard();
    fillRow(board, 3);
    board[3][0] = null;
    expect(findFullLines(board)).toEqual([]);
  });
});

describe('clearLines', () => {
  it('완성된 줄을 제거하고 위쪽 줄들을 한 칸씩 내린다', () => {
    const board = createEmptyBoard();
    board[10][0] = 'T';
    fillRow(board, 11);

    const cleared = clearLines(board, [11]);

    expect(cleared[11][0]).toBe('T');
    expect(cleared[0].every((cell) => cell === null)).toBe(true);
    expect(cleared.length).toBe(board.length);
  });

  it('제거할 줄이 없으면 보드를 그대로 반환한다', () => {
    const board = createEmptyBoard();
    expect(clearLines(board, [])).toBe(board);
  });
});
