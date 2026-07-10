import { describe, expect, it } from 'vitest';
import {
  computeHardDropScore,
  computeLevel,
  computeLineClearScore,
  computeSoftDropScore,
} from './scoring';

describe('computeLineClearScore', () => {
  it('PRD 점수표에 따라 라인 수와 레벨에 비례한 점수를 계산한다', () => {
    expect(computeLineClearScore(1, 1)).toBe(100);
    expect(computeLineClearScore(2, 1)).toBe(300);
    expect(computeLineClearScore(3, 1)).toBe(500);
    expect(computeLineClearScore(4, 1)).toBe(800);
    expect(computeLineClearScore(4, 3)).toBe(2400);
  });

  it('0줄이거나 4줄을 초과하면 0점이다', () => {
    expect(computeLineClearScore(0, 5)).toBe(0);
    expect(computeLineClearScore(5, 5)).toBe(0);
  });
});

describe('computeSoftDropScore / computeHardDropScore', () => {
  it('소프트 드롭은 칸당 1점, 하드 드롭은 칸당 2점이다', () => {
    expect(computeSoftDropScore(5)).toBe(5);
    expect(computeHardDropScore(5)).toBe(10);
  });
});

describe('computeLevel', () => {
  it('누적 10라인마다 레벨이 1씩 오른다', () => {
    expect(computeLevel(0)).toBe(1);
    expect(computeLevel(9)).toBe(1);
    expect(computeLevel(10)).toBe(2);
    expect(computeLevel(25)).toBe(3);
  });
});
