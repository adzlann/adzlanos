import React, { createContext, useContext, useState, useCallback } from 'react';

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
}

const WindowContext = createContext<WindowContextType | null>(null);

export function WindowProvider({ children }: { children: React.ReactNode }) {
  const [windowOrder, setWindowOrder] = useState<string[]>([]);
  const [minimizedWindows, setMinimizedWindows] = useState<string[]>([]);
  const [closedWindows, setClosedWindows] = useState<string[]>([]);
  const [closeListeners] = useState<Set<(id: string) => void>>(() => new Set());

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
      reopenWindow
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