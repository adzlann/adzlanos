import { useState, useRef, useEffect } from 'react';

type ResizeDirection = 'e' | 'w' | 'se' | 'sw' | 's' | null;

interface WindowProps {
  title: string;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  onClose: () => void;
  disableResize?: boolean;
}

export function Window({ 
  title, 
  children, 
  initialPosition = { x: 100, y: 50 },
  initialSize = { width: 400, height: 300 },
  onClose,
  disableResize = false
}: WindowProps) {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<ResizeDirection>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, left: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent, direction: ResizeDirection) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
      left: position.x
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        let newWidth = size.width;
        let newHeight = size.height;
        let newX = position.x;

        switch (isResizing) {
          case 'e':
            newWidth = Math.max(200, resizeStart.width + deltaX);
            break;
          case 'w':
            newWidth = Math.max(200, resizeStart.width - deltaX);
            newX = resizeStart.left + (resizeStart.width - newWidth);
            break;
          case 's':
            newHeight = Math.max(150, resizeStart.height + deltaY);
            break;
          case 'se':
            newWidth = Math.max(200, resizeStart.width + deltaX);
            newHeight = Math.max(150, resizeStart.height + deltaY);
            break;
          case 'sw':
            newWidth = Math.max(200, resizeStart.width - deltaX);
            newHeight = Math.max(150, resizeStart.height + deltaY);
            newX = resizeStart.left + (resizeStart.width - newWidth);
            break;
        }

        setSize({ width: newWidth, height: newHeight });
        if (newX !== position.x) {
          setPosition({ x: newX, y: position.y });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, position.y, size.height, size.width]);

  return (
    <div
      ref={windowRef}
      className="fixed bg-white border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      }}
    >
      {/* Title Bar */}
      <div 
        className="h-5 bg-[linear-gradient(90deg,_#000_50%,_#000_50%)] bg-[length:2px_2px] cursor-move flex items-center justify-between px-1"
        onMouseDown={handleMouseDown}
      >
        <div className="w-5" /> {/* Spacer for visual balance */}
        <span className="text-white text-xs font-chicago select-none">{title}</span>
        <button 
          className="w-5 h-4 bg-white border border-black text-black text-xs flex items-center justify-center leading-none hover:bg-gray-200 active:bg-gray-300"
          onClick={onClose}
        >
          ×
        </button>
      </div>

      {/* Window Content */}
      <div className="absolute inset-[21px] bottom-3">
        {children}
      </div>

      {/* Resize Handles */}
      {!disableResize && (
        <>
          <div 
            className="absolute top-5 right-0 w-2 h-[calc(100%-25px)] cursor-e-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
          />
          <div 
            className="absolute top-5 left-0 w-2 h-[calc(100%-25px)] cursor-w-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
          />
          <div 
            className="absolute bottom-0 left-2 right-2 h-2 cursor-s-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 's')}
          />
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
          />
          <div 
            className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
          />
        </>
      )}
    </div>
  );
} 