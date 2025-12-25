import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Character } from '@/types/game';
import { CharacterSelect, characters } from './CharacterSelect';
import { GameCanvas } from './GameCanvas';
import { GameOver } from './GameOver';
import { AdminPanel } from './AdminPanel';
import { AdminLogin } from './AdminLogin';
import { AddCharacter } from './AddCharacter';
import { DeleteCharacter } from './DeleteCharacter';
import { Leaderboard } from './Leaderboard';
import { useGameAudio } from '@/hooks/useGameAudio';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const HIGH_SCORE_KEY = 'gandu-khela-highscore';

export const FlappyGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [gameCharacters, setGameCharacters] = useState<Character[]>(characters);

  // Audio hook
  const { stopMusic, playDeathSound } = useGameAudio(
    selectedCharacter?.id ?? null,
    gameState === 'playing'
  );

  // Load high score from localStorage as fallback
  useEffect(() => {
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  // Save high score locally and to cloud
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem(HIGH_SCORE_KEY, score.toString());
    }
  }, [score, highScore]);

  // Save score to cloud when game ends
  const saveScoreToCloud = async (characterId: number, characterName: string, finalScore: number) => {
    try {
      // First get current high score for this character
      const { data: existing } = await supabase
        .from('character_scores')
        .select('high_score')
        .eq('character_id', characterId)
        .maybeSingle();

      const currentHigh = existing?.high_score || 0;

      if (finalScore > currentHigh) {
        await supabase
          .from('character_scores')
          .upsert({
            character_id: characterId,
            character_name: characterName,
            high_score: finalScore,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'character_id'
          });
      }
    } catch (error) {
      console.log('Could not save score to cloud:', error);
    }
  };

  const handleCharacterSelect = useCallback((character: Character) => {
    setSelectedCharacter(character);
    setScore(0);
    setShowScore(false);
    setGameState('playing');
  }, []);

  const handleGameOver = useCallback(async (finalScore: number) => {
    setScore(finalScore);
    setShowScore(false);
    setGameState('gameover');
    
    // Save score to cloud
    if (selectedCharacter) {
      saveScoreToCloud(selectedCharacter.id, selectedCharacter.name, finalScore);
      await playDeathSound(selectedCharacter.id);
    }
    
    setShowScore(true);
  }, [selectedCharacter, playDeathSound]);

  const handleRestart = useCallback(() => {
    stopMusic();
    setGameState('menu');
    setSelectedCharacter(null);
    setScore(0);
    setShowScore(false);
  }, [stopMusic]);

  const handleAdminClick = useCallback(() => {
    setGameState('admin_login');
  }, []);

  const handleAdminLoginSuccess = useCallback(() => {
    setGameState('admin');
  }, []);

  const handleAddCharacter = useCallback((photo: File, runSong: File | null, deathSound: File | null) => {
    // For now, create a local character with the uploaded photo
    const newId = gameCharacters.length + 1;
    const photoUrl = URL.createObjectURL(photo);
    
    const newChar: Character = {
      id: newId,
      image: photoUrl,
      name: `Player ${newId}`
    };
    
    setGameCharacters(prev => [...prev, newChar]);
    toast.success(`Character ${newId} added!`);
    setGameState('admin');
  }, [gameCharacters]);

  const handleDeleteCharacter = useCallback((characterId: number) => {
    if (gameCharacters.length <= 1) {
      toast.error('Cannot delete the last character!');
      return;
    }
    
    setGameCharacters(prev => prev.filter(c => c.id !== characterId));
    toast.success('Character deleted!');
  }, [gameCharacters]);

  // Handle restart with keyboard in gameover state
  useEffect(() => {
    if (gameState !== 'gameover' || !showScore) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleRestart();
      }
    };

    const handleTouch = () => {
      setTimeout(handleRestart, 100);
    };

    window.addEventListener('keydown', handleKeyDown);
    const timer = setTimeout(() => {
      window.addEventListener('touchstart', handleTouch);
    }, 500);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouch);
      clearTimeout(timer);
    };
  }, [gameState, showScore, handleRestart]);

  return (
    <div className="relative w-full h-full overflow-hidden game-container">
      {/* Background Canvas */}
      {selectedCharacter && (
        <GameCanvas
          character={selectedCharacter}
          onGameOver={handleGameOver}
          isPlaying={gameState === 'playing'}
        />
      )}

      {/* Menu State */}
      {gameState === 'menu' && (
        <>
          <CharacterSelect 
            onSelect={handleCharacterSelect} 
            highScore={highScore}
            onAdminClick={handleAdminClick}
            characters={gameCharacters}
          />
          <Leaderboard />
        </>
      )}

      {/* Admin Login */}
      {gameState === 'admin_login' && (
        <AdminLogin
          onSuccess={handleAdminLoginSuccess}
          onBack={() => setGameState('menu')}
        />
      )}

      {/* Admin Panel */}
      {gameState === 'admin' && (
        <AdminPanel
          onAddCharacter={() => setGameState('add_char')}
          onDeleteCharacter={() => setGameState('delete_char')}
          onBack={() => setGameState('menu')}
        />
      )}

      {/* Add Character */}
      {gameState === 'add_char' && (
        <AddCharacter
          onBack={() => setGameState('admin')}
          onAdd={handleAddCharacter}
        />
      )}

      {/* Delete Character */}
      {gameState === 'delete_char' && (
        <DeleteCharacter
          characters={gameCharacters}
          onBack={() => setGameState('admin')}
          onDelete={handleDeleteCharacter}
        />
      )}

      {/* Game Over Overlay */}
      {gameState === 'gameover' && selectedCharacter && (
        <GameOver
          score={score}
          highScore={highScore}
          onRestart={handleRestart}
          showScore={showScore}
          characterId={selectedCharacter.id}
        />
      )}
    </div>
  );
};
