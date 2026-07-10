import { create } from 'zustand';
import type { TetrominoType } from '../config/tetrominoes';
import { loadHighScore, saveHighScore } from '../systems/high-score';

export type AppScreen = 'title' | 'playing' | 'paused' | 'gameover';

export interface GameControls {
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  restartGame: () => void;
  quitToTitle: () => void;
}

interface HudState {
  score: number;
  level: number;
  totalLines: number;
  hold: TetrominoType | null;
  next: TetrominoType[];
}

interface GameStoreState extends HudState {
  screen: AppScreen;
  highScore: number;
  isNewHighScore: boolean;
  controls: GameControls | null;
  setScreen: (screen: AppScreen) => void;
  updateHud: (hud: HudState) => void;
  reportGameOver: (finalScore: number) => void;
  registerControls: (controls: GameControls) => void;
}

const initialHud: HudState = {
  score: 0,
  level: 1,
  totalLines: 0,
  hold: null,
  next: [],
};

export const useGameStore = create<GameStoreState>((set) => ({
  screen: 'title',
  highScore: loadHighScore(),
  isNewHighScore: false,
  controls: null,
  ...initialHud,

  setScreen: (screen) => set({ screen }),

  updateHud: (hud) => set(hud),

  reportGameOver: (finalScore) =>
    set((state) => {
      const isNewHighScore = finalScore > state.highScore;
      const highScore = isNewHighScore ? finalScore : state.highScore;
      if (isNewHighScore) saveHighScore(highScore);
      return { screen: 'gameover', highScore, isNewHighScore };
    }),

  registerControls: (controls) => set({ controls }),
}));
