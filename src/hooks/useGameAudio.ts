import { useRef, useEffect, useCallback } from 'react';

// Audio file paths per character
const characterMusic: Record<number, string> = {
  1: '/audio/run-main.mp3',
  2: '/audio/run-main.mp3',
  3: '/audio/run-main.mp3',
  4: '/audio/run-char4.mp3', // CID dubbing song
  5: '/audio/run-main.mp3',
  6: '/audio/run-char6.mp3', // Tunak Tunak Tun song
};

export const useGameAudio = (characterId: number | null, isPlaying: boolean) => {
  const musicRef = useRef<HTMLAudioElement | null>(null);

  // Initialize and control music
  useEffect(() => {
    // Cleanup previous audio
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.src = '';
      musicRef.current = null;
    }

    if (!characterId || !isPlaying) return;

    const musicPath = characterMusic[characterId];

    // Create new audio element
    const audio = new Audio(musicPath);
    audio.loop = true;
    audio.volume = 0.5;
    musicRef.current = audio;

    // Play music
    const playMusic = async () => {
      try {
        await audio.play();
      } catch (error) {
        console.log('Audio autoplay blocked, waiting for user interaction');
      }
    };

    playMusic();

    return () => {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current.src = '';
        musicRef.current = null;
      }
    };
  }, [characterId, isPlaying]);

  // Stop music function
  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }
  }, []);

  // Play death sound
  const playDeathSound = useCallback((charId: number) => {
    // Stop the running music first
    stopMusic();
    
    // Death sounds can be added here per character
    // For now, just stop the music
  }, [stopMusic]);

  return { stopMusic, playDeathSound };
};
