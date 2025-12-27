import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2, Loader2, Check } from 'lucide-react';
import { Character } from '@/types/game';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeleteCharacterProps {
  characters: Character[];
  onBack: () => void;
  onDelete: (deletedIds: number[]) => void;
}

export const DeleteCharacter: React.FC<DeleteCharacterProps> = ({ characters, onBack, onDelete }) => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
    setConfirmDelete(false);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) {
      toast.error('Select at least one character');
      return;
    }

    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setDeleting(true);
    try {
      const idsToDelete = Array.from(selectedIds);
      const { error } = await supabase
        .from('characters')
        .delete()
        .in('id', idsToDelete);

      if (error) throw error;

      toast.success(`${idsToDelete.length} character(s) deleted!`);
      onDelete(idsToDelete);
    } catch (error: any) {
      console.error('Error deleting characters:', error);
      toast.error('Failed to delete characters');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
      setSelectedIds(new Set());
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-sky-top to-sky-bottom">
      <h1 className="font-bengali text-2xl font-bold text-foreground mb-6">Delete Characters</h1>
      
      {characters.length === 0 ? (
        <div className="text-center mb-6">
          <p className="text-muted-foreground mb-2">No characters to delete.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 max-w-sm w-full mb-6">
            {characters.map((char) => (
              <div
                key={char.id}
                onClick={() => !deleting && toggleSelect(char.id)}
                className={`relative aspect-square rounded-xl overflow-hidden border-4 transition-all cursor-pointer
                           ${selectedIds.has(char.id) ? 'border-destructive' : 'border-primary/30 hover:border-primary/60'}`}
              >
                <img 
                  src={char.image} 
                  alt={`Character ${char.id}`}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 flex items-center justify-center transition-all
                               ${selectedIds.has(char.id) ? 'bg-destructive/60' : 'bg-black/20'}`}>
                  {selectedIds.has(char.id) && (
                    <Check className="w-10 h-10 text-white" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-muted-foreground text-sm mb-4 text-center">
            Tap to select multiple characters, then delete
          </p>

          {selectedIds.size > 0 && (
            <Button
              onClick={handleDeleteSelected}
              variant="destructive"
              className="mb-4 flex items-center gap-2"
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {confirmDelete ? `Confirm Delete (${selectedIds.size})` : `Delete ${selectedIds.size} Selected`}
            </Button>
          )}
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
