export const MIN_DROP_INTERVAL_MS = 50;

export function getDropIntervalMs(level: number): number {
  const secondsPerRow = Math.pow(0.8 - (level - 1) * 0.007, level - 1);
  return Math.max(secondsPerRow * 1000, MIN_DROP_INTERVAL_MS);
}
