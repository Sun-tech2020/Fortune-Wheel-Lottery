
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Candidate } from '../types';

interface WheelProps {
  candidates: Candidate[];
  isSpinning: boolean;
  winnerIndex: number | null;
  onSpinEnd: () => void;
}

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', 
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'
];

const Wheel: React.FC<WheelProps> = ({ candidates, isSpinning, winnerIndex, onSpinEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const rotationRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = size * 0.45;
    const sliceAngle = (2 * Math.PI) / candidates.length;

    ctx.clearRect(0, 0, size, size);

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(rotationRef.current);

    candidates.forEach((candidate, i) => {
      const angle = i * sliceAngle;
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = 'white';
      ctx.font = candidates.length > 20 ? '9px Inter' : candidates.length > 10 ? '11px Inter' : 'bold 14px Inter';
      ctx.fillText(candidate.name.substring(0, 6), radius - 20, 5);
      ctx.restore();
    });

    ctx.restore();
    ctx.beginPath();
    ctx.arc(center, center, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#1e1b4b';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.stroke();
  }, [candidates]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    if (isSpinning && winnerIndex !== null) {
      const startTime = performance.now();
      // Increased duration for a longer, more suspenseful slow-down
      const spinDuration = 7000; 
      const sliceAngle = (2 * Math.PI) / candidates.length;
      
      // Increased base rotations from 10 to 18 for a much faster start
      const baseRotations = 18;
      const targetRotation = (2 * Math.PI * baseRotations) + (Math.PI * 1.5) - (winnerIndex * sliceAngle) - (sliceAngle / 2);
      const startRotation = rotationRef.current % (2 * Math.PI);

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / spinDuration, 1);
        
        // Quintic out easing: 1 - (1 - x)^5
        // This creates a very sharp burst of speed at the start and a long, smooth tail at the end
        const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);
        
        const currentRotation = startRotation + (targetRotation - startRotation) * easeOutQuint(progress);
        
        rotationRef.current = currentRotation;
        setRotation(currentRotation);
        draw();

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          onSpinEnd();
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isSpinning, winnerIndex, candidates.length, onSpinEnd, draw]);

  return (
    <div className="relative inline-block">
      {/* Pointer with glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-10 filter drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
        <div className="w-8 h-12 bg-yellow-400 clip-path-triangle transform rotate-180 border-x-4 border-yellow-600"></div>
        <div className="w-4 h-4 bg-yellow-200 rounded-full absolute top-0 left-1/2 -translate-x-1/2 translate-y-2 border-2 border-yellow-500"></div>
      </div>
      
      <canvas 
        ref={canvasRef} 
        width={500} 
        height={500} 
        className="max-w-full h-auto rounded-full shadow-[0_0_100px_rgba(99,102,241,0.3)] border-8 border-indigo-500/30 transition-transform duration-75"
      />

      <style>{`
        .clip-path-triangle {
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }
      `}</style>
    </div>
  );
};

export default Wheel;
