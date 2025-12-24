import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Character, Player, Pipe, Cloud, GameConfig } from '@/types/game';
import { useGameLoop } from '@/hooks/useGameLoop';
import { preloadedImages } from './CharacterSelect';

const CONFIG: GameConfig = {
  virtualWidth: 360,
  virtualHeight: 640,
  gravity: 1200,
  jumpForce: -420,
  pipeSpeed: 150,
  pipeSpawnInterval: 1.5,
  pipeWidth: 52,
  minGapSize: 180, // Start easier with bigger gap
  maxGapSize: 220, // Start easier with bigger gap
};

interface GameCanvasProps {
  character: Character;
  onGameOver: (score: number) => void;
  isPlaying: boolean;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ character, onGameOver, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const characterImageRef = useRef<HTMLImageElement | null>(null);
  
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  
  const playerRef = useRef<Player>({
    x: CONFIG.virtualWidth * 0.25,
    y: CONFIG.virtualHeight / 2,
    velocity: 0,
    rotation: 0,
    width: 50,
    height: 50,
  });
  
  const pipesRef = useRef<Pipe[]>([]);
  const cloudsRef = useRef<Cloud[]>([]);
  const scoreRef = useRef(0);
  const pipeTimerRef = useRef(0);
  const gameOverRef = useRef(false);
  const backgroundXRef = useRef(0);

  // Use preloaded character image - instant, no loading
  useEffect(() => {
    // First check preloaded cache (instant)
    const cachedImg = preloadedImages.get(character.image);
    if (cachedImg) {
      characterImageRef.current = cachedImg;
      return;
    }
    
    // Fallback: create and load (should rarely happen)
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = character.image;
    
    if (img.complete) {
      characterImageRef.current = img;
      preloadedImages.set(character.image, img);
    } else {
      img.onload = () => {
        characterImageRef.current = img;
        preloadedImages.set(character.image, img);
      };
    }
  }, [character]);

  // Initialize clouds
  useEffect(() => {
    cloudsRef.current = Array.from({ length: 5 }, () => ({
      x: Math.random() * CONFIG.virtualWidth * 1.5,
      y: Math.random() * CONFIG.virtualHeight * 0.5,
      size: 30 + Math.random() * 40,
      speed: 20 + Math.random() * 30,
    }));
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        
        const scaleX = containerWidth / CONFIG.virtualWidth;
        const scaleY = containerHeight / CONFIG.virtualHeight;
        const newScale = Math.min(scaleX, scaleY);
        
        setScale(newScale);
        setOffset({
          x: (containerWidth - CONFIG.virtualWidth * newScale) / 2,
          y: (containerHeight - CONFIG.virtualHeight * newScale) / 2,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Jump function
  const jump = useCallback(() => {
    if (gameOverRef.current) return;
    playerRef.current.velocity = CONFIG.jumpForce;
  }, []);

  // Handle input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      jump();
    };

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      jump();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [jump]);

  // AABB collision detection
  const checkCollision = useCallback((player: Player, pipe: Pipe): boolean => {
    const hitboxReduction = 0.2;
    const pw = player.width * (1 - hitboxReduction);
    const ph = player.height * (1 - hitboxReduction);
    const px = player.x - pw / 2;
    const py = player.y - ph / 2;

    // Top pipe
    if (
      px < pipe.x + pipe.width &&
      px + pw > pipe.x &&
      py < pipe.gapY
    ) {
      return true;
    }

    // Bottom pipe
    if (
      px < pipe.x + pipe.width &&
      px + pw > pipe.x &&
      py + ph > pipe.gapY + pipe.gapHeight
    ) {
      return true;
    }

    return false;
  }, []);

  // Game update loop
  const update = useCallback((dt: number) => {
    if (gameOverRef.current || !isPlaying) return;

    const player = playerRef.current;

    // Update player physics
    player.velocity += CONFIG.gravity * dt;
    player.y += player.velocity * dt;

    // Rotation based on velocity
    const targetRotation = Math.max(-30, Math.min(90, player.velocity * 0.1));
    player.rotation += (targetRotation - player.rotation) * 5 * dt;

    // Check boundaries
    if (player.y < player.height / 2 || player.y > CONFIG.virtualHeight - player.height / 2) {
      gameOverRef.current = true;
      onGameOver(scoreRef.current);
      return;
    }

    // Update pipe spawn timer
    pipeTimerRef.current += dt;
    if (pipeTimerRef.current >= CONFIG.pipeSpawnInterval) {
      pipeTimerRef.current = 0;
      
      // Dynamic difficulty: decrease gap size as score increases
      // Start with bigger gaps (220-180), decrease to minimum (140-120) over time
      const difficultyProgress = Math.min(scoreRef.current / 20, 1); // Max difficulty at score 20
      const currentMaxGap = CONFIG.maxGapSize - (difficultyProgress * 80); // 220 -> 140
      const currentMinGap = CONFIG.minGapSize - (difficultyProgress * 60); // 180 -> 120
      
      const gapHeight = currentMinGap + Math.random() * (currentMaxGap - currentMinGap);
      const minGapY = gapHeight / 2 + 50;
      const maxGapY = CONFIG.virtualHeight - gapHeight / 2 - 100;
      const gapY = minGapY + Math.random() * (maxGapY - minGapY);
      
      pipesRef.current.push({
        x: CONFIG.virtualWidth + CONFIG.pipeWidth,
        gapY: gapY,
        gapHeight: gapHeight,
        width: CONFIG.pipeWidth,
        passed: false,
      });
    }

    // Update pipes
    pipesRef.current = pipesRef.current.filter((pipe) => {
      pipe.x -= CONFIG.pipeSpeed * dt;

      // Check collision
      if (checkCollision(player, pipe)) {
        gameOverRef.current = true;
        onGameOver(scoreRef.current);
        return true;
      }

      // Check if passed
      if (!pipe.passed && pipe.x + pipe.width < player.x) {
        pipe.passed = true;
        scoreRef.current += 1;
      }

      return pipe.x > -pipe.width;
    });

    // Update clouds
    cloudsRef.current.forEach((cloud) => {
      cloud.x -= cloud.speed * dt;
      if (cloud.x < -cloud.size) {
        cloud.x = CONFIG.virtualWidth + cloud.size;
        cloud.y = Math.random() * CONFIG.virtualHeight * 0.5;
      }
    });

    // Update background scroll
    backgroundXRef.current -= 20 * dt;
    if (backgroundXRef.current <= -CONFIG.virtualWidth) {
      backgroundXRef.current = 0;
    }
  }, [isPlaying, onGameOver, checkCollision]);

  // Render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sky gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.virtualHeight);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F4FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CONFIG.virtualWidth, CONFIG.virtualHeight);

    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    cloudsRef.current.forEach((cloud) => {
      ctx.beginPath();
      ctx.ellipse(cloud.x, cloud.y, cloud.size, cloud.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw pipes
    pipesRef.current.forEach((pipe) => {
      // Pipe gradient
      const pipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
      pipeGradient.addColorStop(0, '#2D8B2D');
      pipeGradient.addColorStop(0.5, '#4CAF50');
      pipeGradient.addColorStop(1, '#2D8B2D');

      ctx.fillStyle = pipeGradient;

      // Top pipe
      ctx.fillRect(pipe.x, 0, pipe.width, pipe.gapY);
      
      // Top pipe cap
      ctx.fillRect(pipe.x - 4, pipe.gapY - 25, pipe.width + 8, 25);

      // Bottom pipe
      const bottomY = pipe.gapY + pipe.gapHeight;
      ctx.fillRect(pipe.x, bottomY, pipe.width, CONFIG.virtualHeight - bottomY);
      
      // Bottom pipe cap
      ctx.fillRect(pipe.x - 4, bottomY, pipe.width + 8, 25);

      // Pipe highlights
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(pipe.x + 5, 0, 8, pipe.gapY - 25);
      ctx.fillRect(pipe.x + 5, bottomY + 25, 8, CONFIG.virtualHeight - bottomY - 25);
    });

    // Draw ground
    const groundGradient = ctx.createLinearGradient(0, CONFIG.virtualHeight - 50, 0, CONFIG.virtualHeight);
    groundGradient.addColorStop(0, '#8B4513');
    groundGradient.addColorStop(1, '#654321');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, CONFIG.virtualHeight - 50, CONFIG.virtualWidth, 50);

    // Ground line
    ctx.fillStyle = '#2D8B2D';
    ctx.fillRect(0, CONFIG.virtualHeight - 50, CONFIG.virtualWidth, 10);

    // Draw player
    const player = playerRef.current;
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate((player.rotation * Math.PI) / 180);

    if (characterImageRef.current) {
      // Draw character image with circular clip
      ctx.beginPath();
      ctx.arc(0, 0, player.width / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        characterImageRef.current,
        -player.width / 2,
        -player.height / 2,
        player.width,
        player.height
      );
    } else {
      // Fallback circle
      ctx.fillStyle = '#FF6B35';
      ctx.beginPath();
      ctx.arc(0, 0, player.width / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Player border
    ctx.restore();
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate((player.rotation * Math.PI) / 180);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, player.width / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Draw score
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.font = 'bold 48px Bangers, cursive';
    ctx.textAlign = 'center';
    ctx.strokeText(scoreRef.current.toString(), CONFIG.virtualWidth / 2, 70);
    ctx.fillText(scoreRef.current.toString(), CONFIG.virtualWidth / 2, 70);

  }, []);

  // Combined game loop
  useGameLoop((dt) => {
    update(dt);
    render();
  }, isPlaying);

  // Initial render
  useEffect(() => {
    render();
  }, [render]);

  // Reset game state when starting
  useEffect(() => {
    if (isPlaying) {
      playerRef.current = {
        x: CONFIG.virtualWidth * 0.25,
        y: CONFIG.virtualHeight / 2,
        velocity: 0,
        rotation: 0,
        width: 50,
        height: 50,
      };
      pipesRef.current = [];
      scoreRef.current = 0;
      pipeTimerRef.current = 0;
      gameOverRef.current = false;
    }
  }, [isPlaying, character]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full game-container"
    >
      <canvas
        ref={canvasRef}
        width={CONFIG.virtualWidth}
        height={CONFIG.virtualHeight}
        className="block mx-auto"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          marginLeft: offset.x,
          marginTop: offset.y,
        }}
      />
    </div>
  );
};
