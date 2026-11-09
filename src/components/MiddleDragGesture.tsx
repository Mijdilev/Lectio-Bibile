import React, { useState, useRef } from 'react';
import { useReader } from '../context/ReaderContext';

export const MiddleDragGesture: React.FC = () => {
  const { isSplit, setIsSplit } = useReader();
  const [dragX, setDragX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const startX = useRef<number>(0);

  if (isSplit) return null;

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startX.current = clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = Math.max(0, clientX - startX.current);
    setDragX(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragX > 75) {
      // Trigger split!
      setIsSplit(true);
    }
    setDragX(0);
  };

  const progress = Math.min(1, dragX / 140);
  const waveWidth = Math.min(260, dragX * 1.8);

  return (
    <div
      className="middle-drag-hitbox"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      title="Drag horizontally across the middle to split translations"
    >
      {/* Subtle indicator tab on left edge matching sketch 2 */}
      {!isDragging && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: '6px',
            height: '28px',
            backgroundColor: 'var(--text)',
            opacity: 0.18,
            borderTopRightRadius: '3px',
            borderBottomRightRadius: '3px',
            cursor: 'ew-resize'
          }}
        />
      )}

      {/* Parting wave line following the finger */}
      {isDragging && dragX > 5 && (
        <div className="middle-drag-wave">
          <svg
            width={waveWidth + 40}
            height="36"
            viewBox={`0 0 ${waveWidth + 40} 36`}
            style={{
              position: 'absolute',
              left: 0,
              top: -18,
              pointerEvents: 'none',
              overflow: 'visible'
            }}
          >
            <path
              d={`M 0 18 Q ${waveWidth * 0.25} ${18 - progress * 14}, ${waveWidth * 0.5} 18 T ${waveWidth} 18`}
              fill="none"
              stroke="var(--text)"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity={0.8}
            />
            {/* The second wave parting underneath */}
            <path
              d={`M 0 18 Q ${waveWidth * 0.25} ${18 + progress * 14}, ${waveWidth * 0.5} 18 T ${waveWidth} 18`}
              fill="none"
              stroke="var(--text)"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity={0.8}
            />
          </svg>
        </div>
      )}
    </div>
  );
};
