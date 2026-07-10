import { useGameStore } from '../store/game-store';
import { Logo } from './Logo';

export function TitleScreen() {
  const screen = useGameStore((s) => s.screen);
  const controls = useGameStore((s) => s.controls);
  const highScore = useGameStore((s) => s.highScore);

  if (screen !== 'title') return null;

  return (
    <div className="overlay">
      <div className="panel">
        <Logo />
        <p className="high-score">최고 점수: {highScore.toLocaleString()}</p>
        <button className="primary" onClick={() => controls?.startGame()}>
          시작하기
        </button>
        <div className="controls-help">
          <p>← → 이동 · ↓ 소프트드롭 · Space 하드드롭</p>
          <p>↑ / X 시계방향 회전 · Z 반시계방향 회전</p>
          <p>C 홀드 · Esc 일시정지</p>
        </div>
      </div>
    </div>
  );
}
