import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

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
}

const WindowContext = createContext<WindowContextType | null>(null);

export function WindowProvider({ children }: { children: React.ReactNode }) {
  const [windowOrder, setWindowOrder] = useState<string[]>([]);
  const [minimizedWindows, setMinimizedWindows] = useState<string[]>([]);
  const [closedWindows, setClosedWindows] = useState<string[]>(['finder', 'textedit', 'minesweeper', 'internetexplorer', 'about', 'controlpanels']);
  const [closeListeners] = useState<Set<(id: string) => void>>(() => new Set());
  const [hasLoadedInitialState, setHasLoadedInitialState] = useState(false);

  // Load window state from localStorage on initial render
  useEffect(() => {
    const savedState = localStorage.getItem('window_state');
    if (savedState) {
      try {
        const { minimizedWindows: savedMinimized, closedWindows: savedClosed, windowOrder: savedOrder } = JSON.parse(savedState);
        if (savedMinimized) setMinimizedWindows(savedMinimized);
        if (savedClosed) setClosedWindows(savedClosed);
        if (savedOrder) setWindowOrder(savedOrder);
      } catch (error) {
        console.error('Error restoring window state:', error);
      }
    }
    setHasLoadedInitialState(true);
  }, []);

  // Save window state to localStorage whenever it changes
  useEffect(() => {
    // Only save if we've loaded the initial state, to avoid overwriting with default values
    if (hasLoadedInitialState) {
      const windowState = {
        minimizedWindows,
        closedWindows,
        windowOrder
      };
      localStorage.setItem('window_state', JSON.stringify(windowState));
    }
  }, [minimizedWindows, closedWindows, windowOrder, hasLoadedInitialState]);

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

  return (
    <WindowContext.Provider value={{ 
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
      hasLoadedInitialState
    }}>
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