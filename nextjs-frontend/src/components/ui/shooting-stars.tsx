"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useState, useId } from "react";

interface ShootingStar {
  id: number;
  x: number;
  y: number;
  angle: number;
  scale: number;
  speed: number;
  distance: number;
  opacity: number;
}

interface ShootingStarsProps {
  minSpeed?: number;
  maxSpeed?: number;
  minDelay?: number;
  maxDelay?: number;
  starColor?: string;
  trailColor?: string;
  starWidth?: number;
  starHeight?: number;
  className?: string;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const getRandomStartPoint = () => {
  const offset = Math.random() * window.innerWidth;
  const angle = lerp(30, 150, Math.random());
  return { x: offset, y: 0, angle };
};

export const ShootingStars: React.FC<ShootingStarsProps> = ({
  minSpeed = 10,
  maxSpeed = 30,
  minDelay = 1200,
  maxDelay = 4200,
  starColor = "#9E00FF",
  trailColor = "#2EB9DF",
  starWidth = 10,
  starHeight = 1,
  className,
}) => {
  const [star, setStar] = useState<ShootingStar | null>(null);
  const gradientId = useId();
  const glowId = useId();

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const createStar = () => {
      if (cancelled) return;
      const { x, y, angle } = getRandomStartPoint();
      const speed = Math.random() * (maxSpeed - minSpeed) + minSpeed;
      const newStar: ShootingStar = {
        id: Date.now() + Math.random(),
        x,
        y,
        angle,
        scale: 1,
        speed,
        distance: 0,
        opacity: lerp(0.3, 1, Math.random()),
      };
      setStar(newStar);

      const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;
      timeoutId = setTimeout(createStar, randomDelay);
    };

    createStar();

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [minSpeed, maxSpeed, minDelay, maxDelay]);

  useEffect(() => {
    const moveStar = () => {
      if (star) {
        setStar((prevStar) => {
          if (!prevStar) return null;
          const rad = (prevStar.angle * Math.PI) / 180;
          const newX = prevStar.x + prevStar.speed * Math.cos(rad);
          const newY = prevStar.y + prevStar.speed * Math.sin(rad);
          const newDistance = prevStar.distance + prevStar.speed;
          const newScale = 1 + newDistance / 120;
          if (
            newX < -40 ||
            newX > window.innerWidth + 40 ||
            newY < -40 ||
            newY > window.innerHeight + 40
          ) {
            return null;
          }
          return {
            ...prevStar,
            x: newX,
            y: newY,
            distance: newDistance,
            scale: newScale,
          };
        });
      }
    };

    const animationFrame = requestAnimationFrame(moveStar);
    return () => cancelAnimationFrame(animationFrame);
  }, [star]);

  return (
    <svg
      className={cn("w-full h-full absolute inset-0", className)}
    >
      {star && (
        <g opacity={star.opacity}>
          <rect
            key={star.id}
            x={star.x}
            y={star.y}
            width={starWidth * star.scale}
            height={starHeight}
            fill={`url(#${gradientId})`}
            filter={`url(#${glowId})`}
            transform={`rotate(${star.angle}, ${
              star.x + (starWidth * star.scale) / 2
            }, ${star.y + starHeight / 2})`}
          />
          <rect
            x={star.x + starWidth * star.scale * 0.6}
            y={star.y + starHeight * 0.15}
            width={starWidth * star.scale * 0.35}
            height={starHeight * 0.7}
            fill={`url(#${gradientId})`}
            transform={`rotate(${star.angle}, ${
              star.x + (starWidth * star.scale) / 2
            }, ${star.y + starHeight / 2})`}
          />
        </g>
      )}
      <defs>
        <filter id={glowId}>
          <feGaussianBlur stdDeviation="2" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: trailColor, stopOpacity: 0 }} />
          <stop offset="40%" style={{ stopColor: trailColor, stopOpacity: 0.15 }} />
          <stop offset="70%" style={{ stopColor: trailColor, stopOpacity: 0.4 }} />
          <stop offset="100%" style={{ stopColor: starColor, stopOpacity: 1 }} />
        </linearGradient>
      </defs>
    </svg>
  );
};
