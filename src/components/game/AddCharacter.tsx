import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Image, Music, Volume2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AddCharacterProps {
  onBack: () => void;
  onAdd: () => void;
}

export const AddCharacter: React.FC<AddCharacterProps> = ({ onBack, onAdd }) => {
  const [photo, setPhoto] = useState<File | null>(null);
  const [runSong, setRunSong] = useState<File | null>(null);
  const [deathSound, setDeathSound] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const photoRef = useRef<HTMLInputElement>(null);
  const runSongRef = useRef<HTMLInputElement>(null);
  const deathSoundRef = useRef<HTMLInputElement>(null);

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

  const handleAdd = async () => {
    if (!photo) {
      toast.error('Please select a photo');
      return;
    }

    setUploading(true);

    try {
      // Upload photo (required)
      const imageUrl = await uploadFile(photo, 'images');
      if (!imageUrl) {
        throw new Error('Failed to upload photo');
      }

      // Upload run song (optional)
      let runAudioUrl = null;
      if (runSong) {
        runAudioUrl = await uploadFile(runSong, 'audio');
      }

      // Upload death sound (optional)
      let deathAudioUrl = null;
      if (deathSound) {
        deathAudioUrl = await uploadFile(deathSound, 'audio');
      }

      // Save character to database
      const { error: insertError } = await supabase
        .from('characters')
        .insert({
          name: `Player ${Date.now()}`,
          image_url: imageUrl,
          run_audio_url: runAudioUrl,
          death_audio_url: deathAudioUrl,
          is_default: false
        });

      if (insertError) {
        throw insertError;
      }

      toast.success('Character added successfully!');
      onAdd();
    } catch (error: any) {
      console.error('Error adding character:', error);
      toast.error('Failed to add character');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-sky-top to-sky-bottom">
      <h1 className="font-bengali text-2xl font-bold text-foreground mb-6">Add Character</h1>
      
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {/* Photo */}
        <div 
          onClick={() => !uploading && photoRef.current?.click()}
          className={`w-24 h-24 rounded-xl border-2 border-dashed cursor-pointer 
                     flex flex-col items-center justify-center gap-1 transition-all
                     ${photo ? 'border-green-500 bg-green-500/10' : 'border-primary/50 hover:border-primary bg-card/50'}
                     ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Image className={`w-8 h-8 ${photo ? 'text-green-500' : 'text-primary'}`} />
          <span className="text-xs text-muted-foreground">Photo</span>
          {photo && <span className="text-xs text-green-500">✓</span>}
        </div>
        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setPhoto(e.target.files?.[0] || null)}
        />

        {/* Running Song */}
        <div 
          onClick={() => !uploading && runSongRef.current?.click()}
          className={`w-24 h-24 rounded-xl border-2 border-dashed cursor-pointer 
                     flex flex-col items-center justify-center gap-1 transition-all
                     ${runSong ? 'border-green-500 bg-green-500/10' : 'border-primary/50 hover:border-primary bg-card/50'}
                     ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Music className={`w-8 h-8 ${runSong ? 'text-green-500' : 'text-primary'}`} />
          <span className="text-xs text-muted-foreground text-center">Running Song</span>
          {runSong && <span className="text-xs text-green-500">✓</span>}
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
          onClick={() => !uploading && deathSoundRef.current?.click()}
          className={`w-24 h-24 rounded-xl border-2 border-dashed cursor-pointer 
                     flex flex-col items-center justify-center gap-1 transition-all
                     ${deathSound ? 'border-green-500 bg-green-500/10' : 'border-primary/50 hover:border-primary bg-card/50'}
                     ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Volume2 className={`w-8 h-8 ${deathSound ? 'text-green-500' : 'text-primary'}`} />
          <span className="text-xs text-muted-foreground text-center">Death Sound</span>
          {deathSound && <span className="text-xs text-green-500">✓</span>}
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
        onClick={handleAdd}
        disabled={!photo || uploading}
        className="h-14 px-8 text-lg font-game flex items-center gap-2"
        size="lg"
      >
        {uploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Plus className="w-5 h-5" />
            ADD
          </>
        )}
      </Button>

      <Button
        onClick={onBack}
        variant="outline"
        className="mt-6 flex items-center gap-2"
        disabled={uploading}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>
      
      <p className="text-muted-foreground text-xs mt-4 text-center max-w-xs">
        Characters are saved to the cloud and visible to all users.
        Audio files are optional.
      </p>
    </div>
  );
};
