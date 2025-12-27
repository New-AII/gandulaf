import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Image, Music, Volume2, Save, Loader2, Pencil } from 'lucide-react';
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
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [runSong, setRunSong] = useState<File | null>(null);
  const [deathSound, setDeathSound] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const photoRef = useRef<HTMLInputElement>(null);
  const runSongRef = useRef<HTMLInputElement>(null);
  const deathSoundRef = useRef<HTMLInputElement>(null);

  const handleSelectCharacter = (char: Character) => {
    setSelectedChar(char);
    setName(char.name || `Character ${char.id}`);
    setPhotoPreview(char.image || '');
    setPhoto(null);
    setRunSong(null);
    setDeathSound(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('characters')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('characters')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleSave = async () => {
    if (!selectedChar) return;

    setSaving(true);
    try {
      let imageUrl = selectedChar.image;
      let runAudioUrl = selectedChar.runAudioUrl || null;
      let deathAudioUrl = selectedChar.deathAudioUrl || null;

      // Upload new photo if selected
      if (photo) {
        const uploadedUrl = await uploadFile(photo, 'images');
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      // Upload new run song if selected
      if (runSong) {
        const uploadedUrl = await uploadFile(runSong, 'audio');
        if (uploadedUrl) {
          runAudioUrl = uploadedUrl;
        }
      }

      // Upload new death sound if selected
      if (deathSound) {
        const uploadedUrl = await uploadFile(deathSound, 'audio');
        if (uploadedUrl) {
          deathAudioUrl = uploadedUrl;
        }
      }

      const updatedName = name.trim() || `Character ${selectedChar.id}`;

      const { error } = await supabase
        .from('characters')
        .update({
          name: updatedName,
          image_url: imageUrl,
          run_audio_url: runAudioUrl,
          death_audio_url: deathAudioUrl
        })
        .eq('id', selectedChar.id);

      if (error) throw error;

      // Also update the character name in character_scores so leaderboard shows the correct name
      await supabase
        .from('character_scores')
        .update({ character_name: updatedName })
        .eq('character_id', selectedChar.id);

      toast.success('Character updated successfully!');
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
        <h1 className="font-bengali text-2xl font-bold text-foreground mb-4">Edit Character</h1>
        
        {/* Name Input */}
        <div className="w-full max-w-xs mb-6">
          <label className="text-sm text-muted-foreground mb-1 block">Character Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter character name"
            className="bg-card/50 text-center font-bold"
            disabled={saving}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {/* Photo */}
          <div 
            onClick={() => !saving && photoRef.current?.click()}
            className={`w-24 h-24 rounded-xl border-2 border-dashed cursor-pointer 
                       flex flex-col items-center justify-center gap-1 transition-all overflow-hidden
                       ${photo ? 'border-green-500 bg-green-500/10' : 'border-primary/50 hover:border-primary bg-card/50'}
                       ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <Image className="w-8 h-8 text-primary" />
                <span className="text-xs text-muted-foreground">Photo</span>
              </>
            )}
          </div>
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />

          {/* Running Song */}
          <div 
            onClick={() => !saving && runSongRef.current?.click()}
            className={`w-24 h-24 rounded-xl border-2 border-dashed cursor-pointer 
                       flex flex-col items-center justify-center gap-1 transition-all
                       ${runSong ? 'border-green-500 bg-green-500/10' : 'border-primary/50 hover:border-primary bg-card/50'}
                       ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Music className={`w-8 h-8 ${runSong ? 'text-green-500' : 'text-primary'}`} />
            <span className="text-xs text-muted-foreground text-center">Running Song</span>
            {runSong && <span className="text-xs text-green-500">✓</span>}
            {!runSong && selectedChar.runAudioUrl && (
              <span className="text-xs text-primary">Current</span>
            )}
          </div>
          <input
            ref={runSongRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => setRunSong(e.target.files?.[0] || null)}
          />

          {/* Death Sound */}
          <div 
            onClick={() => !saving && deathSoundRef.current?.click()}
            className={`w-24 h-24 rounded-xl border-2 border-dashed cursor-pointer 
                       flex flex-col items-center justify-center gap-1 transition-all
                       ${deathSound ? 'border-green-500 bg-green-500/10' : 'border-primary/50 hover:border-primary bg-card/50'}
                       ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Volume2 className={`w-8 h-8 ${deathSound ? 'text-green-500' : 'text-primary'}`} />
            <span className="text-xs text-muted-foreground text-center">Death Sound</span>
            {deathSound && <span className="text-xs text-green-500">✓</span>}
            {!deathSound && selectedChar.deathAudioUrl && (
              <span className="text-xs text-primary">Current</span>
            )}
          </div>
          <input
            ref={deathSoundRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => setDeathSound(e.target.files?.[0] || null)}
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-14 px-8 text-lg font-game flex items-center gap-2"
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              SAVE
            </>
          )}
        </Button>

        <Button
          onClick={() => setSelectedChar(null)}
          variant="outline"
          className="mt-6 flex items-center gap-2"
          disabled={saving}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <p className="text-muted-foreground text-xs mt-4 text-center max-w-xs">
          Changes are saved globally and visible to all users.
          Only upload new files if you want to replace existing ones.
        </p>
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
          <div className="grid grid-cols-3 gap-3 max-w-sm w-full mb-6 max-h-[50vh] overflow-y-auto">
            {characters.map((char) => (
              <div
                key={char.id}
                className="relative aspect-square rounded-xl overflow-hidden border-4 border-primary/30 cursor-pointer hover:border-primary transition-all hover:scale-105"
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
