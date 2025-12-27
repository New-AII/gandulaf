import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Loader2, Pencil } from 'lucide-react';
import { Character } from '@/types/game';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EditCharacterProps {
  characters: Character[];
  onBack: () => void;
  onEdit: () => void;
}

export const EditCharacter: React.FC<EditCharacterProps> = ({ characters, onBack, onEdit }) => {
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [runAudioUrl, setRunAudioUrl] = useState('');
  const [deathAudioUrl, setDeathAudioUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSelectCharacter = (char: Character) => {
    setSelectedChar(char);
    setName(char.name || `Character ${char.id}`);
    setImageUrl(char.image || '');
    setRunAudioUrl(char.runAudioUrl || '');
    setDeathAudioUrl(char.deathAudioUrl || '');
  };

  const handleSave = async () => {
    if (!selectedChar) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('characters')
        .update({
          name: name.trim() || `Character ${selectedChar.id}`,
          image_url: imageUrl.trim() || selectedChar.image,
          run_audio_url: runAudioUrl.trim() || null,
          death_audio_url: deathAudioUrl.trim() || null
        })
        .eq('id', selectedChar.id);

      if (error) throw error;

      toast.success('Character updated!');
      onEdit();
    } catch (error: any) {
      console.error('Error updating character:', error);
      toast.error('Failed to update character');
    } finally {
      setSaving(false);
    }
  };

  if (selectedChar) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-sky-top to-sky-bottom">
        <h1 className="font-bengali text-2xl font-bold text-foreground mb-6">Edit Character</h1>
        
        <div className="w-full max-w-sm space-y-4 mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-xl overflow-hidden border-4 border-primary/30">
              <img 
                src={imageUrl || selectedChar.image} 
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Character name"
              className="bg-card/50"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Image URL</label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="bg-card/50"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Run Audio URL (optional)</label>
            <Input
              value={runAudioUrl}
              onChange={(e) => setRunAudioUrl(e.target.value)}
              placeholder="https://..."
              className="bg-card/50"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Death Audio URL (optional)</label>
            <Input
              value={deathAudioUrl}
              onChange={(e) => setDeathAudioUrl(e.target.value)}
              placeholder="https://..."
              className="bg-card/50"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => setSelectedChar(null)}
            variant="outline"
            disabled={saving}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-sky-top to-sky-bottom">
      <h1 className="font-bengali text-2xl font-bold text-foreground mb-6">Edit Character</h1>
      
      {characters.length === 0 ? (
        <div className="text-center mb-6">
          <p className="text-muted-foreground mb-2">No characters to edit.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 max-w-sm w-full mb-6">
            {characters.map((char) => (
              <div
                key={char.id}
                className="relative aspect-square rounded-xl overflow-hidden border-4 border-primary/30 cursor-pointer hover:border-primary transition-all"
                onClick={() => handleSelectCharacter(char)}
              >
                <img 
                  src={char.image} 
                  alt={char.name || `Character ${char.id}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-primary/40 transition-all">
                  <Pencil className="w-8 h-8 text-white" />
                </div>
                <span className="absolute bottom-1 left-1 right-1 text-center text-white text-xs bg-black/60 rounded px-1 truncate">
                  {char.name || `Char ${char.id}`}
                </span>
              </div>
            ))}
          </div>

          <p className="text-muted-foreground text-sm mb-4 text-center">
            Tap a character to edit
          </p>
        </>
      )}

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
