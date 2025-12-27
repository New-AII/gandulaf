import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ArrowLeft, Pencil, RotateCcw, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminPanelProps {
  onAddCharacter: () => void;
  onDeleteCharacter: () => void;
  onEditCharacter: () => void;
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onAddCharacter, 
  onDeleteCharacter, 
  onEditCharacter,
  onBack 
}) => {
  const [resetting, setResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleResetLeaderboard = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }

    setResetting(true);
    try {
      const { error } = await supabase
        .from('character_scores')
        .update({ high_score: 0 })
        .gte('high_score', 0);

      if (error) throw error;

      toast.success('Leaderboard reset successfully!');
      setConfirmReset(false);
    } catch (error: any) {
      console.error('Error resetting leaderboard:', error);
      toast.error('Failed to reset leaderboard');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-sky-top to-sky-bottom">
      <h1 className="font-bengali text-3xl font-bold text-foreground mb-8">Admin Panel</h1>
      
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button
          onClick={onAddCharacter}
          className="h-14 text-lg font-game flex items-center justify-center gap-3"
          size="lg"
        >
          <Plus className="w-5 h-5" />
          Add Character
        </Button>
        
        <Button
          onClick={onEditCharacter}
          variant="secondary"
          className="h-14 text-lg font-game flex items-center justify-center gap-3"
          size="lg"
        >
          <Pencil className="w-5 h-5" />
          Edit Character
        </Button>
        
        <Button
          onClick={onDeleteCharacter}
          variant="destructive"
          className="h-14 text-lg font-game flex items-center justify-center gap-3"
          size="lg"
        >
          <Trash2 className="w-5 h-5" />
          Delete Characters
        </Button>

        <Button
          onClick={handleResetLeaderboard}
          variant="outline"
          className={`h-14 text-lg font-game flex items-center justify-center gap-3 ${confirmReset ? 'border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground' : ''}`}
          size="lg"
          disabled={resetting}
        >
          {resetting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <RotateCcw className="w-5 h-5" />
          )}
          {confirmReset ? 'Confirm Reset' : 'Reset Leaderboard'}
        </Button>
      </div>
      
      <Button
        onClick={onBack}
        variant="outline"
        className="mt-8 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Menu
      </Button>
    </div>
  );
};
