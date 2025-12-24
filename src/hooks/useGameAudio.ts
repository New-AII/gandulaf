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

// Death sounds per character
const characterDeathSound: Record<number, string> = {
  1: '/audio/death-char1.mp3', // Cid funny dub
  2: '/audio/death-char2.mp3', // ACP meme
  3: '/audio/death-char3.mp3', // Bohot kuch gadbad
  4: '/audio/death-char4.mp3', // ACP meme 2
  5: '/audio/death-char5.mp3', // Ek gand pe rapta
  6: '/audio/death-char6.mp3', // Hmmmm Rajaji
};

export const useGameAudio = (characterId: number | null, isPlaying: boolean) => {
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const deathSoundRef = useRef<HTMLAudioElement | null>(null);

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
    if (deathSoundRef.current) {
      deathSoundRef.current.pause();
      deathSoundRef.current.src = '';
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

    // Create and play death sound immediately
    const deathAudio = new Audio(deathSoundPath);
    deathAudio.volume = 0.7;
    deathSoundRef.current = deathAudio;

    return new Promise((resolve) => {
      deathAudio.onended = () => {
        resolve();
      };

      deathAudio.onerror = () => {
        resolve();
      };

      // Play immediately without delay
      deathAudio.play().catch(() => {
        resolve();
      });
    });
  }, []);

  return { stopMusic, playDeathSound };
};
