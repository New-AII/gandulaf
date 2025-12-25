import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Image, Music, Volume2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AddCharacterProps {
  onBack: () => void;
  onAdd: (photo: File, runSong: File | null, deathSound: File | null) => void;
}

export const AddCharacter: React.FC<AddCharacterProps> = ({ onBack, onAdd }) => {
  const [photo, setPhoto] = useState<File | null>(null);
  const [runSong, setRunSong] = useState<File | null>(null);
  const [deathSound, setDeathSound] = useState<File | null>(null);
  
  const photoRef = useRef<HTMLInputElement>(null);
  const runSongRef = useRef<HTMLInputElement>(null);
  const deathSoundRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (!photo) {
      toast.error('Please select a photo');
      return;
    }
    onAdd(photo, runSong, deathSound);
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-sky-top to-sky-bottom">
      <h1 className="font-bengali text-2xl font-bold text-foreground mb-6">Add Character</h1>
      
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {/* Photo */}
        <div 
          onClick={() => photoRef.current?.click()}
          className={`w-24 h-24 rounded-xl border-2 border-dashed cursor-pointer 
                     flex flex-col items-center justify-center gap-1 transition-all
                     ${photo ? 'border-green-500 bg-green-500/10' : 'border-primary/50 hover:border-primary bg-card/50'}`}
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
          onClick={() => runSongRef.current?.click()}
          className={`w-24 h-24 rounded-xl border-2 border-dashed cursor-pointer 
                     flex flex-col items-center justify-center gap-1 transition-all
                     ${runSong ? 'border-green-500 bg-green-500/10' : 'border-primary/50 hover:border-primary bg-card/50'}`}
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
          onClick={() => deathSoundRef.current?.click()}
          className={`w-24 h-24 rounded-xl border-2 border-dashed cursor-pointer 
                     flex flex-col items-center justify-center gap-1 transition-all
                     ${deathSound ? 'border-green-500 bg-green-500/10' : 'border-primary/50 hover:border-primary bg-card/50'}`}
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
        disabled={!photo}
        className="h-14 px-8 text-lg font-game flex items-center gap-2"
        size="lg"
      >
        <Plus className="w-5 h-5" />
        ADD
      </Button>

      <Button
        onClick={onBack}
        variant="outline"
        className="mt-6 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>
      
      <p className="text-muted-foreground text-xs mt-4 text-center max-w-xs">
        Note: Custom characters with uploaded files will be stored locally.
        Audio files are optional.
      </p>
    </div>
  );
};
