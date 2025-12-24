import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Character } from '@/types/game';
import { CharacterSelect } from './CharacterSelect';
import { GameCanvas } from './GameCanvas';
import { GameOver } from './GameOver';

const HIGH_SCORE_KEY = 'gandu-khela-highscore';

export const FlappyGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  // Save high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem(HIGH_SCORE_KEY, score.toString());
    }
  }, [score, highScore]);

  const handleCharacterSelect = useCallback((character: Character) => {
    setSelectedCharacter(character);
    setScore(0);
    setGameState('playing');
  }, []);

  const handleGameOver = useCallback((finalScore: number) => {
    setScore(finalScore);
    setGameState('gameover');
  }, []);

  const handleRestart = useCallback(() => {
    setGameState('menu');
    setSelectedCharacter(null);
    setScore(0);
  }, []);

  // Handle restart with keyboard in gameover state
  useEffect(() => {
    if (gameState !== 'gameover') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleRestart();
      }
    };

    const handleTouch = (e: TouchEvent) => {
      // Slight delay to prevent accidental restart
      setTimeout(handleRestart, 100);
    };

    window.addEventListener('keydown', handleKeyDown);
    // Add touch listener with delay
    const timer = setTimeout(() => {
      window.addEventListener('touchstart', handleTouch);
    }, 500);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouch);
      clearTimeout(timer);
    };
  }, [gameState, handleRestart]);

  return (
    <div className="relative w-full h-full overflow-hidden game-container">
      {/* Background Canvas (always visible) */}
      {selectedCharacter && (
        <GameCanvas
          character={selectedCharacter}
          onGameOver={handleGameOver}
          isPlaying={gameState === 'playing'}
        />
      )}

      {/* Menu State */}
      {gameState === 'menu' && (
        <CharacterSelect 
          onSelect={handleCharacterSelect} 
          highScore={highScore}
        />
      )}

      {/* Game Over Overlay */}
      {gameState === 'gameover' && (
        <GameOver
          score={score}
          highScore={highScore}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
};
