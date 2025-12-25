import React from 'react';

interface GameOverProps {
  score: number;
  highScore: number;
  onRestart: () => void;
  showScore: boolean;
  characterImage: string;
}

export const GameOver: React.FC<GameOverProps> = ({ score, highScore, onRestart, showScore, characterImage }) => {
  const isNewHighScore = score >= highScore && score > 0;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-foreground/60 backdrop-blur-sm z-10">
      <div className="bg-card/95 rounded-2xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl border-4 border-primary/30 animate-scale-in">
        {/* Game Over Title */}
        <h2 className="font-game text-4xl md:text-5xl text-destructive mb-4 animate-shake">
          Game Over!
        </h2>

        {showScore ? (
          <>
            {/* Score Display - only shown after death sound ends */}
            <div className="mb-6 space-y-2 animate-fade-in">
              <div className="text-2xl font-bengali text-muted-foreground">
                Score
              </div>
              <div className="text-5xl font-game text-primary text-shadow-glow">
                {score}
              </div>
              
              {isNewHighScore && (
                <div className="text-lg font-game text-accent animate-bounce-slow">
                  🏆 New High Score! 🏆
                </div>
              )}

              {!isNewHighScore && highScore > 0 && (
                <div className="text-lg font-bengali text-muted-foreground">
                  Best: {highScore}
                </div>
              )}
            </div>

            {/* Restart Button */}
            <button
              onClick={onRestart}
              className="w-full py-4 px-8 bg-primary text-primary-foreground font-game text-xl 
                         rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all duration-200
                         hover:shadow-primary/40 hover:shadow-xl animate-pulse-glow"
            >
              Play Again
            </button>

            <p className="mt-4 text-sm text-muted-foreground font-bengali">
              Tap anywhere or press Space to restart
            </p>
          </>
        ) : (
          /* Waiting for death sound to finish - show character image */
          <div className="py-6">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-primary/50 shadow-lg animate-pulse">
              <img 
                src={characterImage} 
                alt="Selected character" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
            <p className="mt-4 text-lg font-bengali text-muted-foreground">
              Wait for it...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
