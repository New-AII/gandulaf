import React from 'react';
import { Character } from '@/types/game';

// Import character images
import char1 from '@/assets/char1.jpg';
import char2 from '@/assets/char2.jpg';
import char3 from '@/assets/char3.jpg';
import char4 from '@/assets/char4.jpg';
import char5 from '@/assets/char5.jpg';
import char6 from '@/assets/char6.jpg';

export const characters: Character[] = [
  { id: 1, image: char1, name: 'Player 1' },
  { id: 2, image: char2, name: 'Player 2' },
  { id: 3, image: char3, name: 'Player 3' },
  { id: 4, image: char4, name: 'Player 4' },
  { id: 5, image: char5, name: 'Player 5' },
  { id: 6, image: char6, name: 'Player 6' },
];

interface CharacterSelectProps {
  onSelect: (character: Character) => void;
  highScore: number;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ onSelect, highScore }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-sky-top to-sky-bottom">
      {/* Decorative clouds */}
      <div className="absolute top-[10%] left-[10%] w-16 h-8 bg-white/80 rounded-full blur-sm animate-float" style={{ animationDelay: '0s' }} />
      <div className="absolute top-[15%] right-[15%] w-20 h-10 bg-white/70 rounded-full blur-sm animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[25%] left-[20%] w-12 h-6 bg-white/60 rounded-full blur-sm animate-float" style={{ animationDelay: '2s' }} />

      {/* Title */}
      <div className="text-center mb-6 animate-bounce-slow">
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
      <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-sm w-full">
        {characters.map((char) => (
          <button
            key={char.id}
            onClick={() => onSelect(char)}
            className="group relative aspect-square rounded-xl overflow-hidden border-4 border-primary/30 
                       hover:border-primary hover:scale-105 transition-all duration-200
                       shadow-lg hover:shadow-xl hover:shadow-primary/30 animate-pulse-glow"
            style={{ animationDelay: `${char.id * 0.1}s` }}
          >
            <img 
              src={char.image} 
              alt={`Character ${char.id}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            {/* Number badge */}
            <div className="absolute bottom-1 right-1 w-6 h-6 bg-primary text-primary-foreground 
                          rounded-full flex items-center justify-center font-game text-sm shadow-md">
              {char.id}
            </div>
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-200" />
          </button>
        ))}
      </div>

      {/* Instructions */}
      <p className="mt-6 text-muted-foreground font-bengali text-sm text-center">
        Tap a character to start playing!
      </p>

      {/* Creator credit */}
      <p className="absolute bottom-4 text-xs text-muted-foreground/60 font-bengali">
        Created by RONY
      </p>
    </div>
  );
};
