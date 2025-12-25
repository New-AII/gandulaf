import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import { Character } from '@/types/game';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeleteCharacterProps {
  characters: Character[];
  onBack: () => void;
  onDelete: () => void;
}

export const DeleteCharacter: React.FC<DeleteCharacterProps> = ({ characters, onBack, onDelete }) => {
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filter to only show custom (non-default) characters
  const customCharacters = characters.filter(c => !c.isDefault);

  const handleDelete = async (id: number) => {
    if (confirmId === id) {
      setDeleting(true);
      try {
        const { error } = await supabase
          .from('characters')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast.success('Character deleted!');
        onDelete();
      } catch (error: any) {
        console.error('Error deleting character:', error);
        toast.error('Failed to delete character');
      } finally {
        setDeleting(false);
        setConfirmId(null);
      }
    } else {
      setConfirmId(id);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-sky-top to-sky-bottom">
      <h1 className="font-bengali text-2xl font-bold text-foreground mb-6">Delete Character</h1>
      
      {customCharacters.length === 0 ? (
        <div className="text-center mb-6">
          <p className="text-muted-foreground mb-2">No custom characters to delete.</p>
          <p className="text-muted-foreground text-sm">Default characters cannot be deleted.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 max-w-sm w-full mb-6">
            {customCharacters.map((char) => (
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
                  disabled={deleting}
                  className={`absolute inset-0 flex items-center justify-center transition-all
                             ${confirmId === char.id 
                               ? 'bg-destructive/80' 
                               : 'bg-black/40 hover:bg-destructive/60'}
                             ${deleting ? 'cursor-not-allowed' : ''}`}
                >
                  {deleting && confirmId === char.id ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <Trash2 className="w-8 h-8 text-white" />
                  )}
                </button>
                {confirmId === char.id && !deleting && (
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
        </>
      )}

      <Button
        onClick={onBack}
        variant="outline"
        className="flex items-center gap-2"
        disabled={deleting}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>
    </div>
  );
};
