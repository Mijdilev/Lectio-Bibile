import React, { useRef } from 'react';
import { useReader } from '../context/ReaderContext';

export const DualScrollZone: React.FC = () => {
  const { isSplit, triggerSyncScroll } = useReader();
  const startY = useRef<number | null>(null);

  if (!isSplit) return null;

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startY.current = y;
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (startY.current === null) return;
    const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const diff = startY.current - y; // moving up scrolls down
    if (Math.abs(diff) > 2) {
      triggerSyncScroll(diff * 1.6);
      startY.current = y;
    }
  };

  const handleEnd = () => {
    startY.current = null;
  };

  return (
    <div
      className="dual-scroll-drag-zone"
      title="Drag up or down to scroll both translations together"
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
    >
      <div className="dual-scroll-tab">
        <svg width="6" height="24" viewBox="0 0 6 24" fill="none">
          <circle cx="3" cy="4" r="1.5" fill="currentColor" opacity="0.6" />
          <circle cx="3" cy="12" r="1.5" fill="currentColor" opacity="0.6" />
          <circle cx="3" cy="20" r="1.5" fill="currentColor" opacity="0.6" />
        </svg>
      </div>
    </div>
  );
};
