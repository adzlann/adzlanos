import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface WindowState {
  position: Position;
  size: Size;
}

interface WindowsPositionsState {
  [id: string]: WindowState;
}

interface WindowContextType {
  bringToFront: (id: string) => void;
  getZIndex: (id: string) => number;
  minimizeWindow: (id: string) => void;
  unminimizeWindow: (id: string) => void;
  isWindowMinimized: (id: string) => boolean;
  closeWindow: (id: string) => void;
  isWindowOpen: (id: string) => boolean;
  getActiveWindow: () => string | null;
  onWindowClose: (callback: (id: string) => void) => () => void;
  reopenWindow: (id: string) => void;
  hasLoadedInitialState: boolean;
  saveWindowPosition: (id: string, position: Position, size: Size) => void;
  getWindowPosition: (id: string) => WindowState | null;
}

const WindowContext = createContext<WindowContextType | null>(null);

// Helper function to safely parse JSON
const safeParseJSON = <T,>(json: string | null, defaultValue: T): T => {
  if (!json) return defaultValue;
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return defaultValue;
  }
};

export function WindowProvider({ children }: { children: React.ReactNode }) {
  // Load initial state from localStorage immediately (not in an effect)
  const savedPositions = safeParseJSON<WindowsPositionsState>(
    localStorage.getItem('window_positions'), 
    {}
  );
  
  const savedState = safeParseJSON<{
    minimizedWindows: string[],
    closedWindows: string[],
    windowOrder: string[]
  }>(
    localStorage.getItem('window_state'),
    {
      minimizedWindows: [],
      closedWindows: ['finder', 'textedit', 'minesweeper', 'internetexplorer', 'about', 'controlpanels'],
      windowOrder: []
    }
  );

  const [windowOrder, setWindowOrder] = useState<string[]>(savedState.windowOrder || []);
  const [minimizedWindows, setMinimizedWindows] = useState<string[]>(savedState.minimizedWindows || []);
  const [closedWindows, setClosedWindows] = useState<string[]>(savedState.closedWindows || ['finder', 'textedit', 'minesweeper', 'internetexplorer', 'about', 'controlpanels']);
  const [windowPositions, setWindowPositions] = useState<WindowsPositionsState>(savedPositions);
  const [closeListeners] = useState<Set<(id: string) => void>>(() => new Set());
  const hasLoadedInitialState = true;

  // Save window state to localStorage whenever it changes
  useEffect(() => {
    const windowState = {
      minimizedWindows,
      closedWindows,
      windowOrder
    };
    localStorage.setItem('window_state', JSON.stringify(windowState));
  }, [minimizedWindows, closedWindows, windowOrder]);

  // Save window positions to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(windowPositions).length > 0) {
      localStorage.setItem('window_positions', JSON.stringify(windowPositions));
    }
  }, [windowPositions]);

  const saveWindowPosition = useCallback((id: string, position: Position, size: Size) => {
    setWindowPositions(prev => {
      const newPositions = {
        ...prev,
        [id]: { position, size }
      };
      // Immediately save to localStorage for redundancy
      localStorage.setItem('window_positions', JSON.stringify(newPositions));
      return newPositions;
    });
  }, []);

  const getWindowPosition = useCallback((id: string): WindowState | null => {
    return windowPositions[id] || null;
  }, [windowPositions]);

  const bringToFront = useCallback((id: string) => {
    setWindowOrder(prev => {
      // If the window is already at the front, don't update
      if (prev[prev.length - 1] === id) {
        return prev;
      }
      
      // Otherwise, move it to the front
      const newOrder = prev.filter(windowId => windowId !== id);
      return [...newOrder, id];
    });
  }, []);

  const getZIndex = useCallback((id: string) => {
    const index = windowOrder.indexOf(id);
    return index === -1 ? 0 : index + 1;
  }, [windowOrder]);

  const minimizeWindow = useCallback((id: string) => {
    setMinimizedWindows(prev => [...prev, id]);
  }, []);

  const unminimizeWindow = useCallback((id: string) => {
    setMinimizedWindows(prev => prev.filter(windowId => windowId !== id));
    bringToFront(id);
  }, [bringToFront]);

  const isWindowMinimized = useCallback((id: string) => {
    return minimizedWindows.includes(id);
  }, [minimizedWindows]);

  const closeWindow = useCallback((id: string) => {
    setClosedWindows(prev => [...prev, id]);
    setMinimizedWindows(prev => prev.filter(windowId => windowId !== id));
    setWindowOrder(prev => prev.filter(windowId => windowId !== id));
    closeListeners.forEach(listener => listener(id));
  }, [closeListeners]);

  const isWindowOpen = useCallback((id: string) => {
    return !closedWindows.includes(id);
  }, [closedWindows]);

  const getActiveWindow = useCallback(() => {
    // Return the topmost non-minimized window
    for (let i = windowOrder.length - 1; i >= 0; i--) {
      const id = windowOrder[i];
      if (!minimizedWindows.includes(id)) {
        return id;
      }
    }
    return null;
  }, [windowOrder, minimizedWindows]);

  const onWindowClose = useCallback((callback: (id: string) => void) => {
    closeListeners.add(callback);
    return () => {
      closeListeners.delete(callback);
    };
  }, [closeListeners]);

  const reopenWindow = useCallback((id: string) => {
    setClosedWindows(prev => prev.filter(windowId => windowId !== id));
    bringToFront(id);
  }, [bringToFront]);

  const contextValue = useMemo(() => ({
    bringToFront, 
    getZIndex, 
    minimizeWindow, 
    unminimizeWindow, 
    isWindowMinimized,
    closeWindow,
    isWindowOpen,
    getActiveWindow,
    onWindowClose,
    reopenWindow,
    hasLoadedInitialState,
    saveWindowPosition,
    getWindowPosition
  }), [
    bringToFront,
    getZIndex,
    minimizeWindow,
    unminimizeWindow,
    isWindowMinimized,
    closeWindow,
    isWindowOpen,
    getActiveWindow,
    onWindowClose,
    reopenWindow,
    hasLoadedInitialState,
    saveWindowPosition,
    getWindowPosition
  ]);

  return (
    <WindowContext.Provider value={contextValue}>
      {children}
    </WindowContext.Provider>
  );
}

export function useWindow() {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error('useWindow must be used within a WindowProvider');
  }
  return context;
} 