import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';

interface AdminPanelProps {
  onAddCharacter: () => void;
  onDeleteCharacter: () => void;
  onBack: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onAddCharacter, onDeleteCharacter, onBack }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-sky-top to-sky-bottom">
      <h1 className="font-bengali text-3xl font-bold text-foreground mb-8">Admin Panel</h1>
      
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button
          onClick={onAddCharacter}
          className="h-16 text-lg font-game flex items-center justify-center gap-3"
          size="lg"
        >
          <Plus className="w-6 h-6" />
          Add Character
        </Button>
        
        <Button
          onClick={onDeleteCharacter}
          variant="destructive"
          className="h-16 text-lg font-game flex items-center justify-center gap-3"
          size="lg"
        >
          <Trash2 className="w-6 h-6" />
          Delete Character
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
