import React, { createContext, useContext, useState, useCallback } from 'react';

interface WindowContextType {
  bringToFront: (id: string) => void;
  getZIndex: (id: string) => number;
}

const WindowContext = createContext<WindowContextType | null>(null);

export function WindowProvider({ children }: { children: React.ReactNode }) {
  const [windowOrder, setWindowOrder] = useState<string[]>([]);

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

  return (
    <WindowContext.Provider value={{ bringToFront, getZIndex }}>
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