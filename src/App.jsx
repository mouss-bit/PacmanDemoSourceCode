import React, { Suspense } from 'react';
import Game from './components/Game';
import { GameUI, StartScreen, ReadyScreen, GameOverScreen } from './components/UI';

function LoadingScreen() {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#000', color: '#ffff00',
      fontFamily: "'Press Start 2P', cursive", fontSize: '24px',
      textShadow: '0 0 10px #ffff00',
    }}>
      LOADING...
    </div>
  );
}

function App() {
  return (
    <div className="game-container">
      <Suspense fallback={<LoadingScreen />}>
        <Game />
      </Suspense>
      <GameUI />
      <StartScreen />
      <ReadyScreen />
      <GameOverScreen />
    </div>
  );
}

export default App;
