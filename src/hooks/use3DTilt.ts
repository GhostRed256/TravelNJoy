import { useState, useCallback, useEffect, MouseEvent, CSSProperties } from 'react';

export interface Use3DTiltOptions {
  maxTiltDeg?: number;
  scale?: number;
  perspective?: number;
  speed?: number;
}

export interface Use3DTiltReturn {
  style: CSSProperties;
  onMouseMove: (e: MouseEvent<HTMLElement>) => void;
  onMouseLeave: () => void;
  isHovered: boolean;
}

export function use3DTilt({
  maxTiltDeg = 12,
  scale = 1.03,
  perspective = 1000,
  speed = 500,
}: Use3DTiltOptions = {}): Use3DTiltReturn {
  const [isHoverable, setIsHoverable] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hoverQuery = window.matchMedia('(hover: hover)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    setIsHoverable(hoverQuery.matches);
    setReducedMotion(motionQuery.matches);

    const handleHoverChange = (e: MediaQueryListEvent) => setIsHoverable(e.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);

    if (hoverQuery.addEventListener) {
      hoverQuery.addEventListener('change', handleHoverChange);
    } else {
      hoverQuery.addListener(handleHoverChange);
    }

    if (motionQuery.addEventListener) {
      motionQuery.addEventListener('change', handleMotionChange);
    } else {
      motionQuery.addListener(handleMotionChange);
    }

    return () => {
      if (hoverQuery.removeEventListener) {
        hoverQuery.removeEventListener('change', handleHoverChange);
      } else {
        hoverQuery.removeListener(handleHoverChange);
      }
      if (motionQuery.removeEventListener) {
        motionQuery.removeEventListener('change', handleMotionChange);
      } else {
        motionQuery.removeListener(handleMotionChange);
      }
    };
  }, []);

  const [style, setStyle] = useState<CSSProperties>({
    transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
    transition: `transform ${speed}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
    transformStyle: 'preserve-3d',
  });

  const onMouseMove = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      setIsHovered(true);

      if (!isHoverable || reducedMotion) {
        setStyle({
          transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
          transition: `transform ${speed}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
          transformStyle: 'preserve-3d',
        });
        return;
      }

      const element = e.currentTarget;
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = Number((((y - centerY) / centerY) * -maxTiltDeg).toFixed(2));
      const rotateY = Number((((x - centerX) / centerX) * maxTiltDeg).toFixed(2));

      setStyle({
        transform: `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`,
        transition: 'transform 100ms ease-out',
        transformStyle: 'preserve-3d',
      });
    },
    [isHoverable, reducedMotion, maxTiltDeg, perspective, scale, speed]
  );

  const onMouseLeave = useCallback(() => {
    setIsHovered(false);
    setStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: `transform ${speed}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
      transformStyle: 'preserve-3d',
    });
  }, [perspective, speed]);

  return { style, onMouseMove, onMouseLeave, isHovered };
}
