import React from 'react';
import useGameStore from '../hooks/useGameStore';

export function GameUI() {
  const score = useGameStore((state) => state.score);
  const highScore = useGameStore((state) => state.highScore);
  const lives = useGameStore((state) => state.lives);
  const level = useGameStore((state) => state.level);
  const powerMode = useGameStore((state) => state.powerMode);
  const gameState = useGameStore((state) => state.gameState);

  if (gameState === 'start' || gameState === 'gameover' || gameState === 'win') return null;

  return (
    <>
      <div className="ui-overlay">
        <div className="score-display">
          <div className="score-label">SCORE</div>
          <div className="score-value">{score.toString().padStart(6, '0')}</div>
        </div>
        <div className="high-score score-display">
          <div className="score-label">HIGH SCORE</div>
          <div className="score-value">{highScore.toString().padStart(6, '0')}</div>
        </div>
        <div className="lives-display">
          {Array.from({ length: lives }, (_, i) => <div key={i} className="life-icon" />)}
        </div>
      </div>
      <div className="level-display">LEVEL {level}</div>
      {powerMode && <div className="power-mode">POWER!</div>}
    </>
  );
}

export function StartScreen() {
  const gameState = useGameStore((state) => state.gameState);
  const startGame = useGameStore((state) => state.startGame);

  if (gameState !== 'start') return null;

  return (
    <div className="start-screen">
      <h1 className="game-title">PAC-MAN</h1>
      <p className="game-subtitle">3D EDITION</p>
      <button className="start-button" onClick={startGame}>START GAME</button>
      <div className="controls-info">
        <p className="controls-title">CONTROLS</p>
        <div className="controls-keys">
          <div className="key-group">
            <div className="arrow-keys">
              <div className="key">↑</div>
              <div className="key">←</div>
              <div className="key">↓</div>
              <div className="key">→</div>
            </div>
            <span>Arrow Keys</span>
          </div>
          <div className="key-group" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}><div className="key">W</div></div>
            <div style={{ display: 'flex', gap: '4px' }}><div className="key">A</div><div className="key">S</div><div className="key">D</div></div>
            <span>WASD</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReadyScreen() {
  const gameState = useGameStore((state) => state.gameState);
  if (gameState !== 'ready') return null;
  return <div className="ready-text">READY!</div>;
}

export function GameOverScreen() {
  const gameState = useGameStore((state) => state.gameState);
  const score = useGameStore((state) => state.score);
  const restartGame = useGameStore((state) => state.restartGame);

  if (gameState !== 'gameover' && gameState !== 'win') return null;
  const isWin = gameState === 'win';

  return (
    <div className="game-over-screen">
      <h1 className={`game-over-title ${isWin ? 'win' : ''}`}>{isWin ? 'YOU WIN!' : 'GAME OVER'}</h1>
      <p className="final-score">FINAL SCORE: {score}</p>
      <button className="restart-button" onClick={restartGame}>PLAY AGAIN</button>
    </div>
  );
}
