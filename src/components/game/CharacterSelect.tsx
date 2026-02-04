import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Character } from '@/types/game';

// Import character images for defaults
import char1 from '@/assets/char1.jpg';
import char2 from '@/assets/char2.jpg';
import char3 from '@/assets/char3.jpg';
import char4 from '@/assets/char4.jpg';
import char5 from '@/assets/char5.jpg';
import char6 from '@/assets/char6.jpg';

// Preloaded image cache - stores actual loaded Image objects
export const preloadedImages: Map<string, HTMLImageElement> = new Map();

// Default character images map for built-in characters
export const defaultCharacterImages: Record<number, string> = {
  1: char1,
  2: char2,
  3: char3,
  4: char4,
  5: char5,
  6: char6,
};

interface CharacterSelectProps {
  onSelect: (character: Character) => void;
  highScore: number;
  onAdminClick?: () => void;
  characters: Character[];
  loading?: boolean;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ 
  onSelect, 
  highScore, 
  onAdminClick,
  characters,
  loading
}) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Preload all character images
  useEffect(() => {
    if (characters.length === 0) return;

    const loadImages = async () => {
      const promises = characters.map((char) => {
        return new Promise<void>((resolve) => {
          if (preloadedImages.has(char.image)) {
            resolve();
            return;
          }
          
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            preloadedImages.set(char.image, img);
            resolve();
          };
          img.onerror = () => {
            console.warn(`Failed to preload image: ${char.image}`);
            resolve();
          };
          img.src = char.image;
          
          if (img.complete) {
            preloadedImages.set(char.image, img);
            resolve();
          }
        });
      });

      await Promise.all(promises);
      setImagesLoaded(true);
    };

    loadImages();
  }, [characters]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-sky-top to-sky-bottom">
      {/* Admin Button */}
      {onAdminClick && (
        <button
          onClick={onAdminClick}
          className="absolute top-4 right-4 px-3 py-1.5 text-xs font-game text-muted-foreground/60 
                     hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200
                     border border-transparent hover:border-primary/30"
        >
          Admin
        </button>
      )}

      {/* Decorative clouds */}
      <div className="absolute top-[10%] left-[10%] w-16 h-8 bg-white/80 rounded-full blur-sm animate-float" style={{ animationDelay: '0s' }} />
      <div className="absolute top-[15%] right-[15%] w-20 h-10 bg-white/70 rounded-full blur-sm animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[25%] left-[20%] w-12 h-6 bg-white/60 rounded-full blur-sm animate-float" style={{ animationDelay: '2s' }} />

      {/* Title */}
      <div className="text-center mb-6 animate-bounce-slow">
        <p className="font-game text-xl md:text-2xl font-bold text-green-500 mb-1">
          Tap Tap
        </p>
        <h1 className="font-bengali text-4xl md:text-5xl font-bold text-foreground text-shadow-game mb-2">
          গান্ডু খেলা
        </h1>
        <p className="font-game text-xl md:text-2xl text-primary">
          Choose Your Character
        </p>
        {highScore > 0 && (
          <p className="font-game text-lg text-secondary mt-2">
            High Score: {highScore}
          </p>
        )}
      </div>

      {/* Character Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Loading characters...</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-sm w-full max-h-[50vh] overflow-y-auto">
          {characters.map((char, index) => (
            <button
              key={char.id}
              onClick={() => onSelect(char)}
              className="group relative aspect-square rounded-xl overflow-hidden border-4 border-primary/30 
                         hover:border-primary hover:scale-105 transition-all duration-200
                         shadow-lg hover:shadow-xl hover:shadow-primary/30 animate-pulse-glow"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img 
                src={char.image} 
                alt={char.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              {/* Number badge */}
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-primary text-primary-foreground 
                            rounded-full flex items-center justify-center font-game text-sm shadow-md">
                {index + 1}
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-200" />
            </button>
          ))}
        </div>
      )}

      {/* Instructions */}
      <p className="mt-6 text-muted-foreground font-bengali text-sm text-center">
        Tap a character to start playing!
      </p>

      {/* Footer */}
      <div className="absolute bottom-4 flex flex-col items-center gap-1">
        <p className="text-2xl font-bold text-primary font-bengali">
          Created by RONY
        </p>
        <Link 
          to="/privacy-policy" 
          className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
        >
          Privacy Policy
        </Link>
      </div>
    </div>
  );
};
