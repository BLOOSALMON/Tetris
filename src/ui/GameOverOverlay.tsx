import { useGameStore } from '../store/game-store';

export function GameOverOverlay() {
  const screen = useGameStore((s) => s.screen);
  const controls = useGameStore((s) => s.controls);
  const score = useGameStore((s) => s.score);
  const highScore = useGameStore((s) => s.highScore);
  const isNewHighScore = useGameStore((s) => s.isNewHighScore);

  if (screen !== 'gameover') return null;

  return (
    <div className="overlay">
      <div className="panel">
        <h2>게임 오버</h2>
        <p className="score">{score.toLocaleString()}점</p>
        {isNewHighScore ? (
          <p className="new-record">최고 점수 갱신!</p>
        ) : (
          <p className="high-score">최고 점수: {highScore.toLocaleString()}</p>
        )}
        <button className="primary" onClick={() => controls?.restartGame()}>
          다시하기
        </button>
        <button onClick={() => controls?.quitToTitle()}>타이틀로 나가기</button>
      </div>
    </div>
  );
}
