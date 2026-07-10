import { useGameStore } from '../store/game-store';

export function Hud() {
  const screen = useGameStore((s) => s.screen);
  const score = useGameStore((s) => s.score);
  const level = useGameStore((s) => s.level);
  const totalLines = useGameStore((s) => s.totalLines);
  const controls = useGameStore((s) => s.controls);

  if (screen === 'title') return null;

  return (
    <div className="hud">
      <div className="hud-stat">
        <span>SCORE</span>
        <strong>{score.toLocaleString()}</strong>
      </div>
      <div className="hud-stat">
        <span>LEVEL</span>
        <strong>{level}</strong>
      </div>
      <div className="hud-stat">
        <span>LINES</span>
        <strong>{totalLines}</strong>
      </div>
      {screen === 'playing' && (
        <button className="pause-button" onClick={() => controls?.pauseGame()} aria-label="일시정지">
          ⏸
        </button>
      )}
    </div>
  );
}
