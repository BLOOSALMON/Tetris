import { describe, expect, it } from 'vitest';
import { TETROMINO_TYPES } from '../config/tetrominoes';
import { SevenBagGenerator } from './seven-bag';

describe('SevenBagGenerator', () => {
  it('7개를 뽑으면 7종 테트로미노가 정확히 한 번씩 나온다', () => {
    const bag = new SevenBagGenerator();
    const drawn = Array.from({ length: 7 }, () => bag.next());
    expect([...drawn].sort()).toEqual([...TETROMINO_TYPES].sort());
  });

  it('한 세트가 소진되면 다시 셔플되어 편향 없이 이어진다', () => {
    const bag = new SevenBagGenerator();
    const drawn = Array.from({ length: 14 }, () => bag.next());
    const firstSet = drawn.slice(0, 7);
    const secondSet = drawn.slice(7, 14);
    expect([...firstSet].sort()).toEqual([...TETROMINO_TYPES].sort());
    expect([...secondSet].sort()).toEqual([...TETROMINO_TYPES].sort());
  });

  it('peek은 큐를 소비하지 않고 다음 블록들을 미리 보여준다', () => {
    const bag = new SevenBagGenerator();
    const peeked = bag.peek(5);
    expect(peeked).toHaveLength(5);
    const drawn = Array.from({ length: 5 }, () => bag.next());
    expect(drawn).toEqual(peeked);
  });

  it('시드된 rng를 넣으면 결정적인 순서를 만든다', () => {
    function createSeededRng(seed: number): () => number {
      let state = seed;
      return () => {
        state = (state * 1103515245 + 12345) & 0x7fffffff;
        return (state % 1000) / 1000;
      };
    }

    const bagA = new SevenBagGenerator(createSeededRng(42));
    const bagB = new SevenBagGenerator(createSeededRng(42));

    const drawnA = Array.from({ length: 7 }, () => bagA.next());
    const drawnB = Array.from({ length: 7 }, () => bagB.next());
    expect(drawnA).toEqual(drawnB);
  });
});
