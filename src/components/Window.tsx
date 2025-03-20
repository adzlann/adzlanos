import { useState, useRef, useEffect, useCallback } from 'react';
import { useWindow } from '../contexts/WindowContext';

type ResizeDirection = 'e' | 'w' | 'se' | 'sw' | 's' | null;

// Constants for window boundaries
const MENU_BAR_HEIGHT = 22; // Height of the menu bar at the top of the screen

interface WindowProps {
  title: string;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  disableResize?: boolean;
  className?: string;
  id: string;
  onClose?: () => void;
}

export function Window({ 
  title, 
  children, 
  initialPosition = { x: 100, y: 60 },
  initialSize = { width: 400, height: 300 },
  disableResize = false,
  className = '',
  id,
  onClose
}: WindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const hasInitializedRef = useRef(false);
  const { 
    bringToFront, 
    getZIndex, 
    minimizeWindow, 
    isWindowMinimized, 
    isWindowOpen,
    saveWindowPosition,
    getWindowPosition
  } = useWindow();

  // Get saved position before initializing state
  const savedWindowState = getWindowPosition(id);
  
  // Initialize with saved position or default values
  const [position, setPosition] = useState(savedWindowState?.position || initialPosition);
  const [size, setSize] = useState(savedWindowState?.size || initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<ResizeDirection>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, left: 0 });
  const [windowBounds, setWindowBounds] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });

  // Function to constrain window position within desktop bounds, wrapped in useCallback
  const constrainPosition = useCallback((pos: { x: number; y: number }, windowSize: { width: number; height: number }) => {
    const { width: screenWidth, height: screenHeight } = windowBounds;
    
    // Constrain horizontally - ensure window stays fully on screen
    // Left boundary constraint
    let x = Math.max(0, pos.x);
    // Right boundary constraint
    x = Math.min(x, screenWidth - windowSize.width);
    
    // If window is wider than screen, position it at left edge
    if (windowSize.width > screenWidth) {
      x = 0;
    }
    
    // Constrain vertically - ensure window stays below menu bar and within screen
    // Top boundary constraint (menu bar)
    let y = Math.max(MENU_BAR_HEIGHT, pos.y);
    // Bottom boundary constraint
    y = Math.min(y, screenHeight - windowSize.height);
    
    // If window is taller than available space, position it just below menu bar
    if (windowSize.height > (screenHeight - MENU_BAR_HEIGHT)) {
      y = MENU_BAR_HEIGHT;
    }
    
    return { x, y };
  }, [windowBounds]);

  // Update window bounds on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowBounds({
        width: window.innerWidth,
        height: window.innerHeight
      });

      // Also constrain the window if it's now outside the bounds after resize
      const constrainedPosition = constrainPosition(position, size);
      if (constrainedPosition.x !== position.x || constrainedPosition.y !== position.y) {
        setPosition(constrainedPosition);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position, size, constrainPosition]);

  useEffect(() => {
    if (!hasInitializedRef.current) {
      bringToFront(id);
      hasInitializedRef.current = true;
    }
  }, [id, bringToFront]);

  // Save window position and size when they change and aren't the initial render
  useEffect(() => {
    if (hasInitializedRef.current) {
      saveWindowPosition(id, position, size);
    }
  }, [id, position, size, saveWindowPosition]);

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
        // Calculate new position
        const rawPosition = {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        };
        
        // Apply constraints before setting state
        const constrainedPosition = constrainPosition(rawPosition, size);
        setPosition(constrainedPosition);
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        let newWidth = size.width;
        let newHeight = size.height;
        let newX = position.x;

        // Variables for case blocks
        let potentialWidth, potentialLeft, swPotentialWidth, swPotentialLeft;

        switch (isResizing) {
          case 'e':
            // Calculate new width
            newWidth = Math.max(200, resizeStart.width + deltaX);
            // Ensure window stays within the right edge of the screen
            newWidth = Math.min(newWidth, windowBounds.width - position.x);
            break;
          case 'w':
            // Calculate potential new width and left position
            potentialWidth = Math.max(200, resizeStart.width - deltaX);
            potentialLeft = resizeStart.left + (resizeStart.width - potentialWidth);
            
            // Check if new position would be outside left edge
            if (potentialLeft < 0) {
              // Calculate maximum possible width based on current position
              newWidth = resizeStart.width + resizeStart.left;
              newX = 0;
            } else {
              newWidth = potentialWidth;
              newX = potentialLeft;
            }
            break;
          case 's':
            // Calculate new height
            newHeight = Math.max(150, resizeStart.height + deltaY);
            // Ensure window stays within the bottom edge of the screen
            newHeight = Math.min(newHeight, windowBounds.height - position.y);
            break;
          case 'se':
            // Calculate new width and height
            newWidth = Math.max(200, resizeStart.width + deltaX);
            newHeight = Math.max(150, resizeStart.height + deltaY);
            
            // Ensure window stays within the screen boundaries
            newWidth = Math.min(newWidth, windowBounds.width - position.x);
            newHeight = Math.min(newHeight, windowBounds.height - position.y);
            break;
          case 'sw':
            // Calculate potential new width and left position
            swPotentialWidth = Math.max(200, resizeStart.width - deltaX);
            swPotentialLeft = resizeStart.left + (resizeStart.width - swPotentialWidth);
            
            // Calculate new height
            newHeight = Math.max(150, resizeStart.height + deltaY);
            
            // Check if new position would be outside left edge
            if (swPotentialLeft < 0) {
              newWidth = resizeStart.width + resizeStart.left;
              newX = 0;
            } else {
              newWidth = swPotentialWidth;
              newX = swPotentialLeft;
            }
            
            // Ensure window stays within the bottom edge of the screen
            newHeight = Math.min(newHeight, windowBounds.height - position.y);
            break;
        }

        // Set new size
        setSize({ width: newWidth, height: newHeight });
        // Update position if changed
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
  }, [isDragging, isResizing, dragOffset, resizeStart, position, size, windowBounds, constrainPosition]);

  // Initial constraint check for windows loaded from localStorage
  useEffect(() => {
    // Create a flag to track whether this is the initial render
    const isInitialMount = !hasInitializedRef.current;
    
    // Only run on initial mount
    if (isInitialMount) {
      // Wait for next render cycle to ensure window dimensions are available
      const timeoutId = setTimeout(() => {
        const constrainedPosition = constrainPosition(position, size);
        if (constrainedPosition.x !== position.x || constrainedPosition.y !== position.y) {
          setPosition(constrainedPosition);
        }
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [position, size, constrainPosition, hasInitializedRef]);

  if (!isWindowOpen(id) || isWindowMinimized(id)) {
    return null;
  }

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
      onClick={(e) => {
        if ((e.target as HTMLElement).tagName !== 'INPUT' && 
            (e.target as HTMLElement).tagName !== 'TEXTAREA') {
          bringToFront(id);
        }
      }}
      data-window-id={id}
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
              minimizeWindow(id);
              if (onClose) {
                onClose();
              }
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
      <div 
        className={`absolute inset-0 top-6 font-chicago ${className}`}
        onClick={(e) => {
          // Prevent clicks on input elements from triggering window focus
          if (e.target instanceof HTMLInputElement ||
              e.target instanceof HTMLTextAreaElement ||
              e.target instanceof HTMLButtonElement ||
              e.target instanceof HTMLSelectElement) {
            e.stopPropagation();
          }
        }}
      >
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