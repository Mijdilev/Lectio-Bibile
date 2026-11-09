import React, { useRef } from 'react';
import { useReader } from '../context/ReaderContext';

interface SplitDividerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const SplitDivider: React.FC<SplitDividerProps> = ({ containerRef }) => {
  const { splitRatio, setSplitRatio, setIsSplit } = useReader();
  const draggingRef = useRef<boolean>(false);

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    draggingRef.current = true;
    e.stopPropagation();
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!draggingRef.current || !containerRef.current) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const percentage = (relativeY / rect.height) * 100;

    // Dragging divider away closes the split
    if (percentage < 18 || percentage > 85) {
      setIsSplit(false);
      draggingRef.current = false;
      return;
    }

    setSplitRatio(percentage);
  };

  const handleEnd = () => {
    draggingRef.current = false;
  };

  return (
    <div
      className="split-divider"
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      title="Drag divider to resize or drag to edge to close split"
    >
      <div className="split-divider-line" />
      <div className="split-divider-handle" />
    </div>
  );
};
