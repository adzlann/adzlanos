import { useState, useRef, useEffect } from 'react';
import { useWindow } from '../contexts/WindowContext';

type ResizeDirection = 'e' | 'w' | 'se' | 'sw' | 's' | null;

interface WindowProps {
  title: string;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  onClose: () => void;
  disableResize?: boolean;
  className?: string;
  id: string;
}

export function Window({ 
  title, 
  children, 
  initialPosition = { x: 100, y: 60 },
  initialSize = { width: 400, height: 300 },
  onClose,
  disableResize = false,
  className = '',
  id
}: WindowProps) {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<ResizeDirection>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, left: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const hasInitializedRef = useRef(false);
  const { bringToFront, getZIndex } = useWindow();

  useEffect(() => {
    if (!hasInitializedRef.current) {
      bringToFront(id);
      hasInitializedRef.current = true;
    }
  }, [id, bringToFront]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      bringToFront(id);
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
  }, [isDragging, isResizing, dragOffset, resizeStart, position.y, position.x, size.height, size.width]);

  return (
    <div
      ref={windowRef}
      className="fixed bg-[#E6E6E6] border border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: getZIndex(id),
      }}
      onClick={() => bringToFront(id)}
    >
      {/* Title Bar */}
      <div 
        className="h-6 bg-[#E6E6E6] border-b border-black cursor-move flex items-center px-1 relative overflow-hidden"
        onMouseDown={handleMouseDown}
      >
        {/* Background lines - positioned to avoid close button */}
        <div className="absolute inset-0 pointer-events-none" style={{ left: '32px' }}>
          {/* Lines with significant padding to show only in middle */}
          <div className="w-full h-full flex items-center pointer-events-none">
            <div className="w-full h-[14px] bg-[linear-gradient(0deg,_#000_1px,_transparent_1px)] bg-[length:100%_2px]" />
          </div>
        </div>

        {/* Close button area with clean background */}
        <div className="z-10 bg-[#E6E6E6] relative">
          <button 
            className="w-5 h-4 bg-white border border-black text-black text-base font-chicago flex items-center justify-center leading-none hover:bg-gray-200 active:bg-gray-300 mr-2"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          />
        </div>

        {/* Title with clean background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Title text with clean background */}
          <div className="z-10 px-4 bg-[#E6E6E6]">
            <span className="font-chicago text-base select-none">{title}</span>
          </div>
        </div>

        {/* Spacer for proper layout */}
        <div className="flex-1" />
      </div>

      {/* Window Content */}
      <div className={`absolute inset-0 top-6 font-chicago ${className}`}>
        {children}
      </div>

      {/* Resize Handles */}
      {!disableResize && (
        <>
          <div 
            className="absolute top-6 right-0 w-2 h-[calc(100%-30px)] cursor-e-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
          />
          <div 
            className="absolute top-6 left-0 w-2 h-[calc(100%-30px)] cursor-w-resize"
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