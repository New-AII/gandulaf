import { useRef, useEffect, useCallback } from 'react';

// Audio file paths per character
const characterMusic: Record<number, string> = {
  1: '/audio/run-main.mp3',
  2: '/audio/run-main.mp3',
  3: '/audio/run-main.mp3',
  4: '/audio/run-char4.mp3',
  5: '/audio/run-main.mp3',
  6: '/audio/run-char6.mp3',
};

// Death sounds per character
const characterDeathSound: Record<number, string> = {
  1: '/audio/death-char1.mp3',
  2: '/audio/death-char2.mp3',
  3: '/audio/death-char3.mp3',
  4: '/audio/death-char4.mp3',
  5: '/audio/death-char5.mp3',
  6: '/audio/death-char6.mp3',
};

// Preload all audio files on module load for faster playback
const preloadedAudio: Record<string, HTMLAudioElement> = {};

const preloadAudio = () => {
  // Preload music files
  Object.values(characterMusic).forEach((path) => {
    if (!preloadedAudio[path]) {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = path;
      preloadedAudio[path] = audio;
    }
  });

  // Preload death sounds
  Object.values(characterDeathSound).forEach((path) => {
    if (!preloadedAudio[path]) {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = path;
      preloadedAudio[path] = audio;
    }
  });
};

// Start preloading immediately
preloadAudio();

export const useGameAudio = (characterId: number | null, isPlaying: boolean) => {
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const deathSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize and control music
  useEffect(() => {
    // Cleanup previous audio
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
      musicRef.current = null;
    }

    if (!characterId || !isPlaying) return;

    const musicPath = characterMusic[characterId];

    // Use preloaded audio or create new one
    const audio = preloadedAudio[musicPath] 
      ? preloadedAudio[musicPath].cloneNode(true) as HTMLAudioElement
      : new Audio(musicPath);
    
    audio.loop = true;
    audio.volume = 0.5;
    musicRef.current = audio;

    // Play music immediately
    audio.play().catch(() => {
      // Autoplay blocked, will play on next user interaction
    });

    return () => {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current.currentTime = 0;
        musicRef.current = null;
      }
    };
  }, [characterId, isPlaying]);

  // Stop music function
  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
      musicRef.current = null;
    }
    if (deathSoundRef.current) {
      deathSoundRef.current.pause();
      deathSoundRef.current.currentTime = 0;
      deathSoundRef.current = null;
    }
  }, []);

  // Play death sound immediately and return a promise that resolves when it ends
  const playDeathSound = useCallback((charId: number): Promise<void> => {
    // Stop the running music immediately
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }

    const deathSoundPath = characterDeathSound[charId];

    // Use preloaded audio for faster playback
    const deathAudio = preloadedAudio[deathSoundPath]
      ? preloadedAudio[deathSoundPath].cloneNode(true) as HTMLAudioElement
      : new Audio(deathSoundPath);
    
    deathAudio.volume = 0.7;
    deathAudio.currentTime = 0;
    deathSoundRef.current = deathAudio;

    return new Promise((resolve) => {
      deathAudio.onended = () => {
        resolve();
      };

      deathAudio.onerror = () => {
        resolve();
      };

      // Play immediately
      deathAudio.play().catch(() => {
        resolve();
      });
    });
  }, []);

  return { stopMusic, playDeathSound };
};
