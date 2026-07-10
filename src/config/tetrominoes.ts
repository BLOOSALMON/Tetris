import { BOARD_BUFFER_HEIGHT, BOARD_WIDTH } from './board';

export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface Cell {
  x: number;
  y: number;
}

export type RotationState = 0 | 1 | 2 | 3;

export const TETROMINO_TYPES: readonly TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

// 여름 젤리 컨셉 팔레트: 각 조각을 과일/바다 모티프 색으로 매핑
export const TETROMINO_COLORS: Record<TetrominoType, number> = {
  I: 0x46cbef, // 소다블루 (하늘)
  O: 0xffde59, // 레몬옐로우
  T: 0xff86a8, // 수박핑크 (과육)
  S: 0x46d9a0, // 민트 (수박 껍질)
  Z: 0xf5424b, // 수박레드 (과육 심)
  J: 0x3667d6, // 코발트블루 (깊은 파도)
  L: 0xffa23c, // 망고오렌지
};

const TETROMINO_BOX_SIZE: Record<TetrominoType, number> = {
  I: 4,
  O: 4,
  T: 3,
  S: 3,
  Z: 3,
  J: 3,
  L: 3,
};

// 각 조각의 회전 상태(0=spawn, 1=R, 2=180, 3=L)별 셀 좌표. y는 아래 방향이 +.
const TETROMINO_SHAPES: Record<TetrominoType, Record<RotationState, Cell[]>> = {
  I: {
    0: [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
    ],
    1: [
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 2, y: 3 },
    ],
    2: [
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
    ],
    3: [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 1, y: 3 },
    ],
  },
  O: {
    0: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    1: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    2: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    3: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
  },
  T: {
    0: [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    1: [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
    ],
    2: [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
    ],
    3: [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ],
  },
  S: {
    0: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
    1: [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
    ],
    2: [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
    ],
    3: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ],
  },
  Z: {
    0: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    1: [
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
    ],
    2: [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
    ],
    3: [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 0, y: 2 },
    ],
  },
  J: {
    0: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    1: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ],
    2: [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
    ],
    3: [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
    ],
  },
  L: {
    0: [
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    1: [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
    ],
    2: [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 0, y: 2 },
    ],
    3: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ],
  },
};

export function getTetrominoCells(type: TetrominoType, rotation: RotationState): Cell[] {
  return TETROMINO_SHAPES[type][rotation];
}

export function getSpawnPosition(type: TetrominoType): Cell {
  const boxSize = TETROMINO_BOX_SIZE[type];
  return {
    x: Math.floor((BOARD_WIDTH - boxSize) / 2),
    y: BOARD_BUFFER_HEIGHT - 1,
  };
}
