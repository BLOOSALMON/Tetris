import { BOARD_VISIBLE_HEIGHT, BOARD_WIDTH } from './board';

export const CELL_SIZE = 30;
export const PREVIEW_CELL_SIZE = 18;

export const BOARD_PIXEL_WIDTH = BOARD_WIDTH * CELL_SIZE;
export const BOARD_PIXEL_HEIGHT = BOARD_VISIBLE_HEIGHT * CELL_SIZE;

export const SIDE_PANEL_WIDTH = 130;
export const CANVAS_MARGIN = 20;

export const CANVAS_WIDTH = SIDE_PANEL_WIDTH * 2 + BOARD_PIXEL_WIDTH + CANVAS_MARGIN * 2;
export const CANVAS_HEIGHT = BOARD_PIXEL_HEIGHT + CANVAS_MARGIN * 2;

export const BOARD_X = CANVAS_MARGIN + SIDE_PANEL_WIDTH;
export const BOARD_Y = CANVAS_MARGIN;

export const HOLD_PANEL_X = CANVAS_MARGIN;
export const HOLD_PANEL_Y = CANVAS_MARGIN;

export const NEXT_PANEL_X = BOARD_X + BOARD_PIXEL_WIDTH + CANVAS_MARGIN;
export const NEXT_PANEL_Y = CANVAS_MARGIN;

export const NEXT_SLOT_HEIGHT = 90;

// 여름 젤리 컨셉: Phaser 캔버스는 투명하게 두고(뒤에 CSS 배경 일러스트가 비침),
// 보드/패널은 반투명 유리(글래스모피즘) 패널로 표현한다.
export const GLASS_FILL_COLOR = 0xffffff;
export const GLASS_FILL_ALPHA = 0.5;
export const GLASS_BORDER_COLOR = 0xffffff;
export const GLASS_BORDER_ALPHA = 0.85;

export const GRID_LINE_COLOR = 0x2e93c9;
export const GRID_LINE_ALPHA = 0.16;

export const JELLY_HIGHLIGHT_ALPHA = 0.55;
export const JELLY_SHADOW_ALPHA = 0.28;
export const JELLY_CORNER_RADIUS = 8;

export const INK_TEXT_COLOR = '#123247';
export const PANEL_LABEL_COLOR = '#2b5468';
export const CREAM_TEXT_COLOR = '#fff8e8';
