'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface GameViewportMetrics {
  viewportWidth: number;
  viewportHeight: number;
  availableWidth: number;
  availableHeight: number;
  scale: number;
  aspectRatio: number;
  orientation: 'landscape' | 'portrait';
  isFullscreen: boolean;
  isMobile: boolean;
  safeAreaTop: number;
  safeAreaBottom: number;
}

const DEFAULT_METRICS: GameViewportMetrics = {
  viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1280,
  viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 720,
  availableWidth: 1024,
  availableHeight: 576,
  scale: 1,
  aspectRatio: 16 / 9,
  orientation: 'landscape',
  isFullscreen: false,
  isMobile: false,
  safeAreaTop: 0,
  safeAreaBottom: 0,
};

export const GameViewportContext = createContext<GameViewportMetrics | null>(null);

export function useGameViewport(): GameViewportMetrics {
  const ctx = useContext(GameViewportContext);
  return ctx || DEFAULT_METRICS;
}

interface ViewportTrackerOptions {
  containerRef?: React.RefObject<HTMLElement | null>;
  baseWidth?: number;
  baseHeight?: number;
  forceFullscreenState?: boolean;
}

export function useTrackGameViewport(options: ViewportTrackerOptions = {}): {
  metrics: GameViewportMetrics;
  isFullscreen: boolean;
  toggleFullscreen: () => Promise<void>;
  requestFullscreen: () => Promise<void>;
  exitFullscreen: () => Promise<void>;
} {
  const { containerRef, baseWidth = 960, baseHeight = 540, forceFullscreenState } = options;

  const [metrics, setMetrics] = useState<GameViewportMetrics>(DEFAULT_METRICS);
  const [internalFullscreen, setInternalFullscreen] = useState(false);
  const [cssFullscreen, setCssFullscreen] = useState(false);

  // Determine actual fullscreen state
  const isFullscreen = forceFullscreenState !== undefined
    ? forceFullscreenState
    : (internalFullscreen || cssFullscreen);

  // Sync fullscreen state with DOM
  useEffect(() => {
    const checkFullscreen = () => {
      const fsEl =
        typeof document !== 'undefined'
          ? document.fullscreenElement ||
            (document as any).webkitFullscreenElement ||
            (document as any).mozFullScreenElement ||
            (document as any).msFullscreenElement
          : null;

      // Check if document or the active container is fullscreen
      const isFS = !!fsEl;
      setInternalFullscreen(isFS);
      if (!isFS && !cssFullscreen) {
        // Exited DOM fullscreen
      }
    };

    checkFullscreen();

    document.addEventListener('fullscreenchange', checkFullscreen);
    document.addEventListener('webkitfullscreenchange', checkFullscreen);
    document.addEventListener('mozfullscreenchange', checkFullscreen);
    document.addEventListener('MSFullscreenChange', checkFullscreen);

    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreen);
      document.removeEventListener('webkitfullscreenchange', checkFullscreen);
      document.removeEventListener('mozfullscreenchange', checkFullscreen);
      document.removeEventListener('MSFullscreenChange', checkFullscreen);
    };
  }, [cssFullscreen]);

  // Update layout and dimensions with ResizeObserver and window listeners
  useEffect(() => {
    let animationFrameId: number;

    const updateDimensions = () => {
      if (typeof window === 'undefined') return;

      const vpW = window.innerWidth;
      const vpH = window.innerHeight;

      let availW = vpW;
      let availH = vpH;

      if (containerRef && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          availW = Math.round(rect.width);
          availH = Math.round(rect.height);
        }
      } else if (!isFullscreen) {
        availW = Math.min(vpW, 1024);
        availH = Math.min(vpH, 580);
      }

      const orientation: 'landscape' | 'portrait' = availW >= availH ? 'landscape' : 'portrait';
      const aspectRatio = availH > 0 ? availW / availH : 16 / 9;

      // Scale relative to baseline dimensions
      const scaleX = availW / baseWidth;
      const scaleY = availH / baseHeight;
      const scale = Math.max(0.5, Math.min(scaleX, scaleY));

      const isMobile =
        vpW <= 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          typeof navigator !== 'undefined' ? navigator.userAgent : ''
        );

      setMetrics({
        viewportWidth: vpW,
        viewportHeight: vpH,
        availableWidth: availW,
        availableHeight: availH,
        scale,
        aspectRatio,
        orientation,
        isFullscreen,
        isMobile,
        safeAreaTop: 0,
        safeAreaBottom: 0,
      });
    };

    const handleResize = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(updateDimensions);
    };

    updateDimensions();

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef && containerRef.current) {
      observer = new ResizeObserver(() => handleResize());
      observer.observe(containerRef.current);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (observer) observer.disconnect();
    };
  }, [containerRef, baseWidth, baseHeight, isFullscreen]);

  // Safe requestFullscreen
  const requestFullscreen = async () => {
    const target = (containerRef && containerRef.current) || document.documentElement;
    if (!target) return;

    try {
      if (target.requestFullscreen) {
        await target.requestFullscreen();
      } else if ((target as any).webkitRequestFullscreen) {
        await (target as any).webkitRequestFullscreen();
      } else if ((target as any).mozRequestFullScreen) {
        await (target as any).mozRequestFullScreen();
      } else if ((target as any).msRequestFullscreen) {
        await (target as any).msRequestFullscreen();
      } else {
        // Fallback for iOS Safari or restricted environments
        setCssFullscreen(true);
      }
    } catch {
      // In case of permission errors or older mobile browsers, fallback to CSS fullscreen
      setCssFullscreen(true);
    }
  };

  // Safe exitFullscreen
  const exitFullscreen = async () => {
    setCssFullscreen(false);
    try {
      if (document.exitFullscreen && document.fullscreenElement) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen && (document as any).webkitFullscreenElement) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen && (document as any).mozFullScreenElement) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen && (document as any).msFullscreenElement) {
        await (document as any).msExitFullscreen();
      }
    } catch {
      // ignore
    }
  };

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      await exitFullscreen();
    } else {
      await requestFullscreen();
    }
  };

  return {
    metrics,
    isFullscreen,
    toggleFullscreen,
    requestFullscreen,
    exitFullscreen,
  };
}
