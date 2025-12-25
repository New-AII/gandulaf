import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Character } from '@/types/game';
import { CharacterSelect, defaultCharacterImages } from './CharacterSelect';
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
  const [gameCharacters, setGameCharacters] = useState<Character[]>([]);
  const [loadingCharacters, setLoadingCharacters] = useState(true);

  // Audio hook - now passes the full character object
  const { stopMusic, playDeathSound } = useGameAudio(
    selectedCharacter,
    gameState === 'playing'
  );

  // Load characters from cloud
  const loadCharacters = useCallback(async () => {
    setLoadingCharacters(true);
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      if (data) {
        const chars: Character[] = data.map(row => ({
          id: row.id,
          // Use local image for defaults, cloud URL for custom
          image: row.is_default ? (defaultCharacterImages[row.id] || row.image_url) : row.image_url,
          name: row.name,
          isDefault: row.is_default,
          runAudioUrl: row.run_audio_url,
          deathAudioUrl: row.death_audio_url
        }));
        setGameCharacters(chars);
      }
    } catch (error) {
      console.error('Error loading characters:', error);
      toast.error('Failed to load characters');
    } finally {
      setLoadingCharacters(false);
    }
  }, []);

  // Load characters on mount
  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

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
  const saveScoreToCloud = async (character: Character, finalScore: number) => {
    try {
      // First get current high score for this character
      const { data: existing } = await supabase
        .from('character_scores')
        .select('high_score')
        .eq('character_id', character.id)
        .maybeSingle();

      const currentHigh = existing?.high_score || 0;

      if (finalScore > currentHigh) {
        await supabase
          .from('character_scores')
          .upsert({
            character_id: character.id,
            character_name: `Character ${character.id}`,
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
      saveScoreToCloud(selectedCharacter, finalScore);
      await playDeathSound(selectedCharacter);
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

  const handleAddCharacter = useCallback(() => {
    // Reload characters from cloud
    loadCharacters();
    setGameState('admin');
  }, [loadCharacters]);

  const handleDeleteCharacter = useCallback((deletedId: number) => {
    // Remove immediately from local state so it disappears everywhere
    setGameCharacters((prev) => prev.filter((c) => c.id !== deletedId));

    // Safety: if somehow the deleted character was selected, reset it
    setSelectedCharacter((prev) => (prev?.id === deletedId ? null : prev));

    // Reload characters from cloud
    loadCharacters();
    setGameState('admin');
  }, [loadCharacters]);

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
            loading={loadingCharacters}
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
          characterImage={selectedCharacter.image}
        />
      )}
    </div>
  );
};
