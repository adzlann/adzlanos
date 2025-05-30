import { Window } from './Window';
import { useState, useEffect, useCallback } from 'react';
import { useWindow } from '../contexts/WindowContext';

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

interface MinesweeperWindowProps {
  onClose: () => void;
  id: string;
}

export function MinesweeperWindow({ onClose, id }: MinesweeperWindowProps) {
  const GRID_SIZE = 9;
  const MINE_COUNT = 10;
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [minesLeft, setMinesLeft] = useState(MINE_COUNT);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [faceIcon, setFaceIcon] = useState('🙂');
  const { isWindowMinimized } = useWindow();

  // Initialize game board
  const initializeGrid = useCallback(() => {
    // Create empty grid
    const newGrid: Cell[][] = Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0
      }))
    );

    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < MINE_COUNT) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      if (!newGrid[y][x].isMine) {
        newGrid[y][x].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbor mines
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (!newGrid[y][x].isMine) {
          let count = 0;
          // Check all 8 neighbors
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const ny = y + dy;
              const nx = x + dx;
              if (ny >= 0 && ny < GRID_SIZE && nx >= 0 && nx < GRID_SIZE) {
                if (newGrid[ny][nx].isMine) count++;
              }
            }
          }
          newGrid[y][x].neighborMines = count;
        }
      }
    }

    return newGrid;
  }, [GRID_SIZE, MINE_COUNT]);

  // Save game state when minimized
  useEffect(() => {
    // Function to save the current game state
    const saveGameState = () => {
      // Only save if we have a valid grid
      if (grid && grid.length > 0) {
        const gameState = {
          grid,
          gameOver,
          gameWon,
          minesLeft,
          faceIcon
        };
        
        try {
          sessionStorage.setItem(`minesweeper_state_${id}`, JSON.stringify(gameState));
          console.log('Minesweeper state saved:', gameState);
        } catch (error) {
          console.error('Error saving Minesweeper state:', error);
        }
      }
    };

    // Save state when component mounts and whenever state changes
    saveGameState();

    // Also save on window beforeunload
    const handleBeforeUnload = () => saveGameState();
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Set up interval to check window state
    let minimizeState = isWindowMinimized(id);
    const intervalId = setInterval(() => {
      const newMinimizeState = isWindowMinimized(id);
      
      // If window was just minimized, save state
      if (!minimizeState && newMinimizeState) {
        saveGameState();
      }
      
      minimizeState = newMinimizeState;
    }, 100);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Save state one last time when unmounting
      saveGameState();
    };
  }, [id, grid, gameOver, gameWon, minesLeft, faceIcon, isWindowMinimized]);

  // Restore game state when component mounts or is unminimized
  useEffect(() => {
    const restoreGameState = () => {
      const savedState = sessionStorage.getItem(`minesweeper_state_${id}`);
      console.log('Attempting to restore Minesweeper state from:', savedState);
      
      if (savedState) {
        try {
          const { grid: savedGrid, gameOver: savedGameOver, gameWon: savedGameWon, 
                 minesLeft: savedMinesLeft, faceIcon: savedFaceIcon } = JSON.parse(savedState);
          
          if (savedGrid && savedGrid.length) {
            console.log('Restoring saved grid');
            setGrid(savedGrid);
            
            if (savedGameOver !== undefined) setGameOver(savedGameOver);
            if (savedGameWon !== undefined) setGameWon(savedGameWon);
            if (savedMinesLeft !== undefined) setMinesLeft(savedMinesLeft);
            if (savedFaceIcon) setFaceIcon(savedFaceIcon);
          } else {
            console.log('No valid saved grid, initializing new grid');
            setGrid(initializeGrid());
          }
        } catch (error) {
          console.error('Error restoring Minesweeper state:', error);
          // If restoration fails, initialize a new game
          setGrid(initializeGrid());
        }
      } else {
        console.log('No saved state found, initializing new grid');
        // If no saved state, initialize a new game
        setGrid(initializeGrid());
      }
    };

    // Initial state setup - only initialize grid if it's empty
    if (!grid || grid.length === 0) {
      // Restore from storage or create new
      restoreGameState();
    }

    // Also set up a listener for unminimize events
    let minimizeState = isWindowMinimized(id);
    const intervalId = setInterval(() => {
      const newMinimizeState = isWindowMinimized(id);
      
      // If window was just unminimized, restore state
      if (minimizeState && !newMinimizeState) {
        restoreGameState();
      }
      
      minimizeState = newMinimizeState;
    }, 100);

    return () => clearInterval(intervalId);
  }, [id, isWindowMinimized, grid, initializeGrid]);

  // Override resetGame to clear saved state
  const resetGame = useCallback(() => {
    setGameOver(false);
    setGameWon(false);
    setMinesLeft(MINE_COUNT);
    setFaceIcon('🙂');
    setGrid(initializeGrid());
    
    // Clear saved state when starting a new game
    sessionStorage.removeItem(`minesweeper_state_${id}`);
  }, [id, initializeGrid, MINE_COUNT]);

  // Reveal cell and its neighbors if it's empty
  const revealCell = (y: number, x: number, currentGrid: Cell[][]) => {
    if (y < 0 || y >= GRID_SIZE || x < 0 || x >= GRID_SIZE) return;
    if (currentGrid[y][x].isRevealed || currentGrid[y][x].isFlagged) return;

    currentGrid[y][x].isRevealed = true;

    if (currentGrid[y][x].neighborMines === 0) {
      // Reveal all adjacent cells
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dy === 0 && dx === 0) continue;
          revealCell(y + dy, x + dx, currentGrid);
        }
      }
    }
  };

  // Check if game is won
  const checkWin = (currentGrid: Cell[][]) => {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const cell = currentGrid[y][x];
        if (!cell.isMine && !cell.isRevealed) return false;
      }
    }
    return true;
  };

  // Handle cell click
  const handleCellClick = (y: number, x: number) => {
    if (gameOver || gameWon || grid[y][x].isFlagged) return;

    const newGrid = [...grid.map(row => [...row])];
    
    if (grid[y][x].isMine) {
      // Game over - reveal all mines
      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          if (newGrid[i][j].isMine) {
            newGrid[i][j].isRevealed = true;
          }
        }
      }
      setGameOver(true);
      setFaceIcon('😵');
    } else {
      revealCell(y, x, newGrid);
      if (checkWin(newGrid)) {
        setGameWon(true);
        setFaceIcon('😎');
      }
    }
    
    setGrid(newGrid);
  };

  // Handle right click (flag)
  const handleRightClick = (e: React.MouseEvent, y: number, x: number) => {
    e.preventDefault(); // Prevent context menu
    e.stopPropagation(); // Stop event propagation
    if (gameOver || gameWon || grid[y][x].isRevealed) return;

    const newGrid = [...grid.map(row => [...row])];
    newGrid[y][x].isFlagged = !newGrid[y][x].isFlagged;
    setGrid(newGrid);
    setMinesLeft(minesLeft + (newGrid[y][x].isFlagged ? -1 : 1));
  };

  // Get cell content
  const getCellContent = (cell: Cell) => {
    if (!cell.isRevealed && cell.isFlagged) return '🚩';
    if (!cell.isRevealed) return '';
    if (cell.isMine) return '💣';
    return cell.neighborMines === 0 ? '' : cell.neighborMines;
  };

  // Get cell color based on neighbor count
  const getCellColor = (cell: Cell) => {
    if (!cell.isRevealed || cell.isMine) return 'text-black';
    const colors = [
      'text-blue-600',   // 1
      'text-green-600',  // 2
      'text-red-600',    // 3
      'text-blue-800',   // 4
      'text-red-800',    // 5
      'text-teal-600',   // 6
      'text-black',      // 7
      'text-gray-600'    // 8
    ];
    return cell.neighborMines > 0 ? colors[cell.neighborMines - 1] : '';
  };

  return (
    <Window
      id={id}
      title="Minesweeper"
      onClose={onClose}
      initialPosition={{ x: 200, y: 100 }}
      initialSize={{ width: 320, height: 400 }}
      disableResize={true}
    >
      <div className="h-full flex flex-col bg-[#c0c0c0] p-2">
        {/* Header */}
        <div className="flex justify-between items-center bg-[#c0c0c0] p-2 border-t-2 border-l-2 border-white border-r-2 border-b-2 border-gray-600 mb-2">
          <div className="bg-black text-red-600 font-digital px-2 py-1 border-2 border-gray-600">
            {minesLeft.toString().padStart(2, '0')}
          </div>
          <button
            onClick={resetGame}
            className="bg-[#c0c0c0] w-10 h-10 flex items-center justify-center border-t-2 border-l-2 border-white border-r-2 border-b-2 border-gray-600 active:border-t-gray-600 active:border-l-gray-600 active:border-r-white active:border-b-white"
          >
            {faceIcon}
          </button>
          <div className="bg-black text-red-600 font-digital px-2 py-1 border-2 border-gray-600">
            {MINE_COUNT.toString().padStart(2, '0')}
          </div>
        </div>

        {/* Game Grid */}
        <div className="flex-1 grid grid-cols-9 gap-0 p-2 border-t-2 border-l-2 border-white border-r-2 border-b-2 border-gray-600">
          {grid.map((row, y) =>
            row.map((cell, x) => (
              <button
                key={`${y}-${x}`}
                onClick={() => handleCellClick(y, x)}
                onContextMenu={(e) => handleRightClick(e, y, x)}
                className={`aspect-square w-full flex items-center justify-center text-sm font-bold
                  ${cell.isRevealed 
                    ? 'bg-[#c0c0c0] border border-gray-400' 
                    : 'bg-[#c0c0c0] border-t-2 border-l-2 border-white border-r-2 border-b-2 border-gray-600 active:border-t-gray-600 active:border-l-gray-600 active:border-r-white active:border-b-white'
                  }
                  ${getCellColor(cell)}`}
                disabled={gameOver || gameWon}
              >
                {getCellContent(cell)}
              </button>
            ))
          )}
        </div>
      </div>
    </Window>
  );
} 