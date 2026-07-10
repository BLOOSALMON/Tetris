import { useGameStore } from '../store/game-store';

export function PauseOverlay() {
  const screen = useGameStore((s) => s.screen);
  const controls = useGameStore((s) => s.controls);

  if (screen !== 'paused') return null;

  return (
    <div className="overlay">
      <div className="panel">
        <h2>일시정지</h2>
        <button className="primary" onClick={() => controls?.resumeGame()}>
          이어하기
        </button>
        <button onClick={() => controls?.restartGame()}>재시작</button>
        <button onClick={() => controls?.quitToTitle()}>타이틀로 나가기</button>
      </div>
    </div>
  );
}
