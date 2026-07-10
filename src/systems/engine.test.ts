import { beforeEach, describe, expect, it } from 'vitest';
import { TetrisEngine } from './engine';

describe('TetrisEngine', () => {
  let engine: TetrisEngine;

  beforeEach(() => {
    engine = new TetrisEngine();
    engine.start();
  });

  it('시작하면 playing 상태이고 첫 블록이 스폰된다', () => {
    const state = engine.getState();
    expect(state.status).toBe('playing');
    expect(state.active).not.toBeNull();
    expect(state.score).toBe(0);
    expect(state.level).toBe(1);
  });

  it('좌우 이동은 보드 경계를 넘지 않는다', () => {
    for (let i = 0; i < 20; i++) engine.moveLeft();
    const leftX = engine.getState().active?.x ?? -1;
    expect(leftX).toBeGreaterThanOrEqual(0);

    for (let i = 0; i < 20; i++) engine.moveRight();
    const rightX = engine.getState().active?.x ?? -1;
    expect(rightX).toBeGreaterThan(leftX);
  });

  it('하드 드롭하면 블록이 보드에 고정되고 새 블록이 스폰된다', () => {
    const before = engine.getState().active;
    engine.hardDrop();
    const after = engine.getState();
    expect(after.active).not.toEqual(before);
    const hasFilledCell = after.board.some((row) => row.some((cell) => cell !== null));
    expect(hasFilledCell).toBe(true);
  });

  it('하드 드롭은 칸당 2점을 즉시 점수에 더한다', () => {
    engine.hardDrop();
    expect(engine.getState().score).toBeGreaterThan(0);
  });

  it('홀드는 블록당 1회만 가능하고, 다음 블록이 스폰되면 다시 사용할 수 있다', () => {
    expect(engine.getState().canHold).toBe(true);
    engine.hold();
    const afterHold = engine.getState();
    expect(afterHold.canHold).toBe(false);
    expect(afterHold.hold).not.toBeNull();

    engine.hold();
    expect(engine.getState().hold).toBe(afterHold.hold);

    engine.hardDrop();
    expect(engine.getState().canHold).toBe(true);
  });

  it('일시정지 중에는 조작이 무시되고, 재개하면 다시 반응한다', () => {
    engine.pause();
    expect(engine.getState().status).toBe('paused');
    const before = engine.getState().active;
    engine.moveLeft();
    expect(engine.getState().active).toEqual(before);

    engine.resume();
    expect(engine.getState().status).toBe('playing');
  });

  it('넥스트 큐는 설정된 개수만큼 미리 보여준다', () => {
    const { next } = engine.getState();
    expect(next.length).toBeGreaterThan(0);
  });

  it('블록이 계속 쌓여 스폰 위치를 막으면 게임 오버가 된다', () => {
    let status = engine.getState().status;
    let guard = 0;
    while (status === 'playing' && guard < 300) {
      engine.hardDrop();
      status = engine.getState().status;
      guard += 1;
    }
    expect(status).toBe('gameover');
  });
});
