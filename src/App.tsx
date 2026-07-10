import { BeachBackground } from './ui/BeachBackground';
import { GameCanvas } from './ui/GameCanvas';
import { Hud } from './ui/Hud';
import { TitleScreen } from './ui/TitleScreen';
import { PauseOverlay } from './ui/PauseOverlay';
import { GameOverOverlay } from './ui/GameOverOverlay';
import './App.css';

function App() {
  return (
    <div className="app">
      <div className="game-stage">
        <BeachBackground />
        <GameCanvas />
        <Hud />
        <TitleScreen />
        <PauseOverlay />
        <GameOverOverlay />
      </div>
    </div>
  );
}

export default App;
