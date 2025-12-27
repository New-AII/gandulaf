import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Score {
  character_id: name;
  character_name: string;
  high_score: number;
}

export const Leaderboard: React.FC = () => {
  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    const { data, error } = await supabase
      .from('character_scores')
      .select('character_id, character_name, high_score')
      .order('high_score', { ascending: false })
      .limit(6);

    if (!error && data) {
      setScores(data);
    }
  };

  const filteredScores = scores.filter(s => s.high_score > 0);

  if (filteredScores.length === 0) return null;

  return (
    <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-primary/20 max-w-[140px]">
      <h3 className="font-game text-xs text-primary mb-2 text-center">Leaderboard</h3>
      <div className="space-y-1">
        {filteredScores.slice(0, 5).map((score, index) => (
          <div key={score.character_name} className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground truncate mr-2">
              {index + 1}. {score.character_name}
            </span>
            <span className="font-game text-foreground font-bold">
              {score.high_score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
