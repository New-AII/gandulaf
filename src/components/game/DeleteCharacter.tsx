import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Character } from '@/types/game';

interface DeleteCharacterProps {
  characters: Character[];
  onBack: () => void;
  onDelete: (characterId: number) => void;
}

export const DeleteCharacter: React.FC<DeleteCharacterProps> = ({ characters, onBack, onDelete }) => {
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    if (confirmId === id) {
      onDelete(id);
      setConfirmId(null);
    } else {
      setConfirmId(id);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-sky-top to-sky-bottom">
      <h1 className="font-bengali text-2xl font-bold text-foreground mb-6">Delete Character</h1>
      
      <div className="grid grid-cols-3 gap-3 max-w-sm w-full mb-6">
        {characters.map((char) => (
          <div
            key={char.id}
            className={`relative aspect-square rounded-xl overflow-hidden border-4 transition-all
                       ${confirmId === char.id ? 'border-destructive animate-pulse' : 'border-primary/30'}`}
          >
            <img 
              src={char.image} 
              alt={`Character ${char.id}`}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => handleDelete(char.id)}
              className={`absolute inset-0 flex items-center justify-center transition-all
                         ${confirmId === char.id 
                           ? 'bg-destructive/80' 
                           : 'bg-black/40 hover:bg-destructive/60'}`}
            >
              <Trash2 className="w-8 h-8 text-white" />
            </button>
            {confirmId === char.id && (
              <span className="absolute bottom-1 left-1 right-1 text-center text-white text-xs bg-destructive rounded px-1">
                Tap to confirm
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="text-muted-foreground text-sm mb-4 text-center">
        Tap once to select, tap again to confirm delete
      </p>

      <Button
        onClick={onBack}
        variant="outline"
        className="flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>
    </div>
  );
};
