import { HIGH_SCORE_STORAGE_KEY } from '../config/game';

export function loadHighScore(): number {
  if (typeof localStorage === 'undefined') return 0;
  const raw = localStorage.getItem(HIGH_SCORE_STORAGE_KEY);
  if (raw === null) return 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function saveHighScore(score: number): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(HIGH_SCORE_STORAGE_KEY, String(score));
}
