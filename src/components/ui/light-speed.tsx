'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface LightSpeedOptions {
  starCount?: number;
  baseSpeed?: number;
  boostSpeed?: number;
  starColor?: string;
  lineColor?: string;
}

export const lightSpeedPresets: Record<string, LightSpeedOptions> = {
  one: { starCount: 150, baseSpeed: 2, boostSpeed: 15, starColor: '#ffffff', lineColor: 'rgba(99, 102, 241, 0.4)' }, // Indigo trails
  two: { starCount: 200, baseSpeed: 3, boostSpeed: 20, starColor: '#ffffff', lineColor: 'rgba(255, 59, 112, 0.4)' }, // Mittiva Rose trails
  three: { starCount: 100, baseSpeed: 1.5, boostSpeed: 10, starColor: '#ffffff', lineColor: 'rgba(34, 211, 238, 0.4)' }, // Cyan trails
  four: { starCount: 250, baseSpeed: 4, boostSpeed: 25, starColor: '#ffffff', lineColor: 'rgba(139, 92, 246, 0.4)' }, // Purple trails
  five: { starCount: 300, baseSpeed: 5, boostSpeed: 35, starColor: '#ffffff', lineColor: 'rgba(255, 255, 255, 0.3)' }, // White trails
  six: { starCount: 180, baseSpeed: 3, boostSpeed: 18, starColor: '#a7f3d0', lineColor: 'rgba(52, 211, 153, 0.4)' }, // Emerald trails
};

export const LightSpeed = ({
  effectOptions = lightSpeedPresets.one,
}: {
  effectOptions?: LightSpeedOptions;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const {
      starCount = 150,
      baseSpeed = 2,
      boostSpeed = 15,
      starColor = '#ffffff',
      lineColor = 'rgba(99, 102, 241, 0.4)',
    } = effectOptions;

    // Initialize stars
    const stars: Array<{
      x: number;
      y: number;
      z: number;
      px: number;
      py: number;
    }> = [];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width - width / 2,
        y: Math.random() * height - height / 2,
        z: Math.random() * width,
        px: 0,
        py: 0,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const draw = () => {
      // Semi-transparent clear to leave a slight trail
      ctx.fillStyle = 'rgba(2, 4, 10, 0.2)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      
      const currentSpeed = (speedMultiplier > 1 ? boostSpeed : baseSpeed) * speedMultiplier;

      stars.forEach((star) => {
        // Save previous projected coordinates
        const pz = star.z;
        star.z -= currentSpeed;

        if (star.z <= 0) {
          star.z = width;
          star.x = Math.random() * width - width / 2;
          star.y = Math.random() * height - height / 2;
          star.px = 0;
          star.py = 0;
          return;
        }

        // Project 3D coordinates onto 2D screen
        const k = 128.0 / star.z;
        const sx = star.x * k + cx;
        const sy = star.y * k + cy;

        if (sx < 0 || sx > width || sy < 0 || sy > height) {
          star.z = width;
          star.x = Math.random() * width - width / 2;
          star.y = Math.random() * height - height / 2;
          star.px = 0;
          star.py = 0;
          return;
        }

        // Draw light speed line/trail
        if (star.px !== 0 && star.py !== 0) {
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(star.px, star.py);
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = Math.max(1, (1 - star.z / width) * 2.5);
          ctx.stroke();
        }

        // Draw star head
        ctx.beginPath();
        ctx.arc(sx, sy, Math.max(0.5, (1 - star.z / width) * 1.5), 0, Math.PI * 2);
        ctx.fillStyle = starColor;
        ctx.fill();

        star.px = sx;
        star.py = sy;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [effectOptions, speedMultiplier]);

  const handleMouseDown = () => {
    setSpeedMultiplier(3.5); // speed up on click/hold!
  };

  const handleMouseUp = () => {
    setSpeedMultiplier(1); // normal speed
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      className="absolute inset-0 w-full h-full cursor-pointer z-0"
      style={{ background: '#02040A' }}
    />
  );
};
